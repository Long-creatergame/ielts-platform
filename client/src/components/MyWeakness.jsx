import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
// Removed mockAPI import for production build

const MyWeakness = () => {
  const { t } = useTranslation();
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
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      // Try AI personalization API first
      const response = await fetch(`${API_BASE_URL}/api/ai-personalization/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform AI personalization data to weakness format
          const personalization = data.data;
          setWeaknessData({
            strengths: personalization.strengths || [],
            weaknesses: personalization.weaknesses || [],
            recommendations: personalization.recommendations || [],
            overallScore: personalization.overallScore || 0,
            skillBreakdown: personalization.skillBreakdown || {}
          });
          return;
        }
      }

      // Fallback to AI engine API
      const fallbackResponse = await fetch(`${API_BASE_URL}/api/ai-engine/weakness/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        if (data.success) {
          setWeaknessData(data.data);
        }
      } else {
        // Generate mock data if both APIs fail
        setWeaknessData(generateMockWeaknessData());
      }
    } catch (error) {
      console.error('Fetch weakness error:', error);
      setWeaknessData(generateMockWeaknessData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockWeaknessData = () => {
    return {
      strengths: [
        { area: 'Reading Comprehension', score: 7.5, description: 'Strong ability to understand complex texts' },
        { area: 'Listening Accuracy', score: 7.0, description: 'Good listening skills with high accuracy' },
        { area: 'Vocabulary Range', score: 6.5, description: 'Wide vocabulary range in responses' }
      ],
      weaknesses: [
        { area: 'Writing Task Response', score: 5.5, description: 'Need to improve task achievement in writing' },
        { area: 'Speaking Fluency', score: 5.0, description: 'Speaking fluency needs improvement' },
        { area: 'Grammar Accuracy', score: 5.5, description: 'Grammar errors affecting overall score' }
      ],
      recommendations: [
        'Focus on writing task requirements and structure',
        'Practice speaking exercises daily',
        'Review grammar rules and common mistakes',
        'Take more practice tests to improve timing'
      ],
      overallScore: 6.0,
      skillBreakdown: {
        reading: { score: 7.5, trend: 'up' },
        listening: { score: 7.0, trend: 'stable' },
        writing: { score: 5.5, trend: 'down' },
        speaking: { score: 5.0, trend: 'down' }
      }
    };
  };

  const fetchProgressData = async () => {
    try {
      // Try to fetch from progress tracking API
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/progress-tracking/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform progress data to chart format
          const progressData = data.data.dailyProgress || [];
          setProgressData(progressData.map(item => ({
            date: item.date,
            reading: item.reading,
            writing: item.writing,
            listening: item.listening,
            speaking: item.speaking,
            overall: item.overall
          })));
          return;
        }
      }

      // Fallback to mock data
      const mockProgressData = [
        { date: '2024-01-01', grammar: 5.0, lexical: 5.5, coherence: 6.0, pronunciation: 5.5 },
        { date: '2024-01-15', grammar: 5.5, lexical: 6.0, coherence: 6.5, pronunciation: 6.0 },
        { date: '2024-02-01', grammar: 6.0, lexical: 6.5, coherence: 7.0, pronunciation: 6.5 }
      ];
      setProgressData(mockProgressData);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 {t('weakness.title')}</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">{t('weakness.noData')}</p>
          <p className="text-sm text-gray-500">{t('weakness.noDataDesc')}</p>
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('weakness.title')}</h2>
        <p className="text-gray-600 text-lg">{t('weakness.subtitle')}</p>
      </div>
      
      {/* Overall Progress */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">{t('weakness.overallProgress')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">{t('weakness.totalSubmissions')}</div>
            <div className="text-2xl font-bold text-blue-600">{weaknessData.total_submissions || 0}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">{t('weakness.improvementTrend')}</div>
            <div className={`text-2xl font-bold ${
              weaknessData.improvement_trend === 'improving' ? 'text-green-600' :
              weaknessData.improvement_trend === 'stable' ? 'text-blue-600' : 'text-red-600'
            }`}>
              {weaknessData.improvement_trend || 'stable'}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">{t('weakness.lastUpdated')}</div>
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
            navigate('/dashboard?tab=recommendations');
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
