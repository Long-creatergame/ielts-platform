# IELTS Computer‑Delivered Mock Test Engine (Local‑only)

This folder contains a **standalone** React + TypeScript + Vite app that simulates the **IELTS Academic computer‑delivered** exam UI for training centres.

## Tech Stack
- React + TypeScript + Vite
- TailwindCSS
- React Router
- Zustand (localStorage persistence)
- Zod (strict test JSON schema)

## Install & Run

```bash
cd exam-engine
npm install
npm run dev
```

Vite runs on `http://localhost:5174` by default.

## Key UX Features
- Reading split layout (passage left, questions right)
- Question navigator (1–40) with states: unanswered / answered / flagged
- Top timer bar + Review button
- Bottom controls: Previous / Next, Flag, Clear answer
- Autosave heartbeat every 2 seconds (localStorage) + resume on refresh
- Review screen with status table and jump links
- Results screen with Listening/Reading score (/40) + estimated band + full answer review
- Listening transcript hidden until submit
- Writing model answers + rubric hidden until submit

## Test Data & Schema

### Where tests live
- Parsed structured tests: `src/data/tests/*.json`
- Raw text sources (for the converter): `src/data/raw/*.txt`

### Schema
All tests must conform to the Zod schema in:
- `src/utils/schema.ts`

The app validates `test1.json` at runtime; invalid JSON will throw with a console error.

## Importing a New Test JSON
1) Duplicate `src/data/tests/test1.json` and rename (e.g. `test2.json`).
2) Ensure it passes the schema (see `src/utils/schema.ts`).
3) Register it in `src/data/tests/index.ts`:

```ts
import test2Raw from './test2.json';
tests.test2 = validateTest(test2Raw);
```

## Raw Text → JSON Parser/Converter

This repo includes a **best‑effort** converter script:
- Input: `src/data/raw/test1.txt`
- Output: `src/data/tests/test1.json`

Run:

```bash
cd exam-engine
npm run parse:test1
```

### Behaviour
- If the raw text is incomplete or ambiguous, the script logs warnings and keeps existing JSON.
- This prevents breaking the UI when the raw format varies.

## Notes
- No backend is required. Everything persists via localStorage.
- Audio playback is not implemented (transcripts are provided after submit).

