/**
 * Practice Page with Blueprint-based Test Renderer
 * Provides full IELTS practice experience with mode selection
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TestRenderer from '../components/TestRenderer';
import { getAvailableModes, validateBlueprint } from '../blueprints/testBlueprints';

export default function PracticePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState('writing');
  const [selectedMode, setSelectedMode] = useState('academic');

  const skills = [
    { id: 'writing', name: 'Writing', icon: '✍️', description: 'Task 1 & Task 2' },
    { id: 'reading', name: 'Reading', icon: '📖', description: '3 Passages, 40 Questions' },
    { id: 'listening', name: 'Listening', icon: '🎧', description: '4 Sections, Audio Test' },
    { id: 'speaking', name: 'Speaking', icon: '🎤', description: '3 Parts, Cue Cards' }
  ];

  const modes = {
    writing: ['academic', 'general'],
    reading: ['academic', 'general'],
    listening: ['academic', 'general'],
    speaking: ['academic', 'general']
  };

  const availableModes = modes[selectedSkill] || ['academic'];

  const handleSkillChange = (skill) => {
    setSelectedSkill(skill);
    // Set first available mode when skill changes
    setSelectedMode(availableModes[0] || 'academic');
  };

  const handleSubmit = (submission) => {
    console.log('[PracticePage] Submission:', submission);
    
    // Navigate to test result or show feedback
    // This could integrate with existing test submission flow
    alert('Test submitted! Results will be processed.');
    
    // Optionally navigate to results page
    // navigate('/test/result', { state: { submission } });
  };

  const handleTimeUp = () => {
    alert('⏰ Time is up! Please submit your test now.');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to practice</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Validate blueprint exists
  if (!validateBlueprint(selectedSkill, selectedMode)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold">
            ⚠️ No blueprint available for {selectedSkill} ({selectedMode})
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">🎯</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            IELTS Practice Center
          </h1>
          <p className="text-gray-600 text-lg">
            Official Cambridge IELTS format practice tests
          </p>
        </div>

        {/* Skill & Mode Selector */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
          {/* Skill Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Practice Skill:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => handleSkillChange(skill.id)}
                  className={`p-4 rounded-xl transition-all duration-200 border-2 ${
                    selectedSkill === skill.id
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-600 shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-3xl mb-2">{skill.icon}</div>
                  <div className="font-bold text-sm mb-1">{skill.name}</div>
                  <div className="text-xs opacity-80">{skill.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Mode:</h3>
            <div className="flex gap-4">
              {availableModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 border-2 ${
                    selectedMode === mode
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-600 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-xl mb-2">
                    {mode === 'academic' ? '🎓' : '👔'}
                  </div>
                  <div className="text-base">
                    {mode === 'academic' ? 'Academic' : 'General Training'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Test Renderer */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <TestRenderer
            skill={selectedSkill}
            mode={selectedMode}
            onSubmit={handleSubmit}
            onTimeUp={handleTimeUp}
          />
        </div>
      </div>
    </div>
  );
}

