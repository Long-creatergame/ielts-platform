# IELTS Mock Web (Next.js)

This is a **mock-test-only** UI (stress mode):
- Writing Task 2 (40 minutes, submit once, auto-submit on timeout)
- Speaking Part 2 (1 min prep + 2 min record once, no redo)
- Results show **only** band scores + 3 biggest risks + “most likely band” + mock-vs-real risk indicator.

## Run locally

1) Start backend:

```bash
cd server
npm install
npm run dev
```

2) Start mock web:

```bash
cd apps/mock-web
npm install
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4000 npm run dev
```

Open `http://localhost:3000`.

## Required backend env

- `JWT_SECRET`
- `MONGO_URI`
- `OPENAI_API_KEY` (required for Speaking audio ASR + scoring; and Writing scoring)
- Optional: `OPENAI_ASR_MODEL` (default: `whisper-1`)

