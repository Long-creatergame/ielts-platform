import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export default function Review() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reading');
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('Session ID required');
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        const response = await fetch(`${API_BASE}/exam/result/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setResultData(data.data);
        } else {
          setError(data.message || 'Failed to load results');
        }
      } catch (err) {
        setError('Failed to load review data. Please try again later.');
        console.error('[Review] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [sessionId]);

  const handleGenerateLearningPath = async () => {
    try {
      const response = await fetch(`${API_BASE}/learningpath/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user?.id || user?._id,
          results: resultData
        })
      });
      const data = await response.json();
      if (data.success) {
        navigate('/learning-path');
      }
    } catch (err) {
      console.error('[Review] Learning path error:', err);
    }
  };

  const skills = ['reading', 'listening', 'writing', 'speaking'];
  const bandScores = resultData?.bandScores || {};
  const feedback = resultData?.feedback || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Test Review</h1>

      {/* Overall Band Score */}
      {resultData?.overall && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 mb-6">
          <div className="text-center">
            <p className="text-sm opacity-90 mb-2">Overall Band Score</p>
            <p className="text-5xl font-bold">{resultData.overall.toFixed(1)}</p>
          </div>
        </div>
      )}

      {/* Skill Tabs */}
      <div className="border-b mb-6">
        <div className="flex space-x-4">
          {skills.map((skill) => (
            <button
              key={skill}
              onClick={() => setActiveTab(skill)}
              className={`px-4 py-2 font-semibold capitalize border-b-2 transition-colors ${
                activeTab === skill
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {skill} {bandScores[skill] ? `(${bandScores[skill].toFixed(1)})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white border rounded-lg p-6">
        {activeTab === 'reading' || activeTab === 'listening' ? (
          <div>
            <h3 className="text-xl font-semibold mb-4 capitalize">{activeTab} Results</h3>
            {bandScores[activeTab] ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold">{bandScores[activeTab].toFixed(1)}</span>
                  <span className="text-gray-600">Band Score</span>
                </div>
                <div className="p-4 bg-gray-50 rounded">
                  <p className="font-semibold mb-2">Correct Answers</p>
                  <p className="text-gray-600">Review your answers below. Correct answers are highlighted in green.</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No results available for {activeTab}.</p>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold mb-4 capitalize">{activeTab} Feedback</h3>
            {feedback[activeTab] || feedback.feedback ? (
              <div className="space-y-4">
                {bandScores[activeTab] && (
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold">{bandScores[activeTab].toFixed(1)}</span>
                    <span className="text-gray-600">Band Score</span>
                  </div>
                )}
                <div className="p-4 bg-gray-50 rounded">
                  <p className="font-semibold mb-2">AI Feedback</p>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {typeof feedback[activeTab] === 'object' 
                      ? feedback[activeTab]?.summary || JSON.stringify(feedback[activeTab], null, 2)
                      : feedback.feedback?.summary || feedback.feedback || 'No feedback available yet.'}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No feedback available for {activeTab} yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Generate Learning Path Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleGenerateLearningPath}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Generate Learning Path
        </button>
      </div>
    </div>
  );
}


