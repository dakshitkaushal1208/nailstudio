# Cute Icles by Mehak Dhiman — Backend

Spring Boot 3.3 · Java 21 · MySQL 8 · Flyway · JWT in an HttpOnly cookie · Swagger UI.
It implements the API the existing React frontend (`xano-fe`) already calls.

> **Honest status.** All source was written and checked for consistency, but **I could not run Maven here (no access to Maven Central), so nothing has run against real Spring, MySQL or H2.** See "What was verified" at the bottom before trusting any claim. The first thing to do on your machine is `mvn verify`.

## 1. Install once (Windows)

1. **Java 21 JDK** (e.g. Eclipse Temurin 21). Check: `java -version`
2. **Maven 3.9+**. Check: `mvn -v`
3. **MySQL 8**. Create the database and user (replace the password):

```sql
CREATE DATABASE cute_icles_app CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'cuteicles'@'localhost' IDENTIFIED BY 'choose-a-password';
GRANT ALL PRIVILEGES ON cute_icles_app.* TO 'cuteicles'@'localhost';
```

## 2. Run (PowerShell, from this folder)

```powershell
$env:DB_PASSWORD      = "choose-a-password"
$env:ADMIN_EMAIL      = "owner@your-domain.example"     # becomes the first ADMIN account
$env:ADMIN_PASSWORD   = "a-long-unique-password-12+"    # you choose it; never share it
$env:FRONTEND_ORIGINS = "http://localhost:5173"
mvn spring-boot:run
```

* Tables are created by Flyway on first start. The `dev` profile (default) also adds the 5 sample services and 8 demo products from the frontend, and **no** customer accounts.
* API: <http://localhost:8080/api> · Swagger: <http://localhost:8080/swagger-ui.html> · Health: <http://localhost:8080/actuator/health>
* In `dev`, password-reset codes are written to `./dev-outbox/*.txt` instead of email (never to logs).

Frontend (`xano-fe`): set `VITE_API_BASE_URL=http://localhost:8080/api`, turn off the mock flags for the parts you want real (see checklist), then `npm run dev`.

## 3. Tests

```powershell
mvn test      # unit tests (slot calculator, pricing, status rules, image validation)
mvn verify    # also the integration tests on H2 (ApiFlowIT)
```

## 4. Production

`$env:SPRING_PROFILES_ACTIVE="prod"`, and set `JWT_SECRET` (32+ random chars), `COOKIE_SECURE=true` (HTTPS only), `FRONTEND_ORIGINS`, `DB_*`, `UPLOAD_DIR` (a persistent disk). In `prod` Swagger is off, test payments are off, tokens are not returned in bodies and the seed is not loaded. Put it behind HTTPS (reverse proxy).

## 5. Endpoints

Auth is a `ci_session` HttpOnly, SameSite=Lax cookie. For Swagger/PowerShell you can also send `Authorization: Bearer <token>` (the token is only returned in the body in `dev`). Every id is a string. Lists are plain arrays; add `?page=0&size=20` to get `{content,page,size,totalElements,totalPages}`.
Errors: `{timestamp,status,error,message,errors:{field:message}}` — 422 for validation, 409 for conflicts.

| Area | Endpoint | Access |
|---|---|---|
| Auth | `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/change-password`; `GET/PATCH(PUT) /auth/me` | public / user |
| Settings | `GET /settings`; `GET/PUT /admin/settings` | public / admin |
| Services | `GET /services`, `/services/{id}`, `/services/slug/{slug}`; admin `POST/PUT/PATCH(status)/DELETE /services…` | public / admin |
| Availability | `GET /availability/days?from&to`, `/availability/slots?date&serviceId`; `GET/PUT /admin/availability` | public / admin |
| Appointments | `POST /appointments`, `GET /appointments/my`, `GET /appointments/{id}`, `POST /appointments/{id}/cancel`; admin `GET /admin/appointments?status&date`, `PATCH /admin/appointments/{id}` | user / admin |
| Gallery | `GET /gallery`, `/gallery/categories`; admin `POST /gallery/upload`, `POST/PUT/DELETE /gallery[/{id}]`, `PATCH /gallery/reorder` (same under `/admin/gallery`) | public / admin |
| Products | `GET /products?search&category&shape&sort&availableOnly&ids`, `/products/{idOrSlug}`; admin `GET/POST/PUT/PATCH /admin/products[/{id}]`, `POST /admin/products/{id}/variants/{vid}/adjust` | public / admin |
| Cart | `GET/DELETE /cart`, `PUT /cart/items {variantId,quantity}` | user |
| Orders | `POST /orders` (header `Idempotency-Key`), `GET /orders/my`, `GET /orders/{id}`, `POST /orders/{id}/cancel`; admin `GET /admin/orders?status&paymentStatus&search`, `PATCH /admin/orders/{id}` | user / admin |
| Dashboard | `GET /admin/overview` | admin |

