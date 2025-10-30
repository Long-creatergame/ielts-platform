import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TestSelector = ({ onClose }) => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState(null);

  const testTypes = [
    {
      id: 'quick-assessment',
      title: 'Quick Assessment',
      description: 'Bài kiểm tra nhanh 15 phút để đánh giá trình độ hiện tại',
      duration: '15 phút',
      skills: 'Tất cả 4 kỹ năng',
      difficulty: 'Dễ → Khó',
      color: 'from-green-500 to-green-600',
      link: '/test/quick',
      icon: '⚡',
      iconBg: 'bg-yellow-100'
    },
    {
      id: 'skill-practice',
      title: 'Skill Practice',
      description: 'Luyện tập từng kỹ năng riêng biệt để cải thiện điểm yếu',
      duration: '20-30 phút',
      skills: '1 kỹ năng',
      difficulty: 'Tùy chọn',
      color: 'from-blue-500 to-blue-600',
      link: '/test/practice',
      icon: '🎯',
      iconBg: 'bg-blue-100'
    },
    {
      id: 'full-ielts',
      title: 'Full IELTS Test',
      description: 'Bài thi đầy đủ 4 kỹ năng như thi thật IELTS',
      duration: '2.5 giờ',
      skills: 'Tất cả 4 kỹ năng',
      difficulty: 'Thực tế',
      color: 'from-red-500 to-red-600',
      link: '/test/full',
      icon: '📋',
      iconBg: 'bg-red-100'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="text-3xl mr-3">🎯</span>
            {t('testSelector.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testTypes.map((type) => (
            <div
              key={type.id}
              className={`bg-gradient-to-br ${type.color} rounded-xl p-6 text-white cursor-pointer transform transition-all hover:scale-105 hover:shadow-lg relative overflow-hidden`}
              onClick={() => setSelectedType(type)}
            >
              {/* Icon with background */}
              <div className={`w-16 h-16 ${type.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                <span className="text-3xl">{type.icon}</span>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{type.title}</h3>
              <p className="text-sm opacity-90 mb-4">{type.description}</p>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between bg-white/20 rounded-lg p-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">⏱️</span>
                    <span className="opacity-90">{t('testSelector.duration')}:</span>
                  </div>
                  <span className="font-semibold">{type.duration}</span>
                </div>
                <div className="flex items-center justify-between bg-white/20 rounded-lg p-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">🎯</span>
                    <span className="opacity-90">{t('testSelector.skills')}:</span>
                  </div>
                  <span className="font-semibold">{type.skills}</span>
                </div>
                <div className="flex items-center justify-between bg-white/20 rounded-lg p-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">📊</span>
                    <span className="opacity-90">{t('testSelector.difficulty')}:</span>
                  </div>
                  <span className="font-semibold">{type.difficulty}</span>
                </div>
              </div>

              {selectedType?.id === type.id && (
                <div className="mt-4 pt-4 border-t border-white border-opacity-30">
                  <button
                    onClick={() => {
                      onClose();
                      window.location.href = type.link;
                    }}
                    className="block w-full bg-white text-gray-900 font-bold py-3 px-4 rounded-lg text-center hover:bg-gray-100 transition-colors"
                  >
                    {t('testSelector.start')} {type.title}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-3">💡</span>
            {t('testSelector.suggestions')}:
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Quick Assessment</div>
                <div className="text-sm text-gray-600">Dành cho người mới bắt đầu</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Skill Practice</div>
                <div className="text-sm text-gray-600">Cải thiện kỹ năng cụ thể</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold">3</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Full IELTS Test</div>
                <div className="text-sm text-gray-600">Chuẩn bị thi thật</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSelector;
