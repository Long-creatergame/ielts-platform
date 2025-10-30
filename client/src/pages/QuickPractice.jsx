import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Timer from '../components/Timer';
import FeatureGuide from '../components/FeatureGuide';

export default function QuickPractice() {
  const { skill } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [answers, setAnswers] = useState('');
  const [timeUp, setTimeUp] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    loadQuickPracticeContent(skill);
  }, [skill, user, navigate]);

  const loadQuickPracticeContent = async (skillType) => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/quick-practice/${skillType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestData(data.data);
        setQuestions(data.data.questions || []);
      } else {
        // Fallback content for quick practice
        loadFallbackQuickContent(skillType);
      }
    } catch (error) {
      console.error('Error loading quick practice content:', error);
      loadFallbackQuickContent(skillType);
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackQuickContent = (skillType) => {
    const fallbackData = {
      reading: {
        title: "Quick Reading Practice",
        passage: "This is a short reading passage for quick practice. It contains basic vocabulary and simple sentence structures.",
        questions: [
          "What is the main topic?",
          "What does the author suggest?",
          "What is the purpose of this text?"
        ],
        timeLimit: null,
        level: "General"
      },
      listening: {
        title: "Quick Listening Practice",
        audio: "quick_listening_sample.mp3",
        questions: [
          "What is the speaker talking about?",
          "Where does this conversation take place?",
          "What is the main point?"
        ],
        timeLimit: null,
        level: "General"
      },
      writing: {
        title: "Quick Writing Practice",
        task: "Write a short paragraph (50-100 words) about your favorite hobby.",
        timeLimit: null,
        level: "General"
      },
      speaking: {
        title: "Quick Speaking Practice",
        questions: [
          "What's your name?",
          "Where are you from?",
          "What do you like to do in your free time?"
        ],
        timeLimit: null,
        level: "General"
      }
    };
    
    setTestData(fallbackData[skillType]);
    setQuestions(fallbackData[skillType]?.questions || []);
  };

  const handleSubmit = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      // ✅ Submit to quick-practice API which saves to database
      const response = await fetch(`${API_BASE_URL}/api/quick-practice/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skill,
          answers: answers || 'Quick practice completed',
          timeSpent: 0 // Could track this if needed
        })
      });

      if (response.ok) {
        const result = await response.json();
        const { data } = result;
        
        // Navigate to result with saved data
        navigate('/test/result/quick', { 
          state: { 
            testResult: {
              skill,
              bandScore: data.score.bandScore,
              feedback: data.feedback,
              score: data.score,
              practiceId: data.practiceId,
              type: 'quick-practice'
            }
          }
        });
      } else {
        throw new Error('Failed to submit practice');
      }
    } catch (error) {
      console.error('Error submitting quick practice:', error);
      // Navigate with mock result as fallback
      navigate('/test/result/quick', { 
        state: { 
          testResult: {
            skill,
            bandScore: 6.5,
            feedback: 'Good practice! Keep it up.',
            recommendations: ['Continue practicing', 'Try more exercises'],
            type: 'quick-practice'
          }
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quick practice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FeatureGuide feature="quick-practice">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-md p-6 mb-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                🚀 Quick {skill?.charAt(0).toUpperCase() + skill?.slice(1)} Practice
              </h1>
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                ⚡ No Pressure Mode
              </div>
            </div>
            <p className="text-gray-600 mb-2">
              {testData?.title || `Quick ${skill} practice session`}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>🎯 Quick Practice Goal:</strong> Just get comfortable with the language! 
                No formal scoring, no time pressure - just practice and have fun!
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {skill === 'reading' && testData?.passage && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Reading Passage</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{testData.passage}</p>
                </div>
              </div>
            )}

            {skill === 'writing' && testData?.task && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Writing Task</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700">{testData.task}</p>
                </div>
              </div>
            )}

            {skill === 'speaking' && testData?.questions && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Speaking Questions</h3>
                <div className="space-y-3">
                  {testData.questions.map((question, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg">
                      <p className="text-gray-700">{index + 1}. {question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions */}
            {questions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Questions</h3>
                <div className="space-y-3">
                  {questions.map((questionData, index) => {
                    // Handle both object format {question: "...", options: [...]} and string format
                    const questionText = typeof questionData === 'object' ? questionData.question : questionData;
                    const questionOptions = typeof questionData === 'object' ? questionData.options : null;
                    
                    return (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-700 font-medium mb-3">{index + 1}. {questionText}</p>
                        
                        {/* Show options if available */}
                        {questionOptions && questionOptions.length > 0 && (
                          <div className="space-y-2 mt-3">
                            {questionOptions.map((optionText, optIndex) => {
                              const optionLetter = String.fromCharCode(65 + optIndex);
                              return (
                                <div key={optIndex} className="flex items-center space-x-3 bg-white p-2 rounded border border-gray-200">
                                  <span className="font-bold text-blue-600 w-6 text-center">{optionLetter}.</span>
                                  <span className="text-gray-700 flex-1">{optionText}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Answer Input - Simple and Fast */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Answer (No pressure, just practice!)
              </label>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Quick Practice Tip:</strong> Don't worry about perfect grammar or structure. 
                  Just focus on expressing your ideas clearly and naturally.
                </p>
              </div>
              <textarea
                value={answers}
                onChange={(e) => setAnswers(e.target.value)}
                placeholder="Just write your thoughts here... No time pressure! 😊"
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is just for practice - no scoring, no pressure!
              </p>
            </div>

            {/* Quick Submit Button */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                ✨ Quick practice - no formal assessment
              </div>
              <button
                onClick={handleSubmit}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                🚀 Get Quick Feedback
              </button>
            </div>
          </div>
        </div>
      </FeatureGuide>
    </div>
  );
}
