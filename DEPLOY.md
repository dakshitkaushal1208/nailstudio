# Deploying nailStudio

You need three things running: **MySQL 8**, the **backend** (Spring Boot) and the **frontend** (static site).
GitHub only stores the code; it does not run the backend or the database. Hosting names below are examples; any host that runs Docker + MySQL works.

## 1. Put the code on GitHub
1. Extract the zip. Create a new **private** repository on GitHub (private is safest while you set things up).
2. In the extracted `nailStudio` folder:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
3. Open the repo's **Actions** tab. The `CI` workflow builds the frontend and runs `mvn verify` for the backend. **Fix any red failure before deploying** (the backend tests had never been run before this).
4. Check `git status` shows no `.env` file: secrets must never be committed (`.gitignore` already blocks them).

## 2. Database (MySQL 8)
Create a MySQL 8 database with its own user (not root). Managed options: Railway MySQL, Aiven, DigitalOcean, AWS RDS. Note host, port, database name, user, password.
Tables are created automatically by Flyway on the first backend start. The production build starts **empty** (no demo services/products); add them in the admin panel.

## 3. Backend (Docker, e.g. Render "Web Service")
- Root directory: `backend`, runtime: **Docker** (uses `backend/Dockerfile`).
- Health check path: `/actuator/health`
- Attach a **persistent disk** mounted at `/data/uploads` (otherwise uploaded gallery images disappear on every deploy).
- Environment variables:

| Name | Value |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` (already default in the Docker image) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` | from step 2 |
| `JWT_SECRET` | 48+ random characters (e.g. `openssl rand -hex 32`). Keep it secret. |
| `COOKIE_SECURE` | `true` |
| `FRONTEND_ORIGINS` | your frontend address, e.g. `https://your-site.vercel.app` (no trailing slash; comma-separate several) |
| `FRONTEND_ORIGIN_PRIMARY` | same main frontend address (used in password-reset emails) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | your own admin login (password 12+ chars with upper, lower, digit, symbol). Created on first start only. |
| `UPLOAD_DIR` | `/data/uploads` (already default in the image) |
| `EMAIL_ENABLED` | `true` (needed for the password-reset code email, see step 3b) |
| `EMAIL_FROM` | the sender address, e.g. `Cute Icles <yourname@gmail.com>` |
| `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT` | e.g. `smtp.gmail.com`, `587` |
| `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD` | your SMTP login (for Gmail: an **App Password**, not your normal password) |

If the app fails at startup, read the first exception in the logs: a missing `JWT_SECRET` or `FRONTEND_ORIGINS` is refused on purpose.
### 3b. Email for the password-reset code
Forgot password → the customer enters their email → the server emails a **6-digit code** (valid 10 minutes, 5 wrong tries then it is cancelled, one new code per minute, works once) → they enter the code and a new password; all their logged-in devices are signed out.
It only works if SMTP is configured (variables above). Gmail: turn on 2-step verification, then create an App Password at myaccount.google.com/apppasswords and paste it into `SPRING_MAIL_PASSWORD` **in the hosting dashboard only**. Brevo, Resend, Mailgun and Zoho also offer free SMTP. If you skip this, the code is never delivered and customers cannot reset passwords (the backend log shows a warning at startup).

Visit `https://<backend>/actuator/health` → `{"status":"UP"}`.

## 4. Frontend (Vercel / Netlify / Cloudflare Pages)
- Root directory: `frontend`, build command `npm run build`, output directory `dist`.
- Environment variables (set **before** building):
  - `VITE_USE_MOCK` = `false`  ← without this the site runs on fake demo data with public demo logins
  - `VITE_API_BASE_URL` = `https://<your-backend>/api`
- `vercel.json` (SPA routing + security headers) and `public/_redirects` (Netlify/Cloudflare) are included.

## 5. Login cookies across two domains (important)
The login cookie is `HttpOnly` + `SameSite=Lax`. Browsers only send it to the backend when both are the **same site**:
- **Best:** custom domain with subdomains, e.g. `www.example.com` (frontend) and `api.example.com` (backend). Nothing else to change.
- **Different sites** (e.g. `*.vercel.app` + `*.onrender.com`): also set backend env `APP_JWT_COOKIE_SAME_SITE=None` (needs `COOKIE_SECURE=true`). Some browsers block third-party cookies, so a custom domain is more reliable.

## 6. After the first deploy: checklist
- [ ] Log in with the admin email/password from step 3, then create services, products and gallery items.
- [ ] Register a normal customer account; confirm it cannot open `/admin`.
- [ ] Book an appointment and place a test order (COD) end to end.
- [ ] Gallery upload survives a backend redeploy (disk mounted).
- [ ] Browser console shows no Content-Security-Policy errors (if your images or API are blocked, adjust `vercel.json`).
- [ ] Test **Forgot password** with a real customer email: the 6-digit code must arrive (check spam), and the new password must work.
- [ ] Rotate `JWT_SECRET`/DB password if they were ever pasted anywhere public.
