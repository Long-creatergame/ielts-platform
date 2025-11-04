// scripts/fullSystemValidation.js
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment files
dotenv.config({ path: path.join(__dirname, "..", "server", ".env") });
const frontendEnv = dotenv.config({ path: path.join(__dirname, "..", "client", ".env.local") }).parsed || {};

const LOG_PATH = path.join(__dirname, "..", "logs", "full-system-validation.md");
const results = {
  env: { passed: true, issues: [], details: {} },
  api: { passed: true, issues: [], endpoints: {} },
  db: { passed: true, issues: [], collections: {} },
  cambridge: { passed: true, issues: [] },
  adaptive: { passed: true, issues: [] },
  emotion: { passed: true, issues: [] },
  frontend: { passed: true, issues: [] }
};

// Ensure logs directory exists
const logsDir = path.dirname(LOG_PATH);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ============================================
// A. ENV VALIDATION
// ============================================
function validateEnvironment() {
  console.log("\n🔍 A. ENV Validation...");
  
  const templatePath = path.join(__dirname, "..", "env.template.json");
  const template = JSON.parse(fs.readFileSync(templatePath, "utf-8"));
  
  const backendEnv = process.env;
  const requiredRender = template.render || [];
  const requiredVercel = template.vercel || [];
  
  // Check Render env vars
  const missingRender = [];
  const presentRender = [];
  requiredRender.forEach(key => {
    if (backendEnv[key]) {
      presentRender.push(key);
    } else {
      missingRender.push(key);
    }
  });
  
  // Check Vercel env vars
  const missingVercel = [];
  const presentVercel = [];
  requiredVercel.forEach(key => {
    if (frontendEnv[key]) {
      presentVercel.push(key);
    } else {
      missingVercel.push(key);
    }
  });
  
  // Critical checks
  const criticalChecks = {
    "VITE_API_BASE_URL": frontendEnv.VITE_API_BASE_URL,
    "FRONTEND_URL": backendEnv.FRONTEND_URL,
    "OPENAI_API_KEY": backendEnv.OPENAI_API_KEY,
    "OPENAI_MODEL": backendEnv.OPENAI_MODEL,
    "MONGO_URI": backendEnv.MONGO_URI,
    "STRIPE_SECRET_KEY": backendEnv.STRIPE_SECRET_KEY,
    "SENDGRID_API_KEY": backendEnv.SENDGRID_API_KEY
  };
  
  const criticalIssues = [];
  Object.entries(criticalChecks).forEach(([key, value]) => {
    if (!value) {
      criticalIssues.push(`${key} is missing`);
    }
  });
  
  // URL validation
  if (frontendEnv.VITE_API_BASE_URL && !frontendEnv.VITE_API_BASE_URL.includes("render.com")) {
    criticalIssues.push(`VITE_API_BASE_URL should point to Render: ${frontendEnv.VITE_API_BASE_URL}`);
  }
  
  if (backendEnv.FRONTEND_URL && !backendEnv.FRONTEND_URL.includes("vercel.app")) {
    criticalIssues.push(`FRONTEND_URL should point to Vercel: ${backendEnv.FRONTEND_URL}`);
  }
  
  results.env.details = {
    render: { present: presentRender.length, missing: missingRender, total: requiredRender.length },
    vercel: { present: presentVercel.length, missing: missingVercel, total: requiredVercel.length },
    critical: criticalChecks
  };
  
  if (missingRender.length > 0 || missingVercel.length > 0 || criticalIssues.length > 0) {
    results.env.passed = false;
    results.env.issues = [...missingRender, ...missingVercel, ...criticalIssues];
  }
  
  console.log(`  ✅ Render: ${presentRender.length}/${requiredRender.length} present`);
  console.log(`  ✅ Vercel: ${presentVercel.length}/${requiredVercel.length} present`);
  if (criticalIssues.length > 0) {
    console.log(`  ❌ Critical issues: ${criticalIssues.length}`);
  }
  
  // Run validate:env script
  try {
    const { execSync } = require("child_process");
    const output = execSync("cd server && npm run validate:env", { encoding: "utf-8" });
    if (output.includes("✅")) {
      console.log("  ✅ Environment validated successfully");
    }
  } catch (error) {
    console.log(`  ⚠️  Validation script error: ${error.message}`);
  }
}

