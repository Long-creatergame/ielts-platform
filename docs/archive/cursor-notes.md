# Cursor Notes for IELTS Platform

## Summary

IELTS Platform is an AI-driven learning system for IELTS skills (Listening, Reading, Writing, Speaking).

**Backend:** Express.js + MongoDB Atlas + OpenAI GPT-4o-mini  
**Frontend:** React + Vite + TailwindCSS  
**Deploy:** Render (BE), Vercel (FE)

## AI Modules

- **aiService.js** → Unified service handling Writing, Speaking, Reading AI tasks
- **aiFeedback**: Generates structured feedback (band score, comments, suggestions)
- **aiSummary**: Aggregates performance across tests
- **aiRecommendation**: Suggests next practice topics from WeaknessProfile

## Models

- **User**: stores account info, progress, subscription
- **AISubmission**: each user answer with score and AI feedback
- **WeaknessProfile**: tracks skill weaknesses over time
- **PracticeSet**: generated question sets
- **UserResults**: historical progress data
- **AI_Feedback**: session-based feedback (consolidated with AIFeedback)

## API Format

All responses: `{ success, data, message }`  
Use async/await and try/catch for all routes

## Key Routes

- `/api/auth/*` - Authentication (login, register, profile)
- `/api/ai/*` - AI assessment and feedback
- `/api/practice/*` - Practice sessions
- `/api/payment/*` - Stripe integration
- `/api/exam/*` - Exam sessions and results
- `/api/dashboard/*` - Dashboard data

## i18n Support

- 5 languages: en, vi, zh, ja, ko
- Translation keys: `dashboard.*`, `test.*`, `common.*`, `auth.*`
- Auto-detection from browser localStorage

## Environment Variables

**Backend (Render):**
- MONGO_URI
- JWT_SECRET
- OPENAI_API_KEY
- STRIPE_SECRET_KEY
- SENDGRID_API_KEY

**Frontend (Vercel):**
- VITE_API_BASE_URL
- VITE_STRIPE_PUBLIC_KEY

## Cambridge Test Structure

- ExamSession → ExamResult → AI_Feedback
- Supports Academic/General modes
- Unified Cambridge Router handles all test types

