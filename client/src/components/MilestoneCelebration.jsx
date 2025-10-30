import React, { useState, useEffect } from 'react';

const MilestoneCelebration = ({ milestone, onClose }) => {
  const [showAnimation, setShowAnimation] = useState(true);

  const milestones = {
    first_test: {
      icon: '🎉',
      title: 'First Test Completed!',
      description: 'You completed your first IELTS test. Great start!',
      badge: 'Beginner',
      color: 'from-blue-500 to-indigo-600'
    },
    ten_tests: {
      icon: '🏆',
      title: '10 Tests Completed!',
      description: 'You\'re becoming a dedicated learner!',
      badge: 'Dedicated Learner',
      color: 'from-green-500 to-emerald-600'
    },
    twenty_five_tests: {
      icon: '🌟',
      title: '25 Tests Completed!',
      description: 'You\'re making amazing progress!',
      badge: 'Persistent Learner',
      color: 'from-purple-500 to-pink-600'
    },
    fifty_tests: {
      icon: '👑',
      title: '50 Tests Completed!',
      description: 'You\'re an IELTS champion!',
      badge: 'IELTS Champion',
      color: 'from-yellow-500 to-orange-600'
    },
    half_band_improvement: {
      icon: '📈',
      title: '0.5 Band Improvement!',
      description: 'You improved by 0.5 band! Keep going!',
      badge: 'Improver',
      color: 'from-green-500 to-teal-600'
    },
    one_band_improvement: {
      icon: '🚀',
      title: '1.0 Band Improvement!',
      description: 'Amazing! You improved by a full band!',
      badge: 'Improver Champion',
      color: 'from-blue-500 to-cyan-600'
    },
    seven_day_streak: {
      icon: '🔥',
      title: '7-Day Streak!',
      description: 'You completed 7 days in a row!',
      badge: 'Consistent',
      color: 'from-orange-500 to-red-600'
    },
    thirty_day_streak: {
      icon: '💪',
      title: '30-Day Streak!',
      description: 'A full month of practice! Incredible!',
      badge: 'Unstoppable',
      color: 'from-red-500 to-pink-600'
    },
    target_reached: {
      icon: '🎯',
      title: 'Target Band Achieved!',
      description: 'You reached your target band score!',
      badge: 'Goal Achiever',
      color: 'from-green-600 to-emerald-700'
    }
  };

  const milestoneData = milestones[milestone] || milestones.first_test;

  useEffect(() => {
    // Auto-close after 6 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShowAnimation(false);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  if (!showAnimation) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`relative bg-gradient-to-br ${milestoneData.color} rounded-3xl p-8 shadow-2xl border-4 border-white/30 transform transition-all duration-500 ${showAnimation ? 'scale-100' : 'scale-0'}`}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"
        >
          ×
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="text-8xl mb-4 animate-bounce">
            {milestoneData.icon}
          </div>

          {/* Badge */}
          <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <span className="text-white font-bold text-sm uppercase tracking-wider">
              {milestoneData.badge}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-3">
            {milestoneData.title}
          </h2>

          {/* Description */}
          <p className="text-white/90 text-lg mb-6 max-w-md mx-auto">
            {milestoneData.description}
          </p>

          {/* Share button */}
          <button
            onClick={() => {
              // Share functionality
              if (navigator.share) {
                navigator.share({
                  title: `I just ${milestoneData.title}!`,
                  text: milestoneData.description,
                  url: window.location.href
                });
              }
            }}
            className="bg-white text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Share Achievement →
          </button>
        </div>

        {/* Confetti effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(200px) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear infinite;
        }
      `}</style>
    </div>
  );
};

export default MilestoneCelebration;
