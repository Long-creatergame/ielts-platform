import React, { useEffect, useState } from "react";

const ListeningHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/listening/history/guest");
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error("Error loading listening history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getBandColor = (bandScore) => {
    if (bandScore >= 8) return 'text-green-600 bg-green-50';
    if (bandScore >= 7) return 'text-blue-600 bg-blue-50';
    if (bandScore >= 6) return 'text-yellow-600 bg-yellow-50';
    if (bandScore >= 5) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getBandLevel = (bandScore) => {
    if (bandScore >= 8) return 'Expert';
    if (bandScore >= 7) return 'Good';
    if (bandScore >= 6) return 'Competent';
    if (bandScore >= 5) return 'Modest';
    return 'Limited';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listening history...</p>
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
            🎧 Listening Test History
          </h1>
          <p className="text-gray-600 mb-4">
            Track your listening progress and review past performances
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/listening/test"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Take New Test
            </a>
            <a
              href="/listening/analytics"
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
        {history.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {history.length}
                </div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(history.reduce((sum, h) => sum + h.bandScore, 0) / history.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Average Band</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.max(...history.map(h => h.bandScore)).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Highest Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.min(...history.map(h => h.bandScore)).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Lowest Score</div>
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        {history.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🎧</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Listening Tests Yet</h3>
            <p className="text-gray-600 mb-6">
              Take your first listening test to start tracking your progress!
            </p>
            <a
              href="/listening/test"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Take Your First Test
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((test, index) => (
              <div key={test._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Listening Test #{history.length - index}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(test.createdAt).toLocaleDateString()} at {new Date(test.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getBandColor(test.bandScore)}`}>
                      Band {test.bandScore} - {getBandLevel(test.bandScore)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Correct Answers</div>
                    <div className="text-xl font-bold text-green-600">
                      {test.correctCount}/{test.totalQuestions}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Accuracy</div>
                    <div className="text-xl font-bold text-blue-600">
                      {((test.correctCount / test.totalQuestions) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Duration</div>
                    <div className="text-xl font-bold text-purple-600">
                      {test.duration}m
                    </div>
                  </div>
                </div>

                {test.feedback && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <h4 className="font-semibold text-blue-800 mb-2">AI Feedback:</h4>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      {test.feedback.substring(0, 200)}...
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeningHistory;
