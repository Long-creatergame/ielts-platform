/**
 * Practice Plan Component
 * Merged Recommendations + AI Personalization
 * Unified interface for user preferences and AI-generated practice recommendations
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Loader from './Loader';

export default function PracticePlan() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      // Fetch preferences and learning path in parallel
      const [prefsResponse, pathResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/user-preferences`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/api/ai/learning-path`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => null) // Graceful fallback if learning path unavailable
      ]);

      if (prefsResponse.ok) {
        const prefsData = await prefsResponse.json();
        setPreferences(prefsData.preferences);
      }

      if (pathResponse && pathResponse.ok) {
        const pathData = await pathResponse.json();
        setLearningPath(pathData.learningPath);
      }
    } catch (err) {
      console.error('Error loading practice plan data:', err);
      setError('Failed to load practice plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      setError(null);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/user-preferences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to save preferences' }));
        setError(errorData.message);
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🎯</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Practice Plan</h2>
        <p className="text-gray-600 text-lg">Personalize your learning experience</p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-800 text-center">
          ✅ Preferences saved successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800">
          <p className="font-semibold">⚠️ Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Preferences Form */}
      {preferences && (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-2">⚙️</span>
              Learning Preferences
            </h3>
            <button
              onClick={handleSavePreferences}
              disabled={saving}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {saving ? 'Saving...' : '💾 Save Preferences'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tone Preference */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Writing Tone</label>
              <select
                value={preferences.tone || 'academic'}
                onChange={(e) => handlePreferenceChange('tone', e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
              >
                <option value="academic">Academic</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="business">Business</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Difficulty Level</label>
              <select
                value={preferences.difficulty || 'adaptive'}
                onChange={(e) => handlePreferenceChange('difficulty', e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
              >
                <option value="adaptive">Adaptive</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Target Band */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Target Band Score</label>
              <input
                type="number"
                min="0"
                max="9"
                step="0.5"
                value={preferences.targetBand || 6.5}
                onChange={(e) => handlePreferenceChange('targetBand', parseFloat(e.target.value))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
              />
            </div>

            {/* Practice Time */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Daily Practice Time (minutes)</label>
              <input
                type="number"
                min="15"
                max="240"
                step="15"
                value={preferences.practiceTimePerDay || 45}
                onChange={(e) => handlePreferenceChange('practiceTimePerDay', parseInt(e.target.value))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
              />
            </div>

            {/* Focus Skills */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">Focus Skills</label>
              <div className="flex flex-wrap gap-3">
                {['reading', 'writing', 'listening', 'speaking'].map(skill => (
                  <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.focusSkills?.includes(skill) || false}
                      onChange={(e) => {
                        const currentSkills = preferences.focusSkills || [];
                        const newSkills = e.target.checked
                          ? [...currentSkills, skill]
                          : currentSkills.filter(s => s !== skill);
                        handlePreferenceChange('focusSkills', newSkills);
                      }}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-gray-700 capitalize">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* AI Style */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">AI Feedback Style</label>
              <select
                value={preferences.aiStyle || 'encouraging'}
                onChange={(e) => handlePreferenceChange('aiStyle', e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
              >
                <option value="encouraging">Encouraging & Supportive</option>
                <option value="detailed">Detailed & Comprehensive</option>
                <option value="concise">Concise & Direct</option>
                <option value="critical">Critical & Honest</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Learning Path Recommendations */}
      {learningPath && learningPath.recommendations && learningPath.recommendations.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            Recommended Next Steps
          </h3>
          <div className="space-y-4">
            {learningPath.recommendations.map((rec, i) => (
              <div
                key={i}
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-indigo-100 text-indigo-800 font-semibold px-3 py-1 rounded-lg text-sm">
                        {rec.skill?.charAt(0).toUpperCase() + rec.skill?.slice(1)}
                      </span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-lg ${
                        rec.priority === 'high' 
                          ? 'bg-red-100 text-red-800'
                          : rec.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rec.priority?.toUpperCase()}
                      </span>
                      {rec.estimatedTime && (
                        <span className="text-gray-600 text-sm">
                          ⏱️ {rec.estimatedTime} min
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {rec.taskType || 'Practice Exercise'}
                    </h4>
                    <p className="text-gray-700">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Practice CTA */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-2">Ready to Practice?</h3>
        <p className="text-indigo-100 mb-6">Generate personalized IELTS tests based on your preferences</p>
        <button className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105">
          🚀 Generate Custom Practice
        </button>
      </div>
    </div>
  );
}