Every `/api/admin/**` route requires the ADMIN role, checked on the server from the database (not from the token or the URL alone). Everything not listed as public needs a valid session.

### Order statuses (frontend names → brief names)
PLACED=pending · CONFIRMED=confirmed · PACKING=processing · DISPATCHED=shipped · DELIVERED=delivered · CANCELLED=cancelled · REJECTED=declined. Payment: UNPAID / PAID / REFUNDED.

## 6. Design notes

* **No double booking:** each booking/cancel/status change first takes a database row lock on the settings row, then re-checks the calendar, so two simultaneous requests for one slot cannot both succeed. Pending and approved bookings hold the slot; buffer minutes and number of chairs come from settings.
* **No overselling:** stock is taken with `UPDATE … SET stock = stock - n WHERE id = ? AND stock >= n`; if any line fails the whole order rolls back. Rejecting/cancelling returns stock (once; the order row is locked).
* **Idempotent orders:** a repeated `Idempotency-Key` returns the original order (unique per user+key).
* **Prices and totals are computed on the server** from the catalogue and settings; the delivery fee is `null` ("to be confirmed") until the studio sets a charge.
* **Payments:** `COD` (default, stays UNPAID until the studio records receipt) and `TEST` (dev only, references prefixed `TEST-`, moves no money). No real gateway is integrated; a real one would be another `PaymentProvider` confirmed by a signed provider webhook, never by the browser.
* **Security:** BCrypt (strength 11); per-user lockout; in-memory rate limit on auth routes (single instance only — use a gateway/Redis if you scale out); reset by emailed 6-digit code: stored only as a keyed HMAC, 10-minute expiry, 5 wrong guesses then dead, single-use, one code per user per minute, same response whether or not the email exists; logout/password change revoke sessions; Origin check on cookie-authenticated writes; uploads validated by file signature (JPEG/PNG/WebP/GIF only), random names, size limit.
* Product form saves set stock directly (last writer wins); use the `adjust` endpoint for atomic, audited stock changes.
* Services/products that are referenced by bookings/orders are deactivated instead of deleted.

## 7. Frontend integration checklist

- [ ] `API_BASE_URL` points at `http://localhost:8080/api`; requests use `credentials: 'include'`.
- [ ] Turn on real mode per area (auth, services, availability, appointments, gallery, products, orders, admin) one at a time.
- [ ] Remove `customerId` from booking calls (identity comes from the cookie). The backend ignores it.
- [ ] Admin appointment status sends `adminNote`; the backend accepts `note` or `adminNote`.
- [x] Forgot-password page (`/forgot-password`) is built: `POST /auth/forgot-password {email}` then `POST /auth/reset-password {email,code,newPassword}`.
- [ ] Gallery reorder: call `PATCH /admin/gallery/reorder {ids:[…]}` (currently shows "not implemented").
- [ ] Send an `Idempotency-Key` header (e.g. `crypto.randomUUID()` per checkout) with `POST /orders`.
- [ ] Gallery categories: read from `GET /gallery/categories`.

## 8. What was verified (and what was not)

| Item | State |
|---|---|
| Slot calculator logic (26 checks), pricing/status rules (14), image signature check (8) | **Run and passing** as plain Java |
| All Java sources compile against hand-written stand-ins for Spring/JPA/Jakarta types | **Run, passes** — proves internal consistency only |
| Real Maven build, JUnit tests, `ApiFlowIT`, Flyway on MySQL, JPA mappings/queries, Spring Security rules, multipart upload, Swagger | **Not run** (no Maven Central access). Expect to fix small issues on first `mvn verify`. |
| Email sending, MySQL deployment, HTTPS, real payments | **Needs your external setup** / not implemented |
