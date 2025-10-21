import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Timer from '../../components/Timer';

export default function TestPage() {
  const { skill } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState('');
  const [timeUp, setTimeUp] = useState(false);

  const durations = {
    reading: 900,    // 15 minutes
    listening: 900,  // 15 minutes
    writing: 3600,   // 60 minutes
    speaking: 660    // 11 minutes
  };

  const handleSubmit = () => {
    const bandScore = Math.random() * 3 + 6; // Random score between 6-9
    alert(`${skill.charAt(0).toUpperCase() + skill.slice(1)} Test Completed! Band: ${bandScore.toFixed(1)}`);
    navigate('/dashboard');
  };

  const handleTimeUp = () => {
    setTimeUp(true);
    handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            {skill === 'reading' && '📖 Reading Test'}
            {skill === 'listening' && '🎧 Listening Test'}
            {skill === 'writing' && '✍️ Writing Test'}
            {skill === 'speaking' && '🎤 Speaking Test'}
          </h1>

          <Timer 
            duration={durations[skill]} 
            onTimeUp={handleTimeUp}
          />

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Instructions:</h2>
            <p className="text-gray-600 mb-6">
              {skill === 'reading' && 'Read the passage and answer the questions below.'}
              {skill === 'listening' && 'Listen to the audio and answer the questions.'}
              {skill === 'writing' && 'Write your essay response to the given topic.'}
              {skill === 'speaking' && 'Record your responses to the speaking prompts.'}
            </p>

            <textarea
              value={answers}
              onChange={(e) => setAnswers(e.target.value)}
              placeholder={`Enter your ${skill} response here...`}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none"
            />

            {timeUp && (
              <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-800 font-semibold">⏰ Time's up! Test submitted automatically.</p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleSubmit}
              disabled={timeUp}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
