import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const WelcomeBanner = ({ onStartOnboarding, onQuickStart }) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user is new and hasn't dismissed the banner
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    const hasDismissedBanner = localStorage.getItem('welcome_banner_dismissed');
    
    if (!hasCompletedOnboarding && !hasDismissedBanner && user) {
      setIsVisible(true);
    }
  }, [user]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('welcome_banner_dismissed', 'true');
  };

  const handleStartOnboarding = () => {
    handleDismiss();
    if (onStartOnboarding) onStartOnboarding();
  };

  const handleQuickStart = () => {
    handleDismiss();
    if (onQuickStart) onQuickStart();
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl mb-6 overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
      </div>

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                🎯
              </div>
              <div>
                <h2 className="text-2xl font-bold">Chào mừng đến với IELTS Platform!</h2>
                <p className="text-blue-100 text-sm">Hành trình IELTS của bạn bắt đầu từ đây</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">📝</span>
                  <h3 className="font-bold">Bài kiểm tra đầy đủ</h3>
                </div>
                <p className="text-blue-100 text-sm">Đánh giá trình độ với 4 kỹ năng IELTS</p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">🧩</span>
                  <h3 className="font-bold">AI Practice</h3>
                </div>
                <p className="text-blue-100 text-sm">Luyện tập với câu hỏi AI tùy chỉnh</p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">📈</span>
                  <h3 className="font-bold">Phân tích thông minh</h3>
                </div>
                <p className="text-blue-100 text-sm">AI phân tích và đưa ra lời khuyên</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleStartOnboarding}
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>🚀</span>
                <span>Hướng dẫn chi tiết</span>
              </button>
              <button
                onClick={handleQuickStart}
                className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>⚡</span>
                <span>Bắt đầu nhanh</span>
              </button>
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                Để sau
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white transition-colors ml-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
