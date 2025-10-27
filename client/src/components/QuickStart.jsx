import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const QuickStart = ({ onClose }) => {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState(null);

  const quickStartOptions = [
    {
      id: 'full-test',
      title: '📝 Làm bài kiểm tra đầy đủ',
      description: 'Làm bài kiểm tra IELTS đầy đủ 4 kỹ năng để đánh giá trình độ hiện tại',
      icon: '📝',
      color: 'from-blue-500 to-blue-600',
      action: 'Bắt đầu kiểm tra',
      link: '/test/start'
    },
    {
      id: 'ai-practice',
      title: '🧩 Luyện tập với AI',
      description: 'Tạo câu hỏi tùy chỉnh với AI để luyện tập kỹ năng cụ thể',
      icon: '🧩',
      color: 'from-purple-500 to-purple-600',
      action: 'Tạo câu hỏi',
      link: '/dashboard?tab=ai-practice'
    },
    {
      id: 'skill-focus',
      title: '🎯 Luyện tập kỹ năng cụ thể',
      description: 'Chọn kỹ năng bạn muốn cải thiện: Writing, Speaking, Reading, hoặc Listening',
      icon: '🎯',
      color: 'from-green-500 to-green-600',
      action: 'Chọn kỹ năng',
      link: '/test/start'
    },
    {
      id: 'explore-features',
      title: '🔍 Khám phá tính năng',
      description: 'Tìm hiểu các tính năng của platform để sử dụng hiệu quả nhất',
      icon: '🔍',
      color: 'from-orange-500 to-orange-600',
      action: 'Khám phá',
      link: '/dashboard'
    }
  ];

  const handleSelect = (option) => {
    setSelectedOption(option);
  };

  const handleStart = () => {
    if (selectedOption) {
      onClose();
      // Navigation will be handled by the Link component
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🚀 {t('quickStart.title')}</h2>
              <p className="text-blue-100">{t('quickStart.subtitle')}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickStartOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => handleSelect(option)}
                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedOption?.id === option.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Selection indicator */}
                {selectedOption?.id === option.id && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center text-2xl`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{option.description}</p>
                    <div className="flex items-center text-blue-600 font-medium text-sm">
                      <span>{option.action}</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-200">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-lg">
                💡
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">{t('quickStart.tipTitle')}</h4>
                <p className="text-gray-700 text-sm">
                  {t('quickStart.tipContent')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('common.later')}
          </button>
          {selectedOption && (
            <button
              onClick={() => {
                handleStart();
                window.location.href = selectedOption.link;
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              {selectedOption.action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickStart;
