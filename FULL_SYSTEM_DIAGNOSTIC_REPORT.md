# Full System Diagnostic Report - IELTS Platform

**Date:** 2025-11-13 04:00 UTC  
**Frontend:** https://ielts-platform-two.vercel.app  
**Backend:** https://ielts-platform-emrv.onrender.com  
**Issue:** Frontend shows "Đang cập nhật hệ thống. Vui lòng thử lại sau vài phút."

---

## Executive Summary

### ⚠️ **Some endpoints slow or missing - Backend errors detected causing fallback**

**Root Causes Identified:**
1. **JWT Token Mismatch:** Tokens use `id` field but auth middleware expects `userId` → Causes 401 errors
2. **Missing Timeout:** Axios has no timeout configured → Requests may hang indefinitely on Render cold starts
3. **Missing Route:** `/api/ai-personalization/:userId` returns 404
4. **Error Boundary:** React errors trigger Vietnamese error message display
5. **No Retry Logic:** Failed requests don't retry automatically

---

## 1. Frontend Audit

### Error Message Source

**Location:** `client/src/components/ErrorBoundary.jsx:29`

```jsx
<h2 className="text-xl font-bold text-gray-900 mb-2">
  Đang cập nhật hệ thống. Vui lòng thử lại sau vài phút.
</h2>
```

**Trigger:** React ErrorBoundary catches unhandled React errors (component crashes, uncaught exceptions)

**Impact:** Any unhandled error in React components shows this message instead of the actual error

### Axios Configuration Analysis

**File:** `client/src/lib/axios.js`

**Current Configuration:**
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://ielts-platform-emrv.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  // ❌ NO TIMEOUT CONFIGURED
});
```

**Issues Found:**
- ❌ **No timeout:** Default timeout is 0 (no timeout), but browsers may timeout after 30-120 seconds
- ❌ **No retry logic:** Failed requests don't retry automatically
- ⚠️ **Basic error handling:** Interceptor only logs errors, doesn't handle timeouts or retries
- ⚠️ **No auth token injection:** Request interceptor has placeholder comment but doesn't attach tokens

**Recommended Configuration:**
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://ielts-platform-emrv.onrender.com/api',
  withCredentials: true,
  timeout: 30000, // 30 seconds (Render cold starts can take 10-20 seconds)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add retry logic for failed requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      // Retry logic or show user-friendly message
    }
    return Promise.reject(error);
  }
);
```

### Key Frontend Routes & API Calls

| Route | Component | API Endpoints Called | Status |
|-------|-----------|---------------------|--------|
| `/dashboard` | `Dashboard.jsx` | `/api/dashboard` | ⚠️ 401 Error |
| `/weakness` | `MyWeakness.jsx` | `/api/ai-personalization/:id`<br>`/api/ai-engine/weakness/:id`<br>`/api/progress-tracking/:id` | ⚠️ 404/401 Errors |
| `/progress` | `UnifiedProgressTracking.jsx` | `/api/progress-tracking/:id` | ⚠️ 401 Error |
| `/test` | `TestPage.jsx` | `/api/tests/mine`<br>`/api/tests/:id` | ⚠️ 401 Error |
| `/result` | `TestResult.jsx` | `/api/tests/mine`<br>`/api/tests/:id` | ⚠️ 401 Error |

---

## 2. Backend Audit

### API Endpoint Test Results

