import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Payment() {
  const { testId } = useParams();
  const { user } = useAuth();

  const handleUnlock = () => {
    alert('Test unlocked! You can now view detailed results.');
    // In a real app, this would call the payment API
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          💳 Unlock Test Results
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Get detailed feedback and analysis for your IELTS test results.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">What You'll Get</h2>
          <ul className="text-left space-y-2 text-blue-700">
            <li>✅ Detailed band score breakdown</li>
            <li>✅ Personalized feedback for each skill</li>
            <li>✅ Improvement suggestions</li>
            <li>✅ Answer explanations</li>
            <li>✅ Progress tracking</li>
          </ul>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleUnlock}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Unlock Results - $9.99
          </button>
          <Link
            to="/dashboard"
            className="block text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
