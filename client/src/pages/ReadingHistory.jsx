import React, { useState, useEffect } from 'react';

const ReadingHistory = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  useEffect(() => {
    loadResults();
  }, [pagination.page]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/reading/history/guest');
      const data = await response.json();
      setResults(data);
      setPagination(prev => ({
        ...prev,
        total: data.length,
        limit: 10
      }));
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBandColor = (bandScore) => {
    if (bandScore >= 8) return 'text-green-600 bg-green-50';
    if (bandScore >= 7) return 'text-blue-600 bg-blue-50';
    if (bandScore >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getBandLabel = (bandScore) => {
    if (bandScore >= 8.5) return 'Excellent';
    if (bandScore >= 7.5) return 'Good';
    if (bandScore >= 6.5) return 'Competent';
    if (bandScore >= 5.5) return 'Modest';
    return 'Limited';
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700 mb-2">
            📖 Reading Test History
          </h1>
          <p className="text-gray-600 mb-4">
            Track your progress and review past performances
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/reading/select"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Take New Test
            </a>
            <a
              href="/reading/analytics"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              📊 View Analytics
            </a>
            <a
              href="/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Dashboard
            </a>
          </div>
        </div>

        {/* Stats Summary */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Statistics</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{results.length}</div>
                <div className="text-sm text-gray-600">Tests Taken</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(results.reduce((sum, r) => sum + r.bandScore, 0) / results.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Average Band</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.max(...results.map(r => r.bandScore)).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Best Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.min(...results.map(r => r.bandScore)).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Lowest Score</div>
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Tests Taken Yet</h3>
            <p className="text-gray-600 mb-6">
              Start your IELTS Reading journey by taking your first test!
            </p>
            <a
              href="/reading/select"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Take Your First Test
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result) => (
              <div key={result._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {result.testType.charAt(0).toUpperCase() + result.testType.slice(1)} Reading Test
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(result.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 md:mt-0">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getBandColor(result.bandScore).split(' ')[0]}`}>
                        {result.bandScore}
                      </div>
                      <div className="text-xs text-gray-600">Band Score</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-800">
                        {result.correctCount}/{result.totalQuestions}
                      </div>
                      <div className="text-xs text-gray-600">Correct</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-800">
                        {result.duration}m
                      </div>
                      <div className="text-xs text-gray-600">Time</div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Performance</span>
                    <span className="font-medium">
                      {((result.correctCount / result.totalQuestions) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(result.correctCount / result.totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBandColor(result.bandScore)}`}>
                    {getBandLabel(result.bandScore)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                    {result.testType}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={`/reading/result?id=${result._id}`}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors text-center"
                  >
                    View Details
                  </a>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to retake this test?')) {
                        window.location.href = '/reading/select';
                      }
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors text-center"
                  >
                    Retake Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {pagination.page} of {totalPages}
            </span>
            <button
              disabled={pagination.page >= totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a
            href="/reading/select"
            className="text-green-600 hover:text-green-700 underline font-medium mr-4"
          >
            Take New Test
          </a>
          <a
            href="/dashboard"
            className="text-gray-600 hover:text-gray-700 underline font-medium"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default ReadingHistory;
