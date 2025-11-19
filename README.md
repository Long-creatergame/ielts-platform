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

## Extending Phase 1

- Add richer prompt management inside `server/ai/writing/`.
- Store more granular scoring metadata in `WritingSubmission`.
- Layer additional UI (filters, detailed feedback cards) on the dashboard.

Enjoy the focused writing-only workflow! 🎯