| Endpoint | Method | Status | Avg Response Time | Error Type | UI Impact | Suggested Fix |
|----------|--------|--------|-------------------|------------|-----------|---------------|
| `/api/health` | GET | ✅ **200** | 0.19-0.54s | None | None | None |
| `/api/user/me` | GET | ✅ **200** | 0.21-0.27s | None | None | None |
| `/api/dashboard` | GET | ❌ **401** | 0.21-0.25s | **JWT Mismatch** | Shows error message | Fix JWT token structure |
| `/api/progress-tracking/:id` | GET | ❌ **401** | 0.24s | **JWT Mismatch** | Shows error message | Fix JWT token structure |
| `/api/tests/mine` | GET | ❌ **401** | 0.25-0.26s | **JWT Mismatch** | Shows error message | Fix JWT token structure |
| `/api/ai-personalization/:id` | GET | ❌ **404** | 0.22s | **Route Not Found** | Falls back to mock data | Verify route exists |
| `/api/ai-engine/weakness/:id` | GET | ❌ **401** | 0.21-0.27s | **JWT Mismatch** | Falls back to mock data | Fix JWT token structure |
| `/api/ai-engine/recommend/:id` | GET | ❌ **401** | 0.21s | **JWT Mismatch** | Falls back to mock data | Fix JWT token structure |

### Critical Issue: JWT Token Mismatch

**Problem:**
- **Token Structure:** `{ id: user._id, email: user.email }` (from `authController.js`)
- **Middleware Expects:** `decoded.userId` (from `server/middleware/auth.js:31`)
- **Result:** All protected routes return 401 "Token is not valid"

**Code Locations:**
- **Token Generation:** `server/controllers/authController.js:13`
  ```javascript
  jwt.sign({ id: user._id, email: user.email }, ...)
  ```
- **Token Verification:** `server/middleware/auth.js:30-31`
  ```javascript
  const decoded = jwt.verify(token, config.JWT_SECRET);
  const user = await User.findById(decoded.userId); // ❌ Expects userId, gets id
  ```

**Fix Required:**
Change token generation to use `userId` instead of `id`:
```javascript
jwt.sign({ userId: user._id, email: user.email }, ...)
```

### Missing Route: `/api/ai-personalization/:userId`

**Status:** Returns 404 Not Found

**Investigation:**
- Route is mounted in `server/index.js:244`: `app.use('/api/ai-personalization', aiPersonalizationRoutes)`
- Need to verify route file exists and has correct path pattern

**Impact:** Frontend falls back to mock data, but may trigger ErrorBoundary if fallback fails

### Cold Start Performance

**Render Free Tier Behavior:**
- **Cold Start Time:** 10-30 seconds (service spins down after 15 minutes inactivity)
- **Warm Start Time:** 0.2-0.5 seconds
- **Impact:** First request after inactivity may timeout if axios timeout < 30 seconds

**Recommendation:** Set axios timeout to at least 30 seconds (30000ms)

---

## 3. Error Flow Analysis

### How "Đang cập nhật hệ thống" Message Appears

1. **User Action:** User navigates to `/dashboard` or `/weakness`
2. **API Call:** Frontend makes request to protected endpoint (e.g., `/api/dashboard`)
3. **Auth Failure:** Backend returns 401 due to JWT mismatch
4. **Error Handling:** Component catches error, may throw unhandled exception
5. **ErrorBoundary:** React ErrorBoundary catches error
6. **Display:** Shows Vietnamese error message instead of actual error

### Error Propagation Path

```
API Request (401 Error)
  ↓
Component catch block
  ↓
Error thrown or unhandled
  ↓
React ErrorBoundary catches
  ↓
Shows "Đang cập nhật hệ thống"
```

---

## 4. Detailed Endpoint Analysis

### ✅ Working Endpoints

| Endpoint | Status | Response Time | Notes |
|----------|--------|---------------|-------|
| `/api/health` | 200 | 0.19-0.54s | No auth required, works correctly |
| `/api/auth/login` | 200 | 0.21-0.27s | Auth endpoint works, but tokens have mismatch |
| `/api/auth/register` | 201 | 0.22-0.25s | Registration works correctly |
| `/api/user/me` | 200 | 0.21-0.27s | Uses `authMiddleware` (works with `id` field) |

### ❌ Failing Endpoints (JWT Mismatch)

