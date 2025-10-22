import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LevelBadge from '../../components/LevelBadge';
import PaywallModal from '../../components/PaywallModal';

export default function TestIntro() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState(user?.currentLevel || 'A2');
  const [canStartTest, setCanStartTest] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [loading, setLoading] = useState(false);

  const levels = [
    { id: 'A1', name: 'Beginner', color: 'blue' },
    { id: 'A2', name: 'Elementary', color: 'blue' },
    { id: 'B1', name: 'Intermediate', color: 'green' },
    { id: 'B2', name: 'Upper Intermediate', color: 'green' },
    { id: 'C1', name: 'Advanced', color: 'orange' },
    { id: 'C2', name: 'Proficient', color: 'orange' }
  ];

  const handleStartTest = async () => {
    // SIMPLIFIED: Skip API calls and go directly to test
    setLoading(true);
    
    try {
      // Direct navigation to test page
      navigate(`/test/reading`);
    } catch (error) {
      console.error('Error starting test:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎯 IELTS Practice Test
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Chào {user?.name}! Hãy chọn trình độ phù hợp để bắt đầu bài thi.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <span className="text-gray-600">Mục tiêu của bạn:</span>
            <span className="font-bold text-blue-600">Band {user?.targetBand}</span>
            <LevelBadge level={user?.currentLevel} />
          </div>
        </div>
        
        {/* Level Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Chọn trình độ</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {levels.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedLevel === level.id
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-300'
                }`}
              >
                <div className="text-2xl font-bold mb-2">{level.id}</div>
                <div className="text-sm font-medium">{level.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Test Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-blue-800">📖 Reading</h3>
            <p className="text-sm text-blue-600">15 minutes</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-green-800">🎧 Listening</h3>
            <p className="text-sm text-green-600">15 minutes</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-purple-800">✍️ Writing</h3>
            <p className="text-sm text-purple-600">60 minutes</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-orange-800">🎤 Speaking</h3>
            <p className="text-sm text-orange-600">11 minutes</p>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStartTest}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-lg transition-colors text-lg"
          >
            {loading ? 'Đang chuyển...' : `🚀 Bắt đầu bài thi (${selectedLevel})`}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Bài thi sẽ bao gồm tất cả 4 kỹ năng theo trình độ {selectedLevel}
          </p>
        </div>
      </div>

      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
      />
    </div>
  );
}