import React from 'react';
import { Link } from 'react-router-dom';

export default function Demo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">IELTS Platform Demo</h1>
          <p className="text-lg text-gray-600">
            Try out our AI-powered IELTS test experience without signing up!
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Demo Mode:</strong> You can take a full test experience with all 4 skills (Reading, Listening, Writing, Speaking). 
            Your progress will not be saved permanently.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">📖</div>
              <h3 className="font-semibold mb-1">Reading</h3>
              <p className="text-sm text-gray-600">3 passages, 40 questions</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">🎧</div>
              <h3 className="font-semibold mb-1">Listening</h3>
              <p className="text-sm text-gray-600">4 sections, audio playback</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">✍️</div>
              <h3 className="font-semibold mb-1">Writing</h3>
              <p className="text-sm text-gray-600">Task 1 & 2 with AI feedback</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">🎤</div>
              <h3 className="font-semibold mb-1">Speaking</h3>
              <p className="text-sm text-gray-600">Real-time recording</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            to="/exam/start?mode=demo"
            className="block w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-lg shadow-lg"
          >
            🚀 Start Demo Test
          </Link>
          
          <Link
            to="/login"
            className="block w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-semibold"
          >
            Sign Up for Full Access
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            This is a demo version. Results are for demonstration purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}

