import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ListeningAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/listening/analytics/guest");
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error('Error loading listening analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data || data.totalTests === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-green-700 mb-8">
            📊 Listening Analytics Dashboard
          </h1>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🎧</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-6">
              Take some listening tests to see your analytics and progress!
            </p>
            <a
              href="/listening/test"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Take Your First Test
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700 mb-2">
            📊 Listening Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Track your listening progress and performance over time
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{data.totalTests}</div>
            <div className="text-sm text-gray-600">Total Tests</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{data.averageBand}</div>
            <div className="text-sm text-gray-600">Average Band Score</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{data.averageAccuracy}%</div>
            <div className="text-sm text-gray-600">Average Accuracy</div>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.results}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="testNumber" 
                label={{ value: 'Test Number', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                yAxisId="band"
                domain={[0, 9]}
                label={{ value: 'Band Score', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="accuracy"
                orientation="right"
                domain={[0, 100]}
                label={{ value: 'Accuracy (%)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'bandScore' ? `${value} band` : `${value}%`, 
                  name === 'bandScore' ? 'Band Score' : 'Accuracy'
                ]}
                labelFormatter={(label) => `Test ${label}`}
              />
              <Legend />
              <Line 
                yAxisId="band"
                type="monotone" 
                dataKey="bandScore" 
                stroke="#35b86d" 
                strokeWidth={3}
                activeDot={{ r: 6 }}
                name="Band Score"
              />
              <Line 
                yAxisId="accuracy"
                type="monotone" 
                dataKey="accuracy" 
                stroke="#8884d8" 
                strokeWidth={3}
                activeDot={{ r: 6 }}
                name="Accuracy"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Tests Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Test Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3">Test #</th>
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-left py-2 px-3">Band Score</th>
                  <th className="text-left py-2 px-3">Accuracy</th>
                  <th className="text-left py-2 px-3">Correct</th>
                  <th className="text-left py-2 px-3">Duration</th>
                </tr>
              </thead>
              <tbody>
                {data.results.slice(0, 10).map((result, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">{result.testNumber}</td>
                    <td className="py-2 px-3 text-gray-600">{result.date}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${
                        result.bandScore >= 8 ? 'bg-green-100 text-green-800' :
                        result.bandScore >= 7 ? 'bg-blue-100 text-blue-800' :
                        result.bandScore >= 6 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.bandScore}
                      </span>
                    </td>
                    <td className="py-2 px-3">{result.accuracy}%</td>
                    <td className="py-2 px-3">{result.correctCount}/{result.totalQuestions}</td>
                    <td className="py-2 px-3">{result.duration}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a
            href="/listening/test"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors mr-4"
          >
            Take New Test
          </a>
          <a
            href="/listening/history"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors mr-4"
          >
            View Full History
          </a>
          <a
            href="/dashboard"
            className="text-green-600 hover:text-green-700 underline font-medium"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default ListeningAnalytics;