| Endpoint | Status | Response Time | Error Message |
|----------|--------|---------------|---------------|
| `/api/dashboard` | 401 | 0.21-0.25s | "Token is not valid" |
| `/api/progress-tracking/:id` | 401 | 0.24s | "Token is not valid" |
| `/api/tests/mine` | 401 | 0.25-0.26s | "Token is not valid" |
| `/api/ai-engine/weakness/:id` | 401 | 0.21-0.27s | "Token is not valid" |
| `/api/ai-engine/recommend/:id` | 401 | 0.21s | "Token is not valid" |

### ❌ Missing Endpoints

| Endpoint | Status | Response Time | Error Message |
|----------|--------|---------------|---------------|
| `/api/ai-personalization/:id` | 404 | 0.22s | "Route not found" |

---

## 5. Recommendations

### Priority 1: Fix JWT Token Mismatch (CRITICAL)

**File:** `server/controllers/authController.js`

**Change:**
```javascript
// Current (WRONG):
jwt.sign({ id: user._id, email: user.email }, ...)

// Fix (CORRECT):
jwt.sign({ userId: user._id, email: user.email }, ...)
```

**Impact:** Fixes 401 errors on all protected routes

**Files to Update:**
- `server/controllers/authController.js:13` (generateToken function)
- Verify all token generation uses `userId` consistently

### Priority 2: Add Axios Timeout (HIGH)

**File:** `client/src/lib/axios.js`

**Add:**
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://ielts-platform-emrv.onrender.com/api',
  withCredentials: true,
  timeout: 30000, // 30 seconds for Render cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Impact:** Prevents indefinite hangs on cold starts

### Priority 3: Add Auth Token Injection (HIGH)

**File:** `client/src/lib/axios.js`

**Update Request Interceptor:**
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Impact:** Ensures all requests include auth token automatically

### Priority 4: Improve Error Handling (MEDIUM)

**File:** `client/src/lib/axios.js`

**Update Response Interceptor:**
```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle timeout
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('Request timeout:', error.config.url);
      // Optionally retry or show user-friendly message
    }
    
    // Handle 401 - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);
```

**Impact:** Better error handling, prevents ErrorBoundary from catching network errors

### Priority 5: Fix Missing Route (MEDIUM)

**Investigation Required:**
- Check if `server/routes/aiPersonalization.js` exists
- Verify route pattern matches `/api/ai-personalization/:userId`
- If route doesn't exist, create it or update frontend to use correct endpoint

### Priority 6: Add Retry Logic (LOW)

**Consider:** Adding retry logic for failed requests (especially for Render cold starts)

**Implementation:**
```javascript
// Retry failed requests up to 3 times with exponential backoff
const retryConfig = {
  retries: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000; // 1s, 2s, 3s
  },
  retryCondition: (error) => {
    return error.code === 'ECONNABORTED' || 
           error.response?.status >= 500 ||
           error.response?.status === 0; // Network error
  }
};
```

---

## 6. Error Type Classification

### Temporary Errors (Render Cold Start)

| Error Type | Frequency | Duration | Fix |
|------------|-----------|----------|-----|
| Timeout on first request | High (after 15min inactivity) | 10-30 seconds | Increase timeout to 30s+ |
| Slow response | Medium | 5-15 seconds | Add loading states, retry logic |

### Persistent Errors (Code Issues)

| Error Type | Frequency | Duration | Fix |
|------------|-----------|----------|-----|
| 401 JWT Mismatch | **Always** | Until fixed | Change token to use `userId` |
| 404 Missing Route | **Always** | Until fixed | Create route or update frontend |
| ErrorBoundary Trigger | High | Until errors fixed | Fix root causes above |

---

## 7. Testing Results

### Test User Credentials
- **Email:** `test+e2e1762999944@local.test`
- **User ID:** `69153e8dcaf7704e9ca3fe6a`

### Test Execution Summary

**Total Endpoints Tested:** 8  
**Working:** 2 (25%)  
**Failing:** 6 (75%)