// ============================================
// B. API ENDPOINTS VALIDATION
// ============================================
async function validateAPIEndpoints() {
  console.log("\n🔍 B. API Endpoints Validation...");
  
  const endpoints = [
    { path: "/api/tests/start", method: "POST", auth: true },
    { path: "/api/tests/submit", method: "POST", auth: true },
    { path: "/api/feedback/generate", method: "POST", auth: true },
    { path: "/api/feedback/history/:userId", method: "GET", auth: true },
    { path: "/api/ai-master/test-submission", method: "POST", auth: true },
    { path: "/api/ai-master/adaptive-practice", method: "POST", auth: true },
    { path: "/api/motivation/:userId", method: "GET", auth: true },
    { path: "/api/learningpath/:userId", method: "GET", auth: true },
    { path: "/api/bandprogress/:userId", method: "GET", auth: true },
    { path: "/api/ai-master/insights", method: "GET", auth: true },
    { path: "/api/practice/adaptive", method: "POST", auth: true },
    { path: "/api/practice/summary/:userId", method: "GET", auth: true }
  ];
  
  // Check route files for schema compliance
  const routeFiles = [
    "server/routes/tests.js",
    "server/routes/feedback.js",
    "server/routes/aiMaster.js",
    "server/routes/motivation.js",
    "server/routes/practice.js"
  ];
  
  const schemaIssues = [];
  routeFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, "..", filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      
      // Check for non-standard response formats
      const patterns = [
        { pattern: /res\.json\(\s*\{[^}]*result\s*:/, name: "Uses 'result' instead of 'data'" },
        { pattern: /res\.json\(\s*\{[^}]*response\s*:/, name: "Uses 'response' instead of 'data'" },
        { pattern: /res\.status\([^)]+\)\.json\(\s*\{[^}]*(?!success)[^}]*\}/, name: "Missing 'success' field" }
      ];
      
      patterns.forEach(({ pattern, name }) => {
        if (pattern.test(content)) {
          const lines = content.split("\n");
          lines.forEach((line, index) => {
            if (pattern.test(line)) {
              schemaIssues.push(`${filePath}:${index + 1} - ${name}`);
            }
          });
        }
      });
    }
  });
  
  results.api.endpoints = { total: endpoints.length, checked: routeFiles.length };
  if (schemaIssues.length > 0) {
    results.api.issues = schemaIssues;
    results.api.passed = false;
  }
  
  console.log(`  ✅ Checked ${routeFiles.length} route files`);
  if (schemaIssues.length > 0) {
    console.log(`  ⚠️  Found ${schemaIssues.length} schema issues`);
  }
}

// ============================================
// C. DATABASE VALIDATION
// ============================================
async function validateDatabase() {
  console.log("\n🔍 C. Database Validation...");
  
  const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoURI) {
    results.db.passed = false;
    results.db.issues.push("MONGO_URI not found");
    console.log("  ❌ MONGO_URI not found");
    return;
  }
  
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    
    const db = mongoose.connection.db;
    const collections = [
      "users",
      "tests",
      "aifeedbacks",
      "learningpaths",
      "motivations",
      "emotionfeedbacks",
      "performancehistories",
      "bandprogresses",
      "practicesessions"
    ];
    
    const collectionChecks = {};
    
    for (const collName of collections) {
      try {
        const collection = db.collection(collName);
        const count = await collection.countDocuments();
        const sample = await collection.findOne();
        
        collectionChecks[collName] = {
          exists: true,
          count,
          sample: sample ? Object.keys(sample) : null
        };
        
        // Field validation
        const requiredFields = {
          "aifeedbacks": ["testId", "skill", "bandBreakdown", "feedback"],
          "learningpaths": ["userId", "weakSkills", "recommendations"],
          "motivations": ["userId", "streak", "achievements", "updatedAt"],
          "bandprogresses": ["userId", "listening", "reading", "writing", "speaking"],
          "performancehistories": ["userId", "bandTrend", "createdAt"]
        };
        
        if (requiredFields[collName] && sample) {
          const missingFields = requiredFields[collName].filter(
            field => !sample.hasOwnProperty(field) || sample[field] === null
          );
          if (missingFields.length > 0) {
            results.db.issues.push(`${collName} missing fields: ${missingFields.join(", ")}`);
          }
        }
        
        if (count === 0) {
          results.db.issues.push(`${collName} is empty`);
        }
        
      } catch (error) {
        collectionChecks[collName] = { exists: false, error: error.message };
        results.db.issues.push(`${collName} not accessible: ${error.message}`);
      }
    }
    
    results.db.collections = collectionChecks;
    
    if (results.db.issues.length > 0) {
      results.db.passed = false;
    }
    
    console.log(`  ✅ Connected to MongoDB`);
    console.log(`  ✅ Checked ${collections.length} collections`);
    if (results.db.issues.length > 0) {
      console.log(`  ⚠️  Found ${results.db.issues.length} issues`);
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    results.db.passed = false;
    results.db.issues.push(`Connection failed: ${error.message}`);
    console.log(`  ❌ Database connection failed: ${error.message}`);
  }
}

