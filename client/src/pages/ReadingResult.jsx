import React, { useState, useEffect } from 'react';

const ReadingResult = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResult = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const resultId = urlParams.get('id');
        
        if (!resultId) {
          window.location.href = '/reading/select';
          return;
        }

        const response = await fetch('http://localhost:4000/api/reading/results');
        const data = await response.json();
        
        const foundResult = data.items.find(item => item._id === resultId);
        if (foundResult) {
          setResult(foundResult);
        } else {
          console.error('Result not found');
        }
      } catch (error) {
        console.error('Error loading result:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, []);

  const getBandColor = (bandScore) => {
    if (bandScore >= 8) return 'text-green-600';
    if (bandScore >= 7) return 'text-blue-600';
    if (bandScore >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBandLabel = (bandScore) => {
    if (bandScore >= 8.5) return 'Excellent';
    if (bandScore >= 7.5) return 'Good';
    if (bandScore >= 6.5) return 'Competent';
    if (bandScore >= 5.5) return 'Modest';
    return 'Limited';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Result Not Found</h1>
          <a href="/reading/select" className="text-green-600 hover:text-green-700 underline">
            ← Back to Reading Tests
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700 mb-2">
            📖 Reading Test Results
          </h1>
          <p className="text-gray-600">
            Completed on {new Date(result.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Score Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getBandColor(result.bandScore)} mb-2`}>
                {result.bandScore}
              </div>
              <div className="text-sm text-gray-600 mb-1">Band Score</div>
              <div className={`text-sm font-medium ${getBandColor(result.bandScore)}`}>
                {getBandLabel(result.bandScore)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {result.correctCount}/{result.totalQuestions}
              </div>
              <div className="text-sm text-gray-600 mb-1">Correct Answers</div>
              <div className="text-sm font-medium text-gray-800">
                {((result.correctCount / result.totalQuestions) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {result.duration}m
              </div>
              <div className="text-sm text-gray-600 mb-1">Time Used</div>
              <div className="text-sm font-medium text-gray-800">
                out of 60 minutes
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-medium">{((result.correctCount / result.totalQuestions) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(result.correctCount / result.totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Feedback */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🤖 AI Feedback & Analysis
          </h3>
          <div className="prose max-w-none">
            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
              {result.sectionFeedback}
            </div>
          </div>
        </div>

        {/* Answer Review */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📝 Answer Review
          </h3>
          <div className="space-y-4">
            {result.answers && result.answers.map((answer, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">Question {answer.questionId}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    answer.isCorrect 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Your answer:</span>
                    <div className="font-medium text-gray-800">
                      {answer.userAnswer || 'No answer provided'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Correct answer:</span>
                    <div className="font-medium text-gray-800">{answer.correctAnswer}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/reading/select"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
          >
            Take Another Test
          </a>
          <a
            href="/reading/history"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-center"
          >
            View History
          </a>
          <a
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default ReadingResult;
