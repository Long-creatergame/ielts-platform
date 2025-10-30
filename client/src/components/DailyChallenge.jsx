import React, { useState, useEffect, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const DailyChallenge = memo(() => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [challenge, setChallenge] = useState(null);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenge();
  }, []);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/daily-challenge`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChallenge(data.challenge);
        setStreak(data.streak);
        setCompleted(data.completed);
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = () => {
    // Navigate to test page for the challenge skill
    window.location.href = `/test/${challenge.skill}`;
  };

  const getSkillIcon = (skill) => {
    const icons = {
      reading: '📖',
      writing: '✍️',
      listening: '👂',
      speaking: '🗣️'
    };
    return icons[skill] || '📚';
  };

  const getSkillColor = (skill) => {
    const colors = {
      reading: 'from-blue-500 to-blue-600',
      writing: 'from-green-500 to-green-600',
      listening: 'from-purple-500 to-purple-600',
      speaking: 'from-orange-500 to-orange-600'
    };
    return colors[skill] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl animate-pulse">
        <div className="h-32 bg-white/20 rounded-lg"></div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl">
        <h3 className="text-white text-xl font-bold mb-2">🎯 {t('dashboard.noChallengeToday')}</h3>
        <p className="text-indigo-100 text-sm">{t('dashboard.checkBackTomorrow')}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">{getSkillIcon(challenge.skill)}</span>
          </div>
          <div>
            <h3 className="text-white text-xl font-bold">Today's Challenge</h3>
            <p className="text-indigo-100 text-sm capitalize">{challenge.skill}</p>
          </div>
        </div>
        {streak > 0 && (
          <div className="bg-orange-500 px-3 py-1 rounded-full flex items-center space-x-1">
            <span className="text-lg">🔥</span>
            <span className="text-white font-bold">{streak} day streak</span>
          </div>
        )}
      </div>

      {/* Challenge Info */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-indigo-100 text-sm mb-1">⏱️ Duration</p>
            <p className="text-white font-semibold">{challenge.duration} min</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm mb-1">📊 Questions</p>
            <p className="text-white font-semibold">{challenge.questions} questions</p>
          </div>
        </div>
        
        {challenge.description && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-white/90 text-sm">{challenge.description}</p>
          </div>
        )}
      </div>

      {/* Rewards */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 text-yellow-300">
          <span className="text-sm">🏆 +{challenge.points} points</span>
          {!completed && streak > 0 && <span className="text-sm">+ Streak bonus</span>}
        </div>
      </div>

      {/* Action Button */}
      {completed ? (
        <div className="bg-green-500 px-4 py-3 rounded-lg text-white text-center font-semibold">
          ✅ Challenge Completed!
        </div>
      ) : (
        <button
          onClick={startChallenge}
          className="w-full bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-colors shadow-lg"
        >
          Start Challenge →
        </button>
      )}

      {/* Progress Indicator */}
      {completed && (
        <div className="mt-4 text-center">
          <p className="text-white/80 text-sm">Come back tomorrow for your next challenge! ⏰</p>
        </div>
      )}
    </div>
  );
});

DailyChallenge.displayName = 'DailyChallenge';

export default DailyChallenge;
