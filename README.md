# IELTS Writing Task 2 AI Scorer

Phase 1 trims the platform down to a single goal: help learners submit IELTS Writing Task 2 essays and receive instant AI feedback.

## What’s Included

- 🔐 **Auth** – JWT-based register/login endpoints plus a lightweight React auth context.
- 📊 **Dashboard** – shows user info, submission count, average band and the last few essays.
- ✍️ **Writing submissions** – React form that posts Task 2 responses to the API and displays AI scores.
- 🤖 **AI scoring API** – Express route that calls OpenAI (or a fallback) via `aiScoringService`.
- 🗄️ **Models** – `User` and `WritingSubmission` (all other legacy models/routes were removed).

## Tech Stack

- **Backend**: Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, OpenAI SDK.
- **Frontend**: React 18, Vite, React Router, Axios, Tailwind CSS.

## Repository Layout

```
ielts-platform/
├── client/            # Vite + React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── lib/
│   │   └── pages/     # Dashboard, Login, Register, WritingTask
├── server/            # Express API
│   ├── ai/writing/    # Placeholder for future writing utilities
│   ├── middleware/
│   ├── models/        # User, WritingSubmission
│   └── routes/        # auth, dashboard, writing, health
└── README.md
```

## Getting Started

### 1. Install dependencies

```bash
# from repo root
npm install          # installs root tools (concurrently)
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment

Create `server/.env`:

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/ielts-writing
JWT_SECRET=change-me
OPENAI_API_KEY=sk-your-key   # optional, fallback scores used if missing
CORS_WHITELIST=http://localhost:5173
```

### 3. Run locally

```bash
# in one terminal
npm run dev:server   # starts Express with nodemon

# in another terminal
npm run dev:client   # starts Vite dev server on 5173
```

The root `npm run dev` command runs both via `concurrently`.

## API Overview

| Method | Endpoint              | Description                         |
| ------ | --------------------- | ----------------------------------- |
| POST   | `/api/auth/register`  | Create account + issue JWT          |
| POST   | `/api/auth/login`     | Login and receive JWT               |
| GET    | `/api/auth/me`        | Current user info (requires token)  |
| GET    | `/api/dashboard`      | Basic stats + recent writing scores |
| POST   | `/api/writing/submit` | Score a Task 2 essay with AI        |
| GET    | `/api/writing/...`    | List or fetch previous submissions  |

## Frontend Routes

- `/login` and `/register`
- `/` – dashboard (protected)
- `/writing` – submit Task 2 essays (protected)
- `/verify-email` – verify email from link token
- `/reset-password` – reset password from link token

## Extending Phase 1

- Add richer prompt management inside `server/ai/writing/`.
- Store more granular scoring metadata in `WritingSubmission`.
- Layer additional UI (filters, detailed feedback cards) on the dashboard.

## Deployment Checklist (Vercel + Render + MongoDB)

### Backend (Render)

- **Health/monitoring endpoints**
  - `GET /health` – fast (no DB), used by Render health checks + UptimeRobot
  - `GET /ready` – readiness (checks Mongo connection state)
  - (Legacy) `GET /api/health` – older health endpoint still exists for backwards compatibility

- **Required env vars**
  - **DB**: `MONGO_URI` (or `MONGODB_URI`)
  - **Auth**: `JWT_SECRET`
  - **Frontend URL**: `FRONTEND_URL` (or `CLIENT_URL`)
  - **CORS allowlist**: `CORS_WHITELIST` (comma-separated, include your Vercel domain)

- **Optional env vars**
  - **AI scoring**: `OPENAI_API_KEY`, `OPENAI_MODEL` (optional), `OPENAI_API_BASE` (optional)
  - **SendGrid**: `SENDGRID_API_KEY`, `EMAIL_FROM` (or `SENDGRID_FROM` / `SENDGRID_FROM_EMAIL`)
  - **Public link base URL** (used in email links): `APP_BASE_URL` (recommended: your Vercel domain)
  - **Cookie auth toggle (only if you switch to cookies later)**: `CORS_ALLOW_CREDENTIALS=true`

### Frontend (Vercel)

- **Required env vars**
  - `VITE_API_BASE_URL` – must include `/api` suffix (example: `https://<render-backend>/api`)

- **Optional env vars**
  - **Tawk.to**
    - `VITE_TAWK_ENABLED=true|false`
    - `VITE_TAWK_PROPERTY_ID=...`
    - `VITE_TAWK_WIDGET_ID=...`

### UptimeRobot setup

- Create an **HTTP(s) monitor**:
  - URL: `https://<your-render-backend-domain>/health`
  - Interval: **5 minutes**
  - Alerts: email/SMS as desired

### SendGrid reminders

- Ensure your SendGrid sender identity is verified.
- Configure `EMAIL_FROM` to a verified sender.
- Ensure `APP_BASE_URL` points to your Vercel frontend domain so verification/reset links open correctly.

Enjoy the focused writing-only workflow! 🎯
