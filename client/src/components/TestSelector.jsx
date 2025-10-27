import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TestSelector = ({ onClose }) => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState(null);

  const testTypes = [
    {
      id: 'quick-assessment',
      title: '⚡ Quick Assessment',
      description: 'Bài kiểm tra nhanh 15 phút để đánh giá trình độ hiện tại',
      duration: '15 phút',
      skills: 'Tất cả 4 kỹ năng',
      difficulty: 'Dễ → Khó',
      color: 'from-green-500 to-green-600',
      link: '/test/quick',
      icon: '⚡'
    },
    {
      id: 'skill-practice',
      title: '🎯 Skill Practice',
      description: 'Luyện tập từng kỹ năng riêng biệt để cải thiện điểm yếu',
      duration: '20-30 phút',
      skills: '1 kỹ năng',
      difficulty: 'Tùy chọn',
      color: 'from-blue-500 to-blue-600',
      link: '/test/practice',
      icon: '🎯'
    },
    {
      id: 'full-ielts',
      title: '📝 Full IELTS Test',
      description: 'Bài thi đầy đủ 4 kỹ năng như thi thật IELTS',
      duration: '2.5 giờ',
      skills: 'Tất cả 4 kỹ năng',
      difficulty: 'Thực tế',
      color: 'from-red-500 to-red-600',
      link: '/test/full',
      icon: '📝'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🎯 {t('testSelector.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testTypes.map((type) => (
            <div
              key={type.id}
              className={`bg-gradient-to-br ${type.color} rounded-xl p-6 text-white cursor-pointer transform transition-all hover:scale-105 hover:shadow-lg`}
              onClick={() => setSelectedType(type)}
            >
              <div className="text-4xl mb-4">{type.icon}</div>
              <h3 className="text-xl font-bold mb-2">{type.title}</h3>
              <p className="text-sm opacity-90 mb-4">{type.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-80">⏱️ {t('testSelector.duration')}:</span>
                  <span className="font-semibold">{type.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">🎯 {t('testSelector.skills')}:</span>
                  <span className="font-semibold">{type.skills}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">📊 {t('testSelector.difficulty')}:</span>
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

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">💡 {t('testSelector.suggestions')}:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Quick Assessment:</strong> Dành cho người mới bắt đầu</li>
            <li>• <strong>Skill Practice:</strong> Dành cho người muốn cải thiện kỹ năng cụ thể</li>
            <li>• <strong>Full IELTS Test:</strong> Dành cho người chuẩn bị thi thật</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestSelector;
