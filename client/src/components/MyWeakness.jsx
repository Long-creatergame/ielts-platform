import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MyWeakness = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [weaknessData, setWeaknessData] = useState(null);
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    if (user) {
      fetchWeaknessData();
      fetchProgressData();
    }
  }, [user]);

  const fetchWeaknessData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ai-engine/weakness/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setWeaknessData(data.data);
      }
    } catch (error) {
      console.error('Fetch weakness error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ai-engine/progress/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setProgressData(data.data);
      }
    } catch (error) {
      console.error('Fetch progress error:', error);
    }
  };

  const getWeaknessLevel = (score) => {
    if (score >= 7) return { level: 'Strong', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 6) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 5) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Needs Improvement', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const getImprovementAdvice = (area, score) => {
    const advice = {
      grammar: {
        high: "Excellent grammar! Continue practicing complex structures.",
        medium: "Good grammar foundation. Focus on advanced tenses and conditionals.",
        low: "Focus on basic grammar rules. Practice present, past, and future tenses."
      },
      lexical: {
        high: "Great vocabulary range! Try using more academic and formal language.",
        medium: "Good vocabulary. Expand with synonyms and collocations.",
        low: "Build vocabulary systematically. Learn word families and common phrases."
      },
      coherence: {
        high: "Excellent organization! Practice different essay structures.",
        medium: "Good structure. Work on linking ideas more smoothly.",
        low: "Focus on clear paragraph structure and logical flow."
      },
      pronunciation: {
        high: "Great pronunciation! Practice intonation and stress patterns.",
        medium: "Good pronunciation. Focus on word stress and sentence rhythm.",
        low: "Practice individual sounds and basic pronunciation patterns."
      }
    };

    const level = score >= 7 ? 'high' : score >= 5 ? 'medium' : 'low';
    return advice[area][level];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!weaknessData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 My Weakness Profile</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No weakness data available yet.</p>
          <p className="text-sm text-gray-500">Complete some AI assessments to see your weakness profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📈</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Weakness Profile</h2>
        <p className="text-gray-600 text-lg">Track your progress and identify areas for improvement</p>
      </div>
      
      {/* Overall Progress */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Overall Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Submissions</div>
            <div className="text-2xl font-bold text-blue-600">{weaknessData.total_submissions || 0}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Improvement Trend</div>
            <div className={`text-2xl font-bold ${
              weaknessData.improvement_trend === 'improving' ? 'text-green-600' :
              weaknessData.improvement_trend === 'stable' ? 'text-blue-600' : 'text-red-600'
            }`}>
              {weaknessData.improvement_trend || 'stable'}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Last Updated</div>
            <div className="text-sm font-bold text-purple-600">
              {new Date(weaknessData.last_updated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Weakness Breakdown */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Skill Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(weaknessData.weakness).map(([skill, score]) => {
            const weaknessInfo = getWeaknessLevel(score);
            const advice = getImprovementAdvice(skill, score);
            
            return (
              <div key={skill} className={`p-4 rounded-lg border ${weaknessInfo.bgColor}`}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium capitalize">{skill}</h4>
                  <span className={`font-bold ${weaknessInfo.color}`}>
                    {score.toFixed(1)}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full ${
                      score >= 7 ? 'bg-green-500' :
                      score >= 6 ? 'bg-blue-500' :
                      score >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(score / 9) * 100}%` }}
                  ></div>
                </div>
                
                <div className="text-sm">
                  <div className={`font-medium ${weaknessInfo.color} mb-1`}>
                    {weaknessInfo.level}
                  </div>
                  <div className="text-gray-600 text-xs">
                    {advice}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Chart */}
      {progressData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Progress Over Time</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center text-gray-600">
              <p>Progress chart will be displayed here</p>
              <p className="text-sm">Showing {progressData.length} recent assessments</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={fetchWeaknessData}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Refresh Data
        </button>
        <button
          onClick={() => {
            // Navigate to AI Recommendations
            window.location.href = '/dashboard#recommendations';
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Get Practice Recommendations
        </button>
      </div>
    </div>
  );
};

export default MyWeakness;
