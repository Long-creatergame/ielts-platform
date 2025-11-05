# IELTS Platform - Project Architecture

## Overview

AI-driven IELTS learning platform with Cambridge-style tests, AI feedback, and personalized learning paths.

## Tech Stack

### Frontend
- **React 18** + **Vite** - Modern build tooling
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Animations
- **react-i18next** - Internationalization (5 languages)
- **React Router** - Client-side routing

### Backend
- **Node.js** + **Express** - REST API
- **MongoDB** + **Mongoose** - Database
- **OpenAI GPT-4o-mini** - AI assessment
- **JWT** - Authentication
- **Stripe** - Payments
- **SendGrid** - Email

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Cloud database

## Architecture Layers

### Backend (MVC)

```
server/
├── routes/          # API endpoints
├── controllers/     # Business logic
├── services/        # External integrations (AI, Email, etc.)
├── models/          # Mongoose schemas
├── middleware/      # Auth, timezone, etc.
├── utils/           # Helper functions
└── config/          # Configuration files
```

### Frontend

```
client/src/
├── pages/           # Route components
├── components/      # Reusable UI components
├── services/        # API clients
├── utils/           # Helpers (dateFormat, goalText, etc.)
├── contexts/        # React contexts (Auth, etc.)
└── i18n/            # Translation files
```

## Data Flow

1. **User submits answer** → Frontend sends to `/api/ai/assess`
2. **AI Service** → Calls OpenAI GPT-4o-mini
3. **Feedback generated** → Saved to `AI_Feedback` model
4. **Dashboard updated** → Aggregates from `ExamResult` and `AI_Feedback`

## Key Models

- **User**: Authentication, profile, subscription
- **ExamSession**: Active test session
- **ExamResult**: Completed test results
- **AI_Feedback**: AI-generated feedback per skill
- **WeaknessProfile**: Tracks user weaknesses over time
- **PracticeSet**: Generated practice questions

## API Endpoints

### Auth
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### AI
- `POST /api/ai/assess` - Assess writing/speaking
- `POST /api/ai/generate` - Generate practice questions

### Practice
- `GET /api/practice/:skill` - Get practice content
- `POST /api/practice/submit` - Submit practice answers

### Exams
- `POST /api/exam/start` - Start exam session
- `POST /api/exam/submit` - Submit exam
- `GET /api/exam/result/:id` - Get exam results

## Security

- JWT tokens for authentication
- CORS configured for Vercel/Render
- Password hashing with bcrypt
- Rate limiting on API routes

## i18n

- 5 languages: English, Vietnamese, Chinese, Japanese, Korean
- Browser auto-detection
- Persistent language preference
- Backend language support via headers

