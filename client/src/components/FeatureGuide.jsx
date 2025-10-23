import React, { useState } from 'react';
import TutorialTooltip from './TutorialTooltip';

const FeatureGuide = ({ feature, children, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const featureGuides = {
    dashboard: [
      {
        title: '📊 Dashboard Overview',
        content: 'Đây là trung tâm điều khiển của bạn. Bạn có thể xem tiến độ học tập, điểm số và nhận lời khuyên từ AI Coach.',
        position: 'top'
      },
      {
        title: '📈 Thống kê học tập',
        content: 'Xem số bài test đã hoàn thành, điểm trung bình và chuỗi ngày học liên tục.',
        position: 'bottom',
        target: '.stats-cards'
      },
      {
        title: '🎯 Mục tiêu học tập',
        content: 'Theo dõi tiến độ hướng tới mục tiêu band score của bạn.',
        position: 'top',
        target: '.goal-progress'
      }
    ],
    'ai-practice': [
      {
        title: '🧩 AI Practice Generator',
        content: 'Tạo câu hỏi IELTS tùy chỉnh với AI. Chọn kỹ năng, chủ đề và mức độ phù hợp.',
        position: 'top'
      },
      {
        title: '⚙️ Cài đặt bài tập',
        content: 'Chọn kỹ năng (Writing, Speaking, Reading, Listening), chủ đề và band level.',
        position: 'bottom',
        target: '.practice-form'
      },
      {
        title: '🎯 Tạo câu hỏi',
        content: 'Nhấn "Generate" để AI tạo câu hỏi phù hợp với trình độ của bạn.',
        position: 'top',
        target: '.generate-button'
      }
    ],
    'test-start': [
      {
        title: '📝 Bắt đầu bài kiểm tra',
        content: 'Nhấn vào "Start New Test" để bắt đầu bài kiểm tra IELTS đầy đủ 4 kỹ năng.',
        position: 'top'
      },
      {
        title: '🎯 Chọn mức độ',
        content: 'Chọn mức độ phù hợp với trình độ hiện tại của bạn.',
        position: 'bottom',
        target: '.level-selection'
      },
      {
        title: '⏱️ Thời gian làm bài',
        content: 'Mỗi kỹ năng có thời gian riêng: Reading (60 phút), Writing (60 phút), Listening (30 phút), Speaking (15 phút).',
        position: 'top',
        target: '.time-info'
      }
    ],
    'weakness-analysis': [
      {
        title: '📈 Phân tích điểm yếu',
        content: 'AI sẽ phân tích kết quả của bạn và chỉ ra những điểm cần cải thiện.',
        position: 'top'
      },
      {
        title: '📊 Biểu đồ phân tích',
        content: 'Xem biểu đồ chi tiết về điểm mạnh và điểm yếu của từng kỹ năng.',
        position: 'bottom',
        target: '.weakness-chart'
      },
      {
        title: '💡 Gợi ý cải thiện',
        content: 'Nhận lời khuyên cụ thể để cải thiện từng kỹ năng.',
        position: 'top',
        target: '.improvement-suggestions'
      }
    ],
    'recommendations': [
      {
        title: '💡 Gợi ý luyện tập',
        content: 'Nhận gợi ý bài tập cá nhân hóa dựa trên kết quả phân tích của AI.',
        position: 'top'
      },
      {
        title: '🎯 Bài tập phù hợp',
        content: 'AI sẽ đề xuất bài tập phù hợp với trình độ và điểm yếu của bạn.',
        position: 'bottom',
        target: '.recommended-exercises'
      },
      {
        title: '📅 Lịch luyện tập',
        content: 'Theo dõi lịch luyện tập được đề xuất để đạt mục tiêu.',
        position: 'top',
        target: '.practice-schedule'
      }
    ]
  };

  const guide = featureGuides[feature] || [];
  const currentGuide = guide[currentStep];

  const handleNext = () => {
    if (currentStep < guide.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsActive(false);
      if (onComplete) onComplete();
    }
  };

  const handleClose = () => {
    setIsActive(false);
    if (onComplete) onComplete();
  };

  const startGuide = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  if (!currentGuide) {
    return (
      <div className="relative">
        {children}
        <button
          onClick={startGuide}
          className="absolute top-2 right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors z-10"
          title="Hướng dẫn sử dụng"
        >
          ?
        </button>
      </div>
    );
  }

  return (
    <TutorialTooltip
      title={currentGuide.title}
      content={currentGuide.content}
      position={currentGuide.position}
      show={isActive}
      onNext={handleNext}
      onClose={handleClose}
      step={currentStep + 1}
      totalSteps={guide.length}
    >
      <div className="relative">
        {children}
        <button
          onClick={startGuide}
          className="absolute top-2 right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors z-10"
          title="Hướng dẫn sử dụng"
        >
          ?
        </button>
      </div>
    </TutorialTooltip>
  );
};

export default FeatureGuide;