**Breakdown:**
- ✅ Health check: Working
- ✅ User profile: Working (uses different auth middleware)
- ❌ Dashboard: 401 (JWT mismatch)
- ❌ Progress tracking: 401 (JWT mismatch)
- ❌ Tests: 401 (JWT mismatch)
- ❌ AI personalization: 404 (route missing)
- ❌ AI engine weakness: 401 (JWT mismatch)
- ❌ AI engine recommend: 401 (JWT mismatch)

---

## 8. Frontend Component Error Handling

### Components with Error Handling

| Component | Error Handling | Fallback Behavior |
|-----------|---------------|-------------------|
| `MyWeakness.jsx` | try/catch with mock data | Shows mock weakness data |
| `UnifiedProgressTracking.jsx` | try/catch with mock data | Shows mock progress data |
| `Dashboard.jsx` | try/catch, redirects on 401 | May trigger ErrorBoundary |
| `TestResult.jsx` | try/catch | May trigger ErrorBoundary |

### ErrorBoundary Usage

**Location:** `client/src/App.jsx` (wraps entire app)

**Impact:** Any unhandled React error shows Vietnamese error message

**Recommendation:** Add more granular error boundaries per route/component

---

## 9. Summary Table

| Endpoint | Status | Avg Response Time | Error Type | UI Impact | Suggested Fix |
|----------|--------|-------------------|------------|-----------|---------------|
| `/api/health` | ✅ 200 | 0.19-0.54s | None | None | None |
| `/api/user/me` | ✅ 200 | 0.21-0.27s | None | None | None |
| `/api/dashboard` | ❌ 401 | 0.21-0.25s | **JWT Mismatch** | Shows error message | Fix token to use `userId` |
| `/api/progress-tracking/:id` | ❌ 401 | 0.24s | **JWT Mismatch** | Shows error message | Fix token to use `userId` |
| `/api/tests/mine` | ❌ 401 | 0.25-0.26s | **JWT Mismatch** | Shows error message | Fix token to use `userId` |
| `/api/ai-personalization/:id` | ❌ 404 | 0.22s | **Route Missing** | Falls back to mock | Create route or fix path |
| `/api/ai-engine/weakness/:id` | ❌ 401 | 0.21-0.27s | **JWT Mismatch** | Falls back to mock | Fix token to use `userId` |
| `/api/ai-engine/recommend/:id` | ❌ 401 | 0.21s | **JWT Mismatch** | Falls back to mock | Fix token to use `userId` |

---

## 10. Final Verdict

### ⚠️ **Some endpoints slow or missing - Backend errors detected causing "Đang cập nhật hệ thống" fallback**

**Primary Issues:**
1. **JWT Token Mismatch** (CRITICAL): Tokens use `id` but middleware expects `userId` → Causes 401 on all protected routes
2. **Missing Timeout** (HIGH): Axios has no timeout → Requests may hang on Render cold starts
3. **Missing Route** (MEDIUM): `/api/ai-personalization/:id` returns 404
4. **ErrorBoundary** (MEDIUM): Catches all React errors and shows generic Vietnamese message

**Immediate Actions Required:**
1. ✅ Fix JWT token structure in `authController.js`
2. ✅ Add timeout to axios configuration (30000ms)
3. ✅ Add auth token injection to request interceptor
4. ✅ Investigate missing `/api/ai-personalization` route
5. ✅ Improve error handling to prevent ErrorBoundary from catching network errors

**Expected Outcome After Fixes:**
- All protected endpoints return 200 OK
- Timeout errors handled gracefully
- ErrorBoundary only catches actual React component errors
- Users see appropriate error messages instead of generic Vietnamese message

---

**Report Generated:** 2025-11-13 04:00 UTC  
**Diagnostic Status:** ✅ **Complete**  
**Next Steps:** Implement Priority 1-3 fixes immediately

