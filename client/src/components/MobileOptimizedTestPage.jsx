import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import EnhancedAudioPlayer from './EnhancedAudioPlayer';
import VoiceRecorder from './VoiceRecorder';
import LoadingSpinner from './LoadingSpinner';

const MobileOptimizedTestPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSkill, setCurrentSkill] = useState('reading');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load test data
  useEffect(() => {
    loadTestData();
  }, [currentSkill]);

  const loadTestData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${API_BASE_URL}/api/authentic-ielts/${currentSkill}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setQuestions(data.data || []);
          setCurrentQuestion(0);
          setAnswers({});
          setTimeLeft(getTimeLimit(currentSkill));
        } else {
          throw new Error(data.error || 'Invalid response format');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to load test data`);
      }
    } catch (err) {
      console.error('Load test data error:', err);
      setError(err.message || 'Failed to load test data');
    } finally {
      setLoading(false);
    }
  };

  const getTimeLimit = (skill) => {
    const limits = {
      reading: 60 * 60, // 60 minutes
      listening: 40 * 60, // 40 minutes
      writing: 60 * 60, // 60 minutes
      speaking: 15 * 60 // 15 minutes
    };
    return limits[skill] || 60 * 60;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tests/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          skill: currentSkill,
          answers,
          timeSpent: getTimeLimit(currentSkill) - timeLeft
        })
      });

      if (response.ok) {
        const result = await response.json();
        navigate('/test/result', { state: { result } });
      } else {
        throw new Error('Failed to submit test');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-800 capitalize">
                  {currentSkill} Test
                </h1>
                <p className="text-sm text-gray-600">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono text-blue-600">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-gray-500">Time Left</div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="px-4 pb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Audio Player for Listening */}
        {currentSkill === 'listening' && currentQ.audioUrl && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <EnhancedAudioPlayer
              audioUrl={currentQ.audioUrl}
              title="Listening Audio"
              transcript={currentQ.transcript}
            />
          </div>
        )}

        {/* Question Content */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {currentQ.title || `Question ${currentQuestion + 1}`}
            </h2>
            {currentQ.content && (
              <div className="text-gray-700 leading-relaxed mb-4">
                {currentQ.content}
              </div>
            )}
          </div>

          {/* Question */}
          <div className="mb-6">
            <h3 className="text-base font-medium text-gray-800 mb-3">
              {currentQ.question}
            </h3>

            {/* Multiple Choice */}
            {currentQ.type === 'multiple_choice' && (
              <div className="space-y-3">
                {currentQ.options?.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`question_${currentQ.id}`}
                      value={index}
                      checked={answers[currentQ.id] === index}
                      onChange={(e) => handleAnswerChange(currentQ.id, parseInt(e.target.value))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* True/False/Not Given */}
            {currentQ.type === 'true_false_not_given' && (
              <div className="space-y-3">
                {['True', 'False', 'Not Given'].map((option) => (
                  <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`question_${currentQ.id}`}
                      value={option}
                      checked={answers[currentQ.id] === option}
                      onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Text Input */}
            {currentQ.type === 'short_answer' && (
              <textarea
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            )}

            {/* Essay Writing */}
            {currentQ.type === 'essay' && (
              <div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Essay ({answers[currentQ.id]?.length || 0} words)
                  </label>
                  <textarea
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    placeholder="Write your essay here..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={8}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  Minimum 250 words recommended
                </div>
              </div>
            )}

            {/* Speaking */}
            {currentSkill === 'speaking' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Speaking Task</h4>
                  <p className="text-blue-700 text-sm">{currentQ.instructions}</p>
                </div>
                <VoiceRecorder
                  onRecordingComplete={(audioBlob) => {
                    handleAnswerChange(currentQ.id, audioBlob);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>

          <div className="flex space-x-2">
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {Object.keys(answers).length} / {questions.length} answered
            </div>
            <div className="text-sm font-mono text-blue-600">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileOptimizedTestPage;