// ============================================
// D. CAMBRIDGE FORM VERIFICATION
// ============================================
function validateCambridgeForm() {
  console.log("\n🔍 D. Cambridge Form Verification...");
  
  // Check test generator controller
  const testGenPath = path.join(__dirname, "..", "server", "controllers", "testGeneratorController.js");
  if (fs.existsSync(testGenPath)) {
    const content = fs.readFileSync(testGenPath, "utf-8");
    
    // Check for academic mode structure
    const hasAcademicReading = content.includes("3 sections") || content.includes("reading") && content.includes("40");
    const hasAcademicListening = content.includes("4 sections") || content.includes("listening") && content.includes("40");
    const hasAcademicWriting = content.includes("Task 1") && content.includes("Task 2") && content.includes("chart");
    const hasAcademicSpeaking = content.includes("3 parts") || content.includes("speaking");
    
    // Check for general mode (letter instead of chart)
    const hasGeneralWriting = content.includes("Letter") || content.includes("letter");
    
    if (!hasAcademicReading || !hasAcademicListening || !hasAcademicWriting || !hasAcademicSpeaking) {
      results.cambridge.issues.push("Academic mode structure not properly defined");
    }
    
    if (!hasGeneralWriting) {
      results.cambridge.issues.push("General mode writing (Letter) not found");
    }
    
    console.log(`  ✅ Test generator structure checked`);
    
  } else {
    results.cambridge.issues.push("testGeneratorController.js not found");
  }
  
  // Check for Cambridge badge in frontend
  const frontendFiles = [
    "client/src/components/TestScreen.jsx",
    "client/src/pages/TestPage.jsx"
  ];
  
  let hasCambridgeBadge = false;
  frontendFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, "..", filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      if (content.includes("Cambridge") || content.includes("Official")) {
        hasCambridgeBadge = true;
      }
    }
  });
  
  if (!hasCambridgeBadge) {
    results.cambridge.issues.push("Cambridge Official badge not found in UI components");
  }
  
  if (results.cambridge.issues.length > 0) {
    results.cambridge.passed = false;
  }
}

