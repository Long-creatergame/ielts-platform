import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TestPage from './pages/TestPage'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import ResultPage from './pages/ResultPage'
import VerifyPage from './pages/VerifyPage'
import WritingTest from './pages/WritingTest'
import WritingHistory from './pages/WritingHistory'
import WritingTask1 from './pages/WritingTask1'
import WritingTask1History from './pages/WritingTask1History'
import ReadingSelect from './pages/ReadingSelect'
import ReadingTest from './pages/ReadingTest'
import ReadingResult from './pages/ReadingResult'
import ReadingHistory from './pages/ReadingHistory'
import ReadingAnalytics from './pages/ReadingAnalytics'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/test/:skill" 
              element={
                <ProtectedRoute>
                  <TestPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment-success" 
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment-cancel" 
              element={
                <ProtectedRoute>
                  <PaymentCancel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/result" 
              element={
                <ProtectedRoute>
                  <ResultPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/writing" element={<WritingTest />} />
            <Route path="/writing/history" element={<WritingHistory />} />
            <Route path="/writing/task1" element={<WritingTask1 />} />
            <Route path="/writing/task1/history" element={<WritingTask1History />} />
            <Route path="/reading/select" element={<ReadingSelect />} />
            <Route path="/reading/test" element={<ReadingTest />} />
            <Route path="/reading/result" element={<ReadingResult />} />
            <Route path="/reading/history" element={<ReadingHistory />} />
            <Route path="/reading/analytics" element={<ReadingAnalytics />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
