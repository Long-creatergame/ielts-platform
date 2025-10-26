import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AIPractice = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState(null);
  const [formData, setFormData] = useState({
    skill: 'writing',
    topic: '',
    band: 6.5
  });

  const handleGenerate = async () => {
    if (!user) {
      alert('Please log in to use AI Practice');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ai-engine/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedQuestion(data.data);
      } else {
        alert('Failed to generate question. Please try again.');
      }
    } catch (error) {
      console.error('Generate question error:', error);
      alert('Error generating question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🧩</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Practice Generator</h2>
        <p className="text-gray-600 text-lg">Generate personalized IELTS questions with AI</p>
      </div>
      
      {/* Form */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Skill
            </label>
            <select
              name="skill"
              value={formData.skill}
              onChange={handleInputChange}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50"
            >
              <option value="writing">✍️ Writing</option>
              <option value="speaking">🎤 Speaking</option>
              <option value="reading">📖 Reading</option>
              <option value="listening">🎧 Listening</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Topic (Optional)
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              placeholder="e.g., Technology, Environment"
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Band Level
            </label>
            <select
              name="band"
              value={formData.band}
              onChange={handleInputChange}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50"
            >
              <option value={5.0}>5.0 - Intermediate</option>
              <option value={5.5}>5.5 - Upper Intermediate</option>
              <option value={6.0}>6.0 - Advanced</option>
              <option value={6.5}>6.5 - Advanced+</option>
              <option value={7.0}>7.0 - Expert</option>
              <option value={7.5}>7.5 - Expert+</option>
              <option value={8.0}>8.0 - Master</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          <div className="flex items-center justify-center space-x-3">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span className="text-xl">🧩</span>
                <span>Generate AI Practice Question</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </div>
        </button>
      </div>
      
      {/* Generated Question */}
      {generatedQuestion && (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✨</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {generatedQuestion.skill.charAt(0).toUpperCase() + generatedQuestion.skill.slice(1)} Question Generated!
            </h3>
          </div>
          
          {/* Question Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm text-gray-600">Band Level</div>
              <div className="text-xl font-bold text-blue-600">{generatedQuestion.band}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-2">📚</div>
              <div className="text-sm text-gray-600">Topic</div>
              <div className="text-lg font-semibold text-purple-600">{generatedQuestion.topic}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-2">⏱️</div>
              <div className="text-sm text-gray-600">Time Limit</div>
              <div className="text-lg font-semibold text-orange-600">{generatedQuestion.timeLimit} min</div>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200/50">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
              <span className="text-xl mr-2">📋</span>
              Instructions
            </h4>
            <p className="text-gray-700 leading-relaxed">{generatedQuestion.instructions}</p>
          </div>
          
          {/* Question */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200/50">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-xl mr-2">❓</span>
              Question
            </h4>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg">{generatedQuestion.question}</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setGeneratedQuestion(null)}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center space-x-2">
                <span>🔄</span>
                <span>Generate New Question</span>
              </div>
            </button>
            <button
              onClick={() => {
                // Navigate to quick practice for the generated skill
                navigate(`/quick-practice/${generatedQuestion.skill}`);
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center space-x-2">
                <span>🚀</span>
                <span>Start Practice</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPractice;