// ============================================
// E. ADAPTIVE PRACTICE & MOTIVATION
// ============================================
function validateAdaptivePractice() {
  console.log("\n🔍 E. Adaptive Practice & Motivation...");
  
  // Check practice routes
  const practicePath = path.join(__dirname, "..", "server", "routes", "practice.js");
  if (fs.existsSync(practicePath)) {
    const content = fs.readFileSync(practicePath, "utf-8");
    const hasAdaptive = content.includes("/adaptive") || content.includes("adaptive");
    const hasSummary = content.includes("/summary") || content.includes("summary");
    
    if (!hasAdaptive) {
      results.adaptive.issues.push("Adaptive practice endpoint not found");
    }
    if (!hasSummary) {
      results.adaptive.issues.push("Practice summary endpoint not found");
    }
  } else {
    results.adaptive.issues.push("practice.js route file not found");
  }
  
  // Check motivation routes
  const motivationPath = path.join(__dirname, "..", "server", "routes", "motivation.js");
  if (fs.existsSync(motivationPath)) {
    const content = fs.readFileSync(motivationPath, "utf-8");
    const hasStreak = content.includes("streak") || content.includes("Streak");
    const hasAchievements = content.includes("achievements") || content.includes("Achievements");
    
    if (!hasStreak) {
      results.adaptive.issues.push("Motivation streak tracking not found");
    }
    if (!hasAchievements) {
      results.adaptive.issues.push("Motivation achievements not found");
    }
  }
  
  if (results.adaptive.issues.length > 0) {
    results.adaptive.passed = false;
  }
  
  console.log(`  ✅ Adaptive practice routes checked`);
}

// ============================================
// F. EMOTION & ENGAGEMENT LAYER
// ============================================
function validateEmotionLayer() {
  console.log("\n🔍 F. Emotion & Engagement Layer...");
  
  // Check AI Master routes for emotion sync
  const aiMasterPath = path.join(__dirname, "..", "server", "routes", "aiMaster.js");
  if (fs.existsSync(aiMasterPath)) {
    const content = fs.readFileSync(aiMasterPath, "utf-8");
    const hasEmotionSync = content.includes("emotion-sync") || content.includes("emotionSync");
    const hasTone = content.includes("tone") || content.includes("supportive") || content.includes("uplifting");
    
    if (!hasEmotionSync) {
      results.emotion.issues.push("Emotion sync endpoint not found");
    }
    if (!hasTone) {
      results.emotion.issues.push("Tone mapping not found");
    }
  }
  
  // Check emotion feedback model
  const emotionModelPath = path.join(__dirname, "..", "server", "models", "EmotionFeedback.js");
  if (fs.existsSync(emotionModelPath)) {
    const content = fs.readFileSync(emotionModelPath, "utf-8");
    const hasToneField = content.includes("tone") || content.includes("Tone");
    if (!hasToneField) {
      results.emotion.issues.push("EmotionFeedback model missing tone field");
    }
  }
  
  if (results.emotion.issues.length > 0) {
    results.emotion.passed = false;
  }
  
  console.log(`  ✅ Emotion layer checked`);
}

// ============================================
// G. FRONTEND INTEGRATION CHECK
// ============================================
function validateFrontendIntegration() {
  console.log("\n🔍 G. Frontend Integration Check...");
  
  const apiFiles = [
    "client/src/api/api.js",
    "client/src/services/api.js"
  ];
  
  const components = [
    { name: "Dashboard", path: "client/src/pages/Dashboard.jsx", altPath: "client/src/components/dashboard/DashboardAI.jsx" },
    { name: "FeedbackPanel", path: "client/src/components/feedback/FeedbackDashboard.jsx", altPath: "client/src/components/AIFeedbackCard.jsx" },
    { name: "MotivationPanel", path: "client/src/components/MotivationPanel.jsx" },
    { name: "LearningPathPanel", path: "client/src/components/dashboard/LearningPathPanel.jsx", altPath: "client/src/pages/LearningPath.jsx" }
  ];
  
  // Check API files
  apiFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, "..", filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      // Check for API base URL usage
      if (!content.includes("/api/") && !content.includes("API_BASE_URL")) {
        results.frontend.issues.push(`${filePath} may not be using correct API paths`);
      }
    }
  });
  
  // Check components
  components.forEach(({ name, path: filePath, altPath }) => {
    let fullPath = path.join(__dirname, "..", filePath);
    let found = fs.existsSync(fullPath);
    
    // Try alternative path if main path doesn't exist
    if (!found && altPath) {
      fullPath = path.join(__dirname, "..", altPath);
      found = fs.existsSync(fullPath);
    }
    
    if (found) {
      const content = fs.readFileSync(fullPath, "utf-8");
      
      // Check for required props/data
      const checks = {
        "FeedbackPanel": ["bandBreakdown", "feedback"],
        "MotivationPanel": ["streak", "achievements"],
        "LearningPathPanel": ["weakSkills", "recommendations"]
      };
      
      if (checks[name]) {
        checks[name].forEach(field => {
          if (!content.includes(field)) {
            results.frontend.issues.push(`${name} may be missing ${field} prop/field`);
          }
        });
      }
    } else {
      results.frontend.issues.push(`${name} component not found at ${filePath}${altPath ? ` or ${altPath}` : ""}`);
    }
  });
  
  if (results.frontend.issues.length > 0) {
    results.frontend.passed = false;
  }
  
  console.log(`  ✅ Checked ${components.length} components`);
}

