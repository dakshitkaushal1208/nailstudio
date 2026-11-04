# nailStudio

Full-stack nail studio application with a React/Vite frontend and Spring Boot backend.

## Repository layout

- `frontend/` — React 18 + Vite application
- `backend/` — Spring Boot 3.3.5 / Java 21 REST API

## Local development

### Frontend

1. Open a terminal in `frontend/`.
2. Run `npm ci`.
3. Copy `.env.example` to `.env.local` and configure it for the mode you want.
4. Run `npm run dev`.

The frontend's example configuration starts in mock mode. For real API integration, set `VITE_USE_MOCK=false` and set `VITE_API_BASE_URL` to the backend API base URL, ending in `/api`.

### Backend

1. Install JDK 21, Maven 3.9+, and MySQL 8.
2. Create a dedicated database and database user. Do not use the MySQL root account for the application.
3. Set the backend environment variables described in `backend/.env.example` in your shell or IDE run configuration. Never commit real values.
4. From `backend/`, run `mvn verify`, then `mvn spring-boot:run`.

Flyway migrations are in `backend/src/main/resources/db/migration/`.

## Deployment

Step-by-step hosting instructions are in [`DEPLOY.md`](DEPLOY.md). CI (`.github/workflows/ci.yml`) builds the frontend and runs the backend tests on every push.

## Before production deployment

- Configure a managed production MySQL database and import/migrate data deliberately.
- Set `SPRING_PROFILES_ACTIVE=prod`, a unique `JWT_SECRET` (at least 32 random characters), `COOKIE_SECURE=true`, database credentials, allowed frontend origins, and a persistent upload location.
- Configure the frontend's `VITE_API_BASE_URL` to the deployed HTTPS backend URL plus `/api`.
- Verify cookie-based authentication across the deployed frontend/backend origins, CORS, booking/order flows, uploads, email reset, and admin bootstrap.
- Configure persistent storage for uploaded gallery images. Runtime uploads are intentionally excluded from Git.
- Do not enable real payment processing until a real payment provider and signed webhook flow are implemented and tested.

## Important status note

The backend's original README states that its Maven build and database integration were not verified when that README was written. Run `mvn verify` locally and resolve any failures before production deployment. A successful Vercel frontend deployment alone does not deploy the Spring Boot API or MySQL database.
