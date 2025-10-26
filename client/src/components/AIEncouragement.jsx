import React, { useState, useEffect } from 'react';

const AIEncouragement = ({ testResult, previousScore, userName }) => {
  const [message, setMessage] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [encouragementType, setEncouragementType] = useState(null);

  useEffect(() => {
    if (testResult && testResult.score) {
      generateEncouragement();
    }
  }, [testResult, previousScore]);

  const generateEncouragement = () => {
    const currentScore = testResult.score.overall || 0;
    const improvement = currentScore - (previousScore || 0);
    
    let type;
    let msg;

    // Determine encouragement type
    if (improvement > 0.5) {
      type = 'major_improvement';
      msg = `🎉 Amazing progress, ${userName}! You improved by ${improvement.toFixed(1)} band points! Keep this momentum going!`;
    } else if (improvement > 0) {
      type = 'improvement';
      msg = `👏 Great job! You improved by ${improvement.toFixed(1)} band points. Every step forward counts!`;
    } else if (currentScore >= 7.5) {
      type = 'excellent';
      msg = `🌟 Outstanding performance! You're achieving excellent results. You're ready for great things!`;
    } else if (currentScore >= 6.5) {
      type = 'good';
      msg = `👍 Solid performance! You're on the right track. Keep practicing to reach your target!`;
    } else if (improvement === 0) {
      type = 'consistent';
      msg = `💪 Consistency is key! Keep practicing and you'll see progress soon!`;
    } else {
      type = 'encouragement';
      msg = `💪 Don't give up! Every test is a learning opportunity. Review your mistakes and try again!`;
    }

    setEncouragementType(type);
    setMessage(msg);
    setShowAnimation(true);

    // Hide after 8 seconds
    setTimeout(() => {
      setShowAnimation(false);
    }, 8000);
  };

  if (!showAnimation || !message) return null;

  const getBgColor = () => {
    const colors = {
      major_improvement: 'from-green-500 to-emerald-600',
      improvement: 'from-blue-500 to-indigo-600',
      excellent: 'from-yellow-500 to-orange-600',
      good: 'from-purple-500 to-pink-600',
      consistent: 'from-indigo-500 to-purple-600',
      encouragement: 'from-gray-500 to-gray-600'
    };
    return colors[encouragementType] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown`}>
      <div className={`bg-gradient-to-r ${getBgColor()} text-white px-8 py-4 rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm max-w-2xl mx-4`}>
        <div className="flex items-center space-x-4">
          <div className="text-3xl animate-bounce">
            {encouragementType === 'major_improvement' && '🎉'}
            {encouragementType === 'improvement' && '👏'}
            {encouragementType === 'excellent' && '🌟'}
            {encouragementType === 'good' && '👍'}
            {encouragementType === 'consistent' && '💪'}
            {encouragementType === 'encouragement' && '💪'}
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold leading-relaxed">{message}</p>
          </div>
          <button
            onClick={() => setShowAnimation(false)}
            className="text-white/80 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AIEncouragement;