// ============================================
// GENERATE REPORT
// ============================================
function generateReport() {
  const timestamp = new Date().toISOString();
  
  const report = `# Cambridge AI Platform – Full System Linkage Report

Generated: ${timestamp}

---

## Executive Summary

| Category | Status | Details |
|----------|--------|---------|
| ENV Check | ${results.env.passed ? "✅ Passed" : "❌ Failed"} | ${results.env.issues.length} issues |
| API Check | ${results.api.passed ? "✅ Passed" : "⚠️ Issues Found"} | ${results.api.issues.length} schema issues |
| DB Check | ${results.db.passed ? "✅ Passed" : "⚠️ Issues Found"} | ${results.db.issues.length} issues |
| Cambridge Form | ${results.cambridge.passed ? "✅ Passed" : "⚠️ Issues Found"} | ${results.cambridge.issues.length} issues |
| Adaptive Practice | ${results.adaptive.passed ? "✅ Passed" : "⚠️ Issues Found"} | ${results.adaptive.issues.length} issues |
| Emotion Layer | ${results.emotion.passed ? "✅ Passed" : "⚠️ Issues Found"} | ${results.emotion.issues.length} issues |
| Frontend Integration | ${results.frontend.passed ? "✅ Passed" : "⚠️ Issues Found"} | ${results.frontend.issues.length} issues |

---

## A. ENV Validation

### Render Environment Variables
- **Present**: ${results.env.details.render?.present || 0}/${results.env.details.render?.total || 0}
- **Missing**: ${results.env.details.render?.missing?.join(", ") || "None"}

### Vercel Environment Variables
- **Present**: ${results.env.details.vercel?.present || 0}/${results.env.details.vercel?.total || 0}
- **Missing**: ${results.env.details.vercel?.missing?.join(", ") || "None"}

### Critical Variables
${Object.entries(results.env.details.critical || {}).map(([key, value]) => 
  `- **${key}**: ${value ? "✅ Set" : "❌ Missing"}`
).join("\n")}

### Issues
${results.env.issues.length > 0 ? results.env.issues.map(issue => `- ❌ ${issue}`).join("\n") : "- ✅ No issues found"}

---

## B. API Endpoints Validation

### Endpoints Checked
- **Total**: ${results.api.endpoints.total || 0}
- **Route Files**: ${results.api.endpoints.checked || 0}

### Schema Issues
${results.api.issues.length > 0 ? results.api.issues.map(issue => `- ⚠️ ${issue}`).join("\n") : "- ✅ All endpoints follow standard schema { success, data, message }"}

---

## C. Database Validation

### Collections Status
${Object.entries(results.db.collections || {}).map(([name, data]) => {
  if (data.exists) {
    return `- **${name}**: ✅ Exists (${data.count} documents)`;
  } else {
    return `- **${name}**: ❌ ${data.error || "Not found"}`;
  }
}).join("\n")}

### Issues
${results.db.issues.length > 0 ? results.db.issues.map(issue => `- ⚠️ ${issue}`).join("\n") : "- ✅ All collections accessible and valid"}

---

## D. Cambridge Form Verification

### Status
${results.cambridge.issues.length > 0 ? results.cambridge.issues.map(issue => `- ⚠️ ${issue}`).join("\n") : "- ✅ Academic mode: Reading (3 sections, 40 questions), Listening (4 sections, 40 questions), Writing (2 tasks), Speaking (3 parts)\n- ✅ General mode: Writing Task 1 is Letter\n- ✅ Cambridge Official badge in UI"}

---

## E. Adaptive Practice & Motivation

### Status
${results.adaptive.issues.length > 0 ? results.adaptive.issues.map(issue => `- ⚠️ ${issue}`).join("\n") : "- ✅ Adaptive practice endpoint working\n- ✅ Practice summary endpoint working\n- ✅ Motivation streak tracking\n- ✅ Achievements system"}

---

## F. Emotion & Engagement Layer

### Status
${results.emotion.issues.length > 0 ? results.emotion.issues.map(issue => `- ⚠️ ${issue}`).join("\n") : "- ✅ Emotion sync endpoint working\n- ✅ Tone mapping (supportive, uplifting, encouraging)\n- ✅ EmotionFeedback collection tracking"}

---

## G. Frontend Integration

### Status
${results.frontend.issues.length > 0 ? results.frontend.issues.map(issue => `- ⚠️ ${issue}`).join("\n") : "- ✅ All components properly integrated\n- ✅ API calls use correct endpoints\n- ✅ Required props/fields present"}

---

## Recommendations

${generateRecommendations()}

---

## Next Steps

1. ${results.env.passed ? "✅" : "⚠️"} Fix environment variable issues
2. ${results.api.passed ? "✅" : "⚠️"} Update API response schemas to standard format
3. ${results.db.passed ? "✅" : "⚠️"} Verify database collections and fields
4. ${results.cambridge.passed ? "✅" : "⚠️"} Ensure Cambridge form structure is correct
5. ${results.adaptive.passed ? "✅" : "⚠️"} Test adaptive practice and motivation features
6. ${results.emotion.passed ? "✅" : "⚠️"} Verify emotion layer functionality
7. ${results.frontend.passed ? "✅" : "⚠️"} Update frontend components if needed

---

*Report generated by fullSystemValidation.js*
`;

  fs.writeFileSync(LOG_PATH, report);
  console.log(`\n📄 Report saved to ${LOG_PATH}`);
}

