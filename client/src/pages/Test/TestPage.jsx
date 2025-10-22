import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Timer from '../../components/Timer';

export default function TestPage() {
  const { skill } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState('');
  const [timeUp, setTimeUp] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions] = useState(5);

  const durations = {
    reading: 900,    // 15 minutes
    listening: 900,  // 15 minutes
    writing: 3600,   // 60 minutes
    speaking: 660    // 11 minutes
  };

  const questions = {
    reading: [
      "Read the passage and answer: What is the main idea?",
      "According to the text, what does the author suggest?",
      "What can we infer from paragraph 2?",
      "Which statement is true according to the passage?",
      "What is the purpose of this text?"
    ],
    listening: [
      "Listen to the audio and answer: What is the topic?",
      "What does the speaker recommend?",
      "According to the audio, what happened?",
      "What is the speaker's opinion?",
      "What is the main message?"
    ],
    writing: [
      "Task 1: Describe the chart showing population growth",
      "Task 2: Write an essay about technology's impact on education"
    ],
    speaking: [
      "Introduce yourself and talk about your hobbies",
      "Describe your hometown",
      "Discuss your favorite book or movie",
      "Talk about your future plans",
      "Express your opinion on social media"
    ]
  };

  const handleSubmit = () => {
    // AI-powered band score calculation (simplified)
    const baseScore = 6.0;
    const answerLength = answers.length;
    const timeBonus = timeUp ? 0 : 0.5; // Bonus for finishing early
    const lengthBonus = Math.min(answerLength / 100, 2.0); // Bonus for longer answers
    const bandScore = Math.min(baseScore + lengthBonus + timeBonus + Math.random(), 9.0);
    
    // AI feedback based on performance
    let feedback = "";
    if (bandScore >= 8.0) {
      feedback = "🎉 Excellent! Your performance shows advanced proficiency.";
    } else if (bandScore >= 7.0) {
      feedback = "👍 Good work! You're on track for your target band.";
    } else if (bandScore >= 6.0) {
      feedback = "📈 Keep practicing! Focus on grammar and vocabulary.";
    } else {
      feedback = "💪 Don't give up! Practice more to improve your skills.";
    }
    
    // Show completion message with AI feedback
    alert(`${skill.charAt(0).toUpperCase() + skill.slice(1)} Test Completed!\n\nBand Score: ${bandScore.toFixed(1)}\n\nAI Feedback: ${feedback}`);
    
    // Navigate back to dashboard
    navigate('/dashboard');
  };

  const handleTimeUp = () => {
    setTimeUp(true);
    handleSubmit();
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-center">
              {skill === 'reading' && '📖 Reading Test'}
              {skill === 'listening' && '🎧 Listening Test'}
              {skill === 'writing' && '✍️ Writing Test'}
              {skill === 'speaking' && '🎤 Speaking Test'}
            </h1>
            <Timer
              duration={durations[skill]}
              onTimeUp={handleTimeUp}
            />
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion} of {totalQuestions}</span>
              <span>{Math.round(((currentQuestion - 1) / totalQuestions) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion - 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Question {currentQuestion}:</h2>
            <p className="text-gray-700 mb-6 p-4 bg-gray-50 rounded-lg">
              {questions[skill][currentQuestion - 1]}
            </p>

            {timeUp && (
              <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-800 font-semibold">⏰ Time's up! Test submitted automatically.</p>
              </div>
            )}
          </div>

          {/* Answer Input */}
          <div className="mb-8">
            <textarea
              value={answers}
              onChange={(e) => setAnswers(e.target.value)}
              placeholder={`Enter your ${skill} response here...`}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={timeUp}
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </button>

            <div className="space-x-4">
              {currentQuestion < totalQuestions ? (
                <button
                  onClick={handleNextQuestion}
                  disabled={timeUp}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Next Question →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={timeUp}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Submit Test ✓
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}