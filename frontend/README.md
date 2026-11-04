# Nail Studio — frontend (React + Vite)

    npm install
    npm run dev        # http://localhost:5173
    npm run build

Runs in **mock mode** by default (`VITE_USE_MOCK=true`): sample data lives in the browser's localStorage and nothing is sent to a server. Sample sign-ins are shown on the login page (customer and owner).
Set `VITE_USE_MOCK=false` and `VITE_API_BASE_URL` (see `.env.example`) to call a Spring Boot API; endpoint paths are in `src/config.js`, all calls in `src/services/`.

Replace before launch: studio name, contact details, services/prices, product and gallery images (`src/data/assets.js`, or via the admin), policy wording (Admin → Settings, privacy/terms in `src/pages/LegalPage.jsx`).
The sample images in `public/images/sample` are drawn placeholders, not the studio's work.
