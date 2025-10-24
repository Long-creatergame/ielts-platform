import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestHistory = () => {
  const { user } = useAuth();
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    loadTestHistory();
  }, []);

  const loadTestHistory = async () => {
    try {
      const response = await fetch('/api/tests/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestHistory(data.tests || []);
      }
    } catch (error) {
      console.error('Error loading test history:', error);
      // Mock data for demonstration
      setTestHistory([
        {
          id: 1,
          testType: 'IELTS Academic',
          level: 'A2',
          date: '2024-01-15',
          duration: '2h 30m',
          overallScore: 6.5,
          skills: {
            reading: { score: 6.5, band: 'B2' },
            listening: { score: 7.0, band: 'B2' },
            writing: { score: 6.0, band: 'B1' },
            speaking: { score: 6.5, band: 'B2' }
          },
          status: 'completed'
        },
        {
          id: 2,
          testType: 'IELTS General',
          level: 'B1',
          date: '2024-01-10',
          duration: '2h 15m',
          overallScore: 7.0,
          skills: {
            reading: { score: 7.0, band: 'B2' },
            listening: { score: 7.5, band: 'B2' },
            writing: { score: 6.5, band: 'B2' },
            speaking: { score: 7.0, band: 'B2' }
          },
          status: 'completed'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getBandColor = (band) => {
    const bandColors = {
      'A1': 'bg-red-100 text-red-800',
      'A2': 'bg-orange-100 text-orange-800',
      'B1': 'bg-yellow-100 text-yellow-800',
      'B2': 'bg-blue-100 text-blue-800',
      'C1': 'bg-green-100 text-green-800',
      'C2': 'bg-purple-100 text-purple-800'
    };
    return bandColors[band] || 'bg-gray-100 text-gray-800';
  };

  const getScoreColor = (score) => {
    if (score >= 8.0) return 'text-green-600';
    if (score >= 7.0) return 'text-blue-600';
    if (score >= 6.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 Test History</h1>
          <p className="mt-2 text-gray-600">View your completed IELTS tests and track your progress</p>
        </div>

        {/* Test History List */}
        <div className="space-y-6">
          {testHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tests Completed Yet</h3>
              <p className="text-gray-600 mb-6">Start your first IELTS test to see your results here</p>
              <a
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Take Your First Test
              </a>
            </div>
          ) : (
            testHistory.map((test) => (
              <div key={test.id} className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{test.testType}</h3>
                      <p className="text-sm text-gray-600">
                        Level: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBandColor(test.level)}`}>
                          {test.level}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Completed on</p>
                      <p className="font-medium text-gray-900">{new Date(test.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Overall Score */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Overall Score</span>
                      <span className={`text-2xl font-bold ${getScoreColor(test.overallScore)}`}>
                        {test.overallScore}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(test.overallScore / 9) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Skills Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {Object.entries(test.skills).map(([skill, data]) => (
                      <div key={skill} className="text-center">
                        <div className="text-sm font-medium text-gray-700 capitalize">{skill}</div>
                        <div className={`text-lg font-bold ${getScoreColor(data.score)}`}>
                          {data.score}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getBandColor(data.band)}`}>
                          {data.band}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedTest(test)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      📊 View Details
                    </button>
                    <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
                      📄 Download Report
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Test Details Modal */}
        {selectedTest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Test Details</h2>
                  <button
                    onClick={() => setSelectedTest(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Test Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Test Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Test Type:</span>
                        <span className="ml-2 font-medium">{selectedTest.testType}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Level:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getBandColor(selectedTest.level)}`}>
                          {selectedTest.level}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <span className="ml-2 font-medium">{new Date(selectedTest.date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-2 font-medium">{selectedTest.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Breakdown */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Skills Breakdown</h3>
                    <div className="space-y-4">
                      {Object.entries(selectedTest.skills).map(([skill, data]) => (
                        <div key={skill} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-700 capitalize w-20">{skill}</span>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className={`text-lg font-bold ${getScoreColor(data.score)}`}>
                                  {data.score}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBandColor(data.band)}`}>
                                  {data.band}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${(data.score / 9) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 Recommendations</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Focus on improving your weakest skill</li>
                      <li>• Practice more with authentic IELTS materials</li>
                      <li>• Consider taking another test in 2-3 weeks</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setSelectedTest(null)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    📄 Download Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestHistory;
