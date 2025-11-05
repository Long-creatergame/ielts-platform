# IELTS Platform - Developer Context (Stable Mode)

## 🎯 Cursor's Role

Cursor should:

- ✅ **Understand** the full project structure and logic
- ✅ **Help** with code optimization, AI module design, and performance
- ✅ **Focus** on AI logic for IELTS assessment
- ✅ **Assist** with API flow optimization
- ✅ **Improve** frontend component design
- ✅ **Enhance** Writing/Speaking feedback modules

## ❌ Cursor Should NOT:

- ❌ Modify CI/CD workflows or deployment configuration
- ❌ Create or delete environment variables
- ❌ Interfere with auto-deploy setup on Render and Vercel
- ❌ Create GitHub Actions workflows for deployment
- ❌ Modify Render/Vercel deployment settings
- ❌ Create deployment scripts or automation

## 📁 Project Structure

```
ielts-platform/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── i18n/          # Internationalization
│   └── vercel.json        # Vercel config (do not modify)
│
├── server/                # Node.js + Express backend
│   ├── routes/            # API routes
│   ├── controllers/       # Route controllers
│   ├── services/          # Business logic (including AI)
│   ├── models/            # Mongoose models
│   ├── middleware/        # Express middleware
│   └── utils/             # Utility functions
│
├── docs/                  # Project documentation
│   ├── project-architecture.md
│   └── ai-flow-overview.md
│
├── ai-prompts/            # AI prompt templates
│   ├── writing-feedback-template.md
│   ├── speaking-feedback-template.md
│   ├── reading-generator-template.md
│   └── recommendation-template.md
│
└── cursor-notes.md        # Additional context for Cursor
```

## 🚀 Deployment

### Render (Backend)
- **Auto-deploy:** Enabled via GitHub webhook
- **Branch:** `main`
- **Build Command:** `cd server && npm install && npm start`
- **Status:** ✅ Stable - Do not modify deployment settings

### Vercel (Frontend)
- **Auto-deploy:** Enabled via GitHub integration
- **Root Directory:** `client`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Status:** ✅ Stable - Do not modify deployment settings

## 🤖 AI Services

### Unified AI Service
- **Location:** `server/services/aiService.js`
- **Entry Point:** `processAI(type, input)`
- **Supported Types:**
  - `writing` - Essay feedback and scoring
  - `speaking` - Transcript feedback and scoring
  - `reading` - Question generation
  - `recommendation` - Personalized learning recommendations

### AI Models
- **User:** Account info, progress, subscription
- **AISubmission:** User answers with scores and feedback
- **WeaknessProfile:** Skill weakness tracking
- **PracticeSet:** Generated question sets

## 🌐 Internationalization

- **Framework:** `react-i18next`
- **Languages:** English, Vietnamese, Chinese, Japanese, Korean
- **Location:** `client/src/i18n/`
- **Auto-detection:** Browser language on first load
- **Runtime switching:** Instant reload (no refresh)

## 🔐 Environment Variables

**Do NOT modify or create environment variables.**

Variables are managed in:
- **Render Dashboard:** Backend environment variables
- **Vercel Dashboard:** Frontend environment variables

## 📝 Coding Guidelines

1. **Follow existing patterns** in the codebase
2. **Maintain backward compatibility** with existing APIs
3. **Use TypeScript types** where applicable
4. **Follow ESLint/Prettier** configurations
5. **Test locally** before suggesting changes
6. **Respect existing** architecture and structure

## 🎓 Focus Areas

### Priority 1: AI Logic
- Writing feedback accuracy
- Speaking assessment precision
- Reading question quality
- Recommendation relevance

### Priority 2: Code Quality
- Component optimization
- API performance
- Error handling
- User experience

### Priority 3: Features
- New IELTS skill modules
- Enhanced feedback quality
- Better user guidance
- Performance improvements

## ⚠️ Important Notes

- **Stable Mode:** System is in stable production mode
- **No Breaking Changes:** Avoid modifications that break existing functionality
- **Test Before Suggest:** Always test changes locally first
- **Respect Auto-Deploy:** Let Render and Vercel handle deployments automatically

---

**Last Updated:** $(date +"%Y-%m-%d")  
**Mode:** Stable Developer Mode  
**CI/CD:** Disabled (Auto-deploy via Render/Vercel only)

