import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ModernDashboard from './pages/ModernDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import Pricing from './pages/Pricing';
import TestIntro from './pages/Test/TestIntro';
import TestPage from './pages/Test/TestPage';
import TestResult from './pages/Test/TestResult';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<ModernDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/payment/:testId" element={<Payment />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/test/start" element={<TestIntro />} />
            <Route path="/test/:skill" element={<TestPage />} />
            <Route path="/test/result/:id" element={<TestResult />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}