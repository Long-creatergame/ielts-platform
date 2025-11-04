import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import './i18n';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import Pricing from './pages/Pricing';
import TestIntro from './pages/Test/TestIntro';
import TestPage from './pages/Test/TestPage';
import TestResult from './pages/Test/TestResult';
import TestHistory from './pages/TestHistory';
// ⚠️ Removed orphan import (./pages/QuickPractice)
// import QuickPractice from './pages/QuickPractice';
import PracticePage from './pages/PracticePage';
import Review from './pages/Review';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Leaderboard from './pages/Leaderboard';
import ChatLauncher from './components/ChatLauncher';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <ChatLauncher zaloUrl={import.meta.env.VITE_ZALO_URL || 'https://zalo.me/0923456789'} />
            <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/payment/:testId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/test/start" element={<ProtectedRoute><TestIntro /></ProtectedRoute>} />
            <Route path="/test/:skill" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />
            <Route path="/test/result" element={<ProtectedRoute><TestResult /></ProtectedRoute>} />
            <Route path="/test/result/:id" element={<ProtectedRoute><TestResult /></ProtectedRoute>} />
            <Route path="/test/result/quick" element={<ProtectedRoute><TestResult /></ProtectedRoute>} />
            <Route path="/test-history" element={<ProtectedRoute><TestHistory /></ProtectedRoute>} />
            {/* ⚠️ Removed orphan route (QuickPractice component deleted) */}
            <Route path="/practice" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
            <Route path="/review/:sessionId" element={<ProtectedRoute><Review /></ProtectedRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            </Routes>
          </div>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}