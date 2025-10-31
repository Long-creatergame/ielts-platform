import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import FeatureGuide from '../../components/FeatureGuide';
import AIEncouragement from '../../components/AIEncouragement';

export default function TestResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [previousScore, setPreviousScore] = useState(null);

  useEffect(() => {
    loadTestResult();
  }, [id]);

  const loadPreviousScore = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/tests/user-tests?limit=2`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 1) {
          setPreviousScore(data.data[1].score?.overall || 0);
        }
      }
    } catch (error) {
      console.error('Error loading previous score:', error);
    }
  };

  const loadTestResult = async () => {
    try {
      setLoading(true);
      
      // Try to get from location state first
      if (location.state?.testResult) {
        setTestResult(location.state.testResult);
        loadPreviousScore();
        setLoading(false);
        return;
      }

      // Try to get from localStorage
      try {
        const localResult = localStorage.getItem('latestTestResult');
        if (localResult) {
          const parsedResult = JSON.parse(localResult);
          // Ensure required fields exist and transform data if needed
          if (parsedResult && (parsedResult.overallBand !== undefined || parsedResult.overallScore !== undefined)) {
            // Transform old format to new format if needed
            const transformedResult = {
              id: parsedResult.id || Date.now().toString(),
              testType: parsedResult.testType || 'IELTS Academic',
              level: parsedResult.level || 'B2',
              overallBand: parsedResult.overallBand || parsedResult.overallScore || 0,
              skillScores: parsedResult.skillScores || parsedResult.skills || {
                reading: { score: 0 },
                listening: { score: 0 },
                writing: { score: 0 },
                speaking: { score: 0 }
              },
              completedAt: parsedResult.completedAt || parsedResult.date || new Date().toISOString(),
              duration: parsedResult.duration || '0m',
              aiFeedback: parsedResult.aiFeedback || 'Test completed.',
              recommendations: parsedResult.recommendations || [],
              strengths: parsedResult.strengths || [],
              weaknesses: parsedResult.weaknesses || [],
              testAnswers: parsedResult.testAnswers || parsedResult.answers
            };
            
            setTestResult(transformedResult);
            loadPreviousScore();
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // If localStorage data is corrupted, continue to other loading methods
      }

      // Try to fetch from backend
      if (id) {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}/api/tests/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTestResult(data.data);
          // Load previous score for comparison
          loadPreviousScore();
        } else {
          // Fallback to mock data
          setTestResult(generateMockResult());
        }
      } else {
        // Generate mock result if no ID
        setTestResult(generateMockResult());
      }
    } catch (error) {
      console.error('Error loading test result:', error);
      setTestResult(generateMockResult());
    } finally {
      setLoading(false);
    }
  };

  const generateMockResult = () => {
    return {
      id: id || Date.now().toString(),
      testType: 'IELTS Academic',
      level: 'B2',
      overallBand: 6.5,
      skillScores: {
        reading: 7.0,
        listening: 6.5,
        writing: 6.0,
        speaking: 6.5
      },
      completedAt: new Date().toISOString(),
      duration: '2h 15m',
      aiFeedback: 'Good overall performance with room for improvement in writing skills.',
      recommendations: [
        'Focus on improving writing task response and coherence',
        'Practice more listening exercises for better accuracy',
        'Continue reading practice to maintain current level',
        'Work on speaking fluency and pronunciation'
      ],
      strengths: [
        'Strong reading comprehension skills',
        'Good listening accuracy',
        'Clear speaking delivery'
      ],
      weaknesses: [
        'Writing task achievement needs improvement',
        'Speaking fluency could be enhanced',
        'Time management in writing tasks'
      ]
    };
  };

  const getBandColor = (score) => {
    if (score >= 8.0) return 'text-green-600 bg-green-100';
    if (score >= 7.0) return 'text-blue-600 bg-blue-100';
    if (score >= 6.0) return 'text-yellow-600 bg-yellow-100';
    if (score >= 5.0) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getBandLevel = (score) => {
    if (score >= 8.0) return 'C2';
    if (score >= 7.0) return 'B2';
    if (score >= 6.0) return 'B1';
    if (score >= 5.0) return 'A2';
    return 'A1';
  };

  const getPerformanceMessage = (score) => {
    if (score >= 8.0) return 'Outstanding performance! You have achieved an excellent band score.';
    if (score >= 7.0) return 'Great job! You have achieved a good band score.';
    if (score >= 6.0) return 'Good performance! You are on the right track.';
    if (score >= 5.0) return 'Fair performance. Keep practicing to improve.';
    return 'Keep working hard! More practice will help you improve.';
  };

  const handleRetakeTest = () => {
    navigate('/test/start');
  };

  const handleViewHistory = () => {
    navigate('/test-history');
  };

  const handleStartPractice = () => {
    navigate('/dashboard?tab=ai-practice');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test results...</p>
        </div>
      </div>
    );
  }

  if (!testResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Test result not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <FeatureGuide feature="test-result">
      <div className="min-h-screen bg-gray-50">
        {/* AI Encouragement */}
        {testResult && (
          <AIEncouragement 
            testResult={testResult}
            previousScore={previousScore}
            userName={user?.name || 'Student'}
          />
        )}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-white">🎯</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('testResult.title', 'Test Results')}
              </h1>
              <p className="text-gray-600 mb-6">
                {t('testResult.subtitle', 'Your IELTS Academic Test Performance')}
              </p>
              
              {/* Overall Score */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                <div className="text-6xl font-bold text-gray-900 mb-2">
                  {testResult.overallBand}
                </div>
                <div className="text-xl text-gray-600 mb-2">
                  {t('testResult.overallBand', 'Overall Band Score')}
                </div>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getBandColor(testResult.overallBand)}`}>
                  {getBandLevel(testResult.overallBand)} Level
                </div>
                <p className="text-gray-600 mt-4 text-lg">
                  {getPerformanceMessage(testResult.overallBand)}
                </p>
              </div>

              {/* Test Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold text-gray-900">Test Type</div>
                  <div>{testResult.testType}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold text-gray-900">Duration</div>
                  <div>{testResult.duration}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold text-gray-900">Completed</div>
                  <div>{new Date(testResult.completedAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('testResult.skillBreakdown', 'Skill Breakdown')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(testResult.skillScores).map(([skill, scoreData]) => {
                // Handle both nested object {score: 7.0} and plain number 7.0
                const score = typeof scoreData === 'object' ? scoreData.score : scoreData;
                
                return (
                  <div key={skill} className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl text-white">
                        {skill === 'reading' && '📖'}
                        {skill === 'listening' && '🎧'}
                        {skill === 'writing' && '✍️'}
                        {skill === 'speaking' && '🎤'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize mb-2">
                      {skill}
                    </h3>
                    <div className={`text-3xl font-bold mb-2 ${getBandColor(score).split(' ')[0]}`}>
                      {score}
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getBandColor(score)}`}>
                      {getBandLevel(score)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Feedback */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('testResult.aiFeedback', 'AI Analysis & Feedback')}
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                🤖 AI Assessment
              </h3>
              <p className="text-blue-800">
                {testResult.aiFeedback}
              </p>
            </div>

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-3">
                  ✅ {t('testResult.strengths', 'Strengths')}
                </h3>
                <ul className="space-y-2">
                  {testResult.strengths?.map((strength, index) => (
                    <li key={index} className="text-green-800 flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-3">
                  ⚠️ {t('testResult.weaknesses', 'Areas for Improvement')}
                </h3>
                <ul className="space-y-2">
                  {testResult.weaknesses?.map((weakness, index) => (
                    <li key={index} className="text-red-800 flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('testResult.recommendations', 'Recommendations')}
            </h2>
            
            <div className="space-y-4">
              {testResult.recommendations?.map((recommendation, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start">
                  <span className="text-blue-600 mr-3 mt-1">💡</span>
                  <p className="text-gray-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Practice Weaknesses Section - NEW! */}
          {testResult.weaknesses && testResult.weaknesses.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🎯 Practice Your Weaknesses
              </h2>
              <p className="text-gray-700 mb-6">
                Based on your test results, we recommend focusing on these areas to improve your overall score.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(testResult.skillScores || {})
                  .filter(([skill, scoreData]) => {
                    const score = typeof scoreData === 'object' ? scoreData.score : scoreData;
                    return score < testResult.overallBand;
                  })
                  .map(([skill, scoreData]) => {
                    const score = typeof scoreData === 'object' ? scoreData.score : scoreData;
                    
                    return (
                      <button
                        key={skill}
                        onClick={() => navigate(`/quick-practice/${skill}?focus=true`)}
                        className="bg-white hover:bg-red-50 border-2 border-red-200 hover:border-red-400 text-red-700 font-semibold py-4 px-6 rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                      >
                        <div className="text-2xl mb-2">
                          {skill === 'reading' && '📖'}
                          {skill === 'listening' && '🎧'}
                          {skill === 'writing' && '✍️'}
                          {skill === 'speaking' && '🎤'}
                        </div>
                        <div className="capitalize font-bold mb-1">{skill}</div>
                        <div className="text-sm opacity-75">Score: {score}</div>
                        <div className="text-xs mt-2 text-blue-600">→ Practice Now</div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Detailed Answers Section */}
          {testResult.testAnswers && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                📋 Detailed Answers Review
              </h2>
              <p className="text-gray-600 mb-6">
                Review your answers below. Compare your responses with the correct answers.
              </p>
              
              {Object.entries(testResult.testAnswers).map(([skill, skillAnswers]) => {
                if (!skillAnswers || (Array.isArray(skillAnswers) && skillAnswers.length === 0)) {
                  return null;
                }
                
                return (
                  <div key={skill} className="mb-8 border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 capitalize flex items-center">
                      {skill === 'reading' && '📖'} {skill === 'listening' && '🎧'} {skill === 'writing' && '✍️'} {skill === 'speaking' && '🎤'}
                      <span className="ml-2">{skill} Answers</span>
                    </h3>
                    
                    <div className="space-y-4">
                      {Array.isArray(skillAnswers) ? (
                        skillAnswers.map((answerItem, index) => {
                          const answerText = typeof answerItem === 'object' ? answerItem.answer : answerItem;
                          const isCorrect = typeof answerItem === 'object' ? answerItem.isCorrect : undefined;
                          
                          return (
                            <div key={index} className={`border rounded-lg p-4 ${isCorrect === true ? 'bg-green-50 border-green-300' : isCorrect === false ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-300'}`}>
                              <div className="flex items-start justify-between mb-2">
                                <span className="font-semibold text-gray-900">Question {index + 1}</span>
                                {isCorrect !== undefined && (
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-800">
                                <strong>Your Answer:</strong> {answerText || '(No answer provided)'}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="border rounded-lg p-4 bg-gray-50 border-gray-300">
                          <div className="text-gray-800 whitespace-pre-wrap">
                            {typeof skillAnswers === 'string' ? skillAnswers : JSON.stringify(skillAnswers)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {t('testResult.nextSteps', 'What\'s Next?')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={handleRetakeTest}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                🔄 {t('testResult.retakeTest', 'Retake Test')}
              </button>
              
              <button
                onClick={handleStartPractice}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                🎯 {t('testResult.startPractice', 'Start Practice')}
              </button>
              
              <button
                onClick={handleViewHistory}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                📊 {t('testResult.viewHistory', 'View History')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </FeatureGuide>
  );
}