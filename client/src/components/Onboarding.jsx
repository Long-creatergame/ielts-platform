import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Onboarding = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user is new (no completed tests)
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasCompletedOnboarding && user) {
      setIsVisible(true);
    }
  }, [user]);

  const steps = [
    {
      id: 'welcome',
      title: '🎯 Chào mừng đến với IELTS Platform!',
      content: 'Chúng tôi sẽ hướng dẫn bạn cách sử dụng platform một cách hiệu quả nhất.',
      position: 'center',
      action: 'Bắt đầu'
    },
    {
      id: 'dashboard',
      title: '📊 Dashboard - Trung tâm điều khiển',
      content: 'Đây là nơi bạn theo dõi tiến độ học tập, xem điểm số và nhận lời khuyên từ AI Coach.',
      position: 'top-left',
      target: '.dashboard-header',
      action: 'Tiếp theo'
    },
    {
      id: 'ai-practice',
      title: '🧩 AI Practice - Luyện tập thông minh',
      content: 'Tạo câu hỏi IELTS tùy chỉnh với AI. Chọn kỹ năng, chủ đề và mức độ phù hợp với bạn.',
      position: 'top',
      target: '.ai-practice-tab',
      action: 'Tìm hiểu'
    },
    {
      id: 'test-start',
      title: '📝 Bắt đầu bài kiểm tra',
      content: 'Nhấn vào "Start New Test" để bắt đầu bài kiểm tra IELTS đầy đủ 4 kỹ năng.',
      position: 'bottom',
      target: '.start-test-button',
      action: 'Thử ngay'
    },
    {
      id: 'weakness-analysis',
      title: '📈 Phân tích điểm yếu',
      content: 'AI sẽ phân tích và chỉ ra điểm yếu của bạn để có kế hoạch luyện tập hiệu quả.',
      position: 'top',
      target: '.my-weakness-tab',
      action: 'Xem chi tiết'
    },
    {
      id: 'recommendations',
      title: '💡 Gợi ý luyện tập',
      content: 'Nhận gợi ý bài tập cá nhân hóa dựa trên kết quả phân tích của AI.',
      position: 'top',
      target: '.recommended-tab',
      action: 'Khám phá'
    },
    {
      id: 'complete',
      title: '🎉 Hoàn thành!',
      content: 'Bạn đã sẵn sàng bắt đầu hành trình IELTS của mình! Chúc bạn thành công!',
      position: 'center',
      action: 'Bắt đầu học'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      localStorage.setItem('onboarding_completed', 'true');
      setIsVisible(false);
      if (onComplete) onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      {/* Overlay */}
      <div className="absolute inset-0" onClick={handleSkip}></div>
      
      {/* Tutorial Content */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2">
            <div 
              className="bg-white h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">
                  {currentStepData.id === 'welcome' ? '🎯' :
                   currentStepData.id === 'dashboard' ? '📊' :
                   currentStepData.id === 'ai-practice' ? '🧩' :
                   currentStepData.id === 'test-start' ? '📝' :
                   currentStepData.id === 'weakness-analysis' ? '📈' :
                   currentStepData.id === 'recommendations' ? '💡' : '🎉'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {currentStepData.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {currentStepData.content}
              </p>
            </div>

            {/* Step Indicator */}
            <div className="flex justify-center space-x-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleSkip}
                className="flex-1 px-4 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors"
              >
                Bỏ qua
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                {currentStepData.action}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
