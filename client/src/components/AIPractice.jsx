import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AIPractice = () => {
  const { user } = useAuth();
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🧩 AI Practice Generator</h2>
      
      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skill
          </label>
          <select
            name="skill"
            value={formData.skill}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="writing">Writing</option>
            <option value="speaking">Speaking</option>
            <option value="reading">Reading</option>
            <option value="listening">Listening</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic (Optional)
          </label>
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleInputChange}
            placeholder="e.g., Technology, Environment"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Band Level
          </label>
          <select
            name="band"
            value={formData.band}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={5.0}>5.0</option>
            <option value={5.5}>5.5</option>
            <option value={6.0}>6.0</option>
            <option value={6.5}>6.5</option>
            <option value={7.0}>7.0</option>
            <option value={7.5}>7.5</option>
            <option value={8.0}>8.0</option>
          </select>
        </div>
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        {loading ? 'Generating...' : 'Generate AI Practice Question'}
      </button>
      
      {/* Generated Question */}
      {generatedQuestion && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">
            {generatedQuestion.skill.charAt(0).toUpperCase() + generatedQuestion.skill.slice(1)} Question
          </h3>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Band Level:</strong> {generatedQuestion.band} | 
              <strong> Topic:</strong> {generatedQuestion.topic} | 
              <strong> Time Limit:</strong> {generatedQuestion.timeLimit} minutes
            </p>
            {generatedQuestion.wordLimit && (
              <p className="text-sm text-gray-600 mb-2">
                <strong>Word Limit:</strong> {generatedQuestion.wordLimit} words
              </p>
            )}
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">Instructions:</h4>
            <p className="text-gray-700 mb-4">{generatedQuestion.instructions}</p>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">Question:</h4>
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <p className="text-gray-800 whitespace-pre-wrap">{generatedQuestion.question}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setGeneratedQuestion(null)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Generate New Question
            </button>
            <button
              onClick={() => {
                // TODO: Navigate to practice page
                alert('Practice feature coming soon!');
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Start Practice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPractice;
