import React from 'react';

const ReadingSelect = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-green-700 mb-4">
            📖 IELTS Reading Test
          </h1>
          <p className="text-gray-600 text-lg">
            Practice your reading skills with authentic IELTS-style passages
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Academic Reading */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-6xl mb-4">🎓</div>
              <h2 className="text-2xl font-bold text-green-700 mb-4">Academic Reading</h2>
              <p className="text-gray-600 mb-6">
                3 passages with 40 questions total. Topics include academic subjects like science, 
                history, and social studies.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Test Format:</h3>
                <ul className="text-sm text-blue-700 text-left">
                  <li>• 60 minutes duration</li>
                  <li>• 3 academic passages</li>
                  <li>• 40 questions total</li>
                  <li>• Multiple choice, True/False, Fill in the blanks</li>
                </ul>
              </div>
              <a
                href="/reading/test?type=academic"
                className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Start Academic Reading Test
              </a>
            </div>
          </div>

          {/* General Training Reading */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-6xl mb-4">💼</div>
              <h2 className="text-2xl font-bold text-green-700 mb-4">General Training Reading</h2>
              <p className="text-gray-600 mb-6">
                3 sections with everyday topics like advertisements, workplace documents, 
                and general interest articles.
              </p>
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-800 mb-2">Test Format:</h3>
                <ul className="text-sm text-green-700 text-left">
                  <li>• 60 minutes duration</li>
                  <li>• 3 sections</li>
                  <li>• 40 questions total</li>
                  <li>• Multiple choice, True/False, Fill in the blanks</li>
                </ul>
              </div>
              <button
                disabled
                className="inline-block bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-center text-green-700 mb-8">
            🎯 What You'll Get
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">⏱️</div>
              <h4 className="font-semibold text-gray-800 mb-2">Real-time Timer</h4>
              <p className="text-sm text-gray-600">
                60-minute countdown timer just like the real IELTS test
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h4 className="font-semibold text-gray-800 mb-2">AI Feedback</h4>
              <p className="text-sm text-gray-600">
                Detailed feedback and improvement suggestions using AI
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <h4 className="font-semibold text-gray-800 mb-2">Band Score</h4>
              <p className="text-sm text-gray-600">
                Accurate band score calculation based on Cambridge criteria
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="text-green-600 hover:text-green-700 underline font-medium"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default ReadingSelect;
