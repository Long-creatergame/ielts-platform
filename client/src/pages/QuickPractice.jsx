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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quick-practice/${skillType}`);
      
      if (response.ok) {
        const data = await response.json();
        setTestData(data);
        setQuestions(data.questions || []);
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ai/assess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skill,
          answer: answers,
          level: 'General'
        })
      });

      if (response.ok) {
        const result = await response.json();
        navigate('/test/result/quick', { 
          state: { 
            testResult: {
              skill,
              bandScore: result.bandScore,
              feedback: result.feedback,
              recommendations: result.recommendations,
              type: 'quick-practice'
            }
          }
        });
      }
    } catch (error) {
      console.error('Error submitting quick practice:', error);
      // Navigate with mock result
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                🚀 Quick {skill?.charAt(0).toUpperCase() + skill?.slice(1)} Practice
              </h1>
              <div className="text-sm text-gray-500">
                No time limit • General level
              </div>
            </div>
            <p className="text-gray-600">
              {testData?.title || `Quick ${skill} practice session`}
            </p>
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
                  {questions.map((question, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700">{index + 1}. {question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Answer Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer
              </label>
              <textarea
                value={answers}
                onChange={(e) => setAnswers(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Submit Quick Practice
              </button>
            </div>
          </div>
        </div>
      </FeatureGuide>
    </div>
  );
}