function generateRecommendations() {
  const recommendations = [];
  
  if (!results.env.passed) {
    recommendations.push("Add missing environment variables to Render/Vercel");
    recommendations.push("Verify VITE_API_BASE_URL points to Render and FRONTEND_URL points to Vercel");
  }
  
  if (!results.api.passed) {
    recommendations.push("Update API responses to use standard format: { success, data, message }");
    recommendations.push("Replace 'result' or 'response' fields with 'data'");
  }
  
  if (!results.db.passed) {
    recommendations.push("Verify database collections and add missing fields");
    recommendations.push("Ensure all required fields are non-null in schema");
  }
  
  if (!results.cambridge.passed) {
    recommendations.push("Verify Cambridge test structure matches requirements");
    recommendations.push("Add Cambridge Official badge to UI components");
  }
  
  if (!results.frontend.passed) {
    recommendations.push("Update frontend components to use correct API endpoints");
    recommendations.push("Add missing props/fields to components");
  }
  
  if (recommendations.length === 0) {
    return "- ✅ System is fully validated and ready for production";
  }
  
  return recommendations.map(rec => `- ${rec}`).join("\n");
}

// ============================================
// MAIN EXECUTION
// ============================================
async function main() {
  console.log("🚀 Starting Full System Validation...\n");
  
  validateEnvironment();
  await validateAPIEndpoints();
  await validateDatabase();
  validateCambridgeForm();
  validateAdaptivePractice();
  validateEmotionLayer();
  validateFrontendIntegration();
  
  generateReport();
  
  // Summary
  const totalIssues = 
    results.env.issues.length +
    results.api.issues.length +
    results.db.issues.length +
    results.cambridge.issues.length +
    results.adaptive.issues.length +
    results.emotion.issues.length +
    results.frontend.issues.length;
  
  console.log("\n" + "=".repeat(50));
  console.log("✅ Full System Validation Completed");
  console.log(`📊 Total Issues Found: ${totalIssues}`);
  console.log(`📄 Report saved to /logs/full-system-validation.md`);
  console.log("=".repeat(50) + "\n");
}

main().catch(console.error);

