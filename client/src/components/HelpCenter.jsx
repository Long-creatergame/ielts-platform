import React, { useState } from 'react';

const HelpCenter = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('getting-started');

  const helpCategories = {
    'getting-started': {
      title: '🚀 Bắt đầu',
      icon: '🚀',
      color: 'from-blue-500 to-blue-600',
      articles: [
        {
          title: 'Làm thế nào để bắt đầu học IELTS?',
          content: 'Bắt đầu bằng cách làm bài kiểm tra đầy đủ để đánh giá trình độ hiện tại, sau đó sử dụng AI Practice để luyện tập các kỹ năng cụ thể.',
          steps: [
            'Nhấn "Bắt đầu nhanh" trên dashboard',
            'Chọn "Làm bài kiểm tra đầy đủ"',
            'Hoàn thành 4 kỹ năng: Reading, Writing, Listening, Speaking',
            'Xem kết quả và nhận lời khuyên từ AI'
          ]
        },
        {
          title: 'Cách sử dụng AI Practice?',
          content: 'AI Practice giúp bạn tạo câu hỏi tùy chỉnh phù hợp với trình độ và mục tiêu của bạn.',
          steps: [
            'Vào tab "AI Practice" trên dashboard',
            'Chọn kỹ năng muốn luyện tập',
            'Nhập chủ đề quan tâm (tùy chọn)',
            'Chọn band level phù hợp',
            'Nhấn "Generate" để tạo câu hỏi'
          ]
        },
        {
          title: 'Hiểu về điểm số và đánh giá',
          content: 'Hệ thống sử dụng thang điểm IELTS chuẩn (0-9) và AI để đánh giá chính xác.',
          steps: [
            'Điểm số được tính theo tiêu chí IELTS chính thức',
            'AI phân tích và đưa ra feedback chi tiết',
            'Theo dõi tiến độ qua dashboard',
            'Nhận gợi ý cải thiện cụ thể'
          ]
        }
      ]
    },
    'features': {
      title: '⚙️ Tính năng',
      icon: '⚙️',
      color: 'from-purple-500 to-purple-600',
      articles: [
        {
          title: 'Dashboard - Trung tâm điều khiển',
          content: 'Dashboard cung cấp cái nhìn tổng quan về tiến độ học tập của bạn.',
          features: [
            'Xem thống kê học tập: số bài test, điểm trung bình, chuỗi ngày học',
            'Theo dõi mục tiêu band score',
            'Nhận lời khuyên từ AI Coach',
            'Truy cập nhanh các tính năng chính'
          ]
        },
        {
          title: 'AI Practice - Luyện tập thông minh',
          content: 'Tạo câu hỏi IELTS tùy chỉnh với AI dựa trên trình độ và sở thích của bạn.',
          features: [
            'Tạo câu hỏi cho 4 kỹ năng: Reading, Writing, Listening, Speaking',
            'Tùy chỉnh chủ đề và độ khó',
            'Câu hỏi theo format IELTS chính thức',
            'Hướng dẫn chi tiết và thời gian làm bài'
          ]
        },
        {
          title: 'Phân tích điểm yếu',
          content: 'AI phân tích kết quả và chỉ ra những điểm cần cải thiện.',
          features: [
            'Biểu đồ phân tích chi tiết từng kỹ năng',
            'Xác định điểm mạnh và điểm yếu',
            'Gợi ý cải thiện cụ thể',
            'Theo dõi tiến độ theo thời gian'
          ]
        }
      ]
    },
    'troubleshooting': {
      title: '🔧 Khắc phục sự cố',
      icon: '🔧',
      color: 'from-red-500 to-red-600',
      articles: [
        {
          title: 'Không thể submit bài test?',
          content: 'Kiểm tra kết nối internet và thử lại. Nếu vẫn không được, hãy liên hệ support.',
          solutions: [
            'Kiểm tra kết nối internet',
            'Refresh trang và thử lại',
            'Xóa cache trình duyệt',
            'Liên hệ support nếu vấn đề vẫn tiếp tục'
          ]
        },
        {
          title: 'AI không tạo được câu hỏi?',
          content: 'Có thể do quota API đã hết. Hệ thống sẽ tự động chuyển sang câu hỏi mẫu.',
          solutions: [
            'Hệ thống sẽ tự động sử dụng câu hỏi mẫu',
            'Vẫn có thể luyện tập bình thường',
            'AI sẽ hoạt động trở lại sau khi quota được reset'
          ]
        },
        {
          title: 'Không lưu được kết quả?',
          content: 'Kiểm tra kết nối database. Dữ liệu sẽ được lưu tự động khi kết nối ổn định.',
          solutions: [
            'Kiểm tra kết nối internet',
            'Thử refresh trang',
            'Kết quả sẽ được lưu tự động khi kết nối ổn định'
          ]
        }
      ]
    }
  };

  const currentCategory = helpCategories[activeCategory];

  return (
    <div className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">📚 Trung tâm trợ giúp</h2>
              <p className="text-blue-100">Tìm hiểu cách sử dụng platform hiệu quả nhất</p>
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

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-4">
            <h3 className="font-bold text-gray-900 mb-4">Danh mục</h3>
            <div className="space-y-2">
              {Object.entries(helpCategories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    activeCategory === key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{category.icon}</span>
                    <span className="font-medium">{category.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-br ${currentCategory.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                  {currentCategory.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{currentCategory.title}</h3>
              </div>
            </div>

            <div className="space-y-6">
              {currentCategory.articles.map((article, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">{article.title}</h4>
                  <p className="text-gray-600 mb-4 leading-relaxed">{article.content}</p>
                  
                  {article.steps && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h5 className="font-semibold text-blue-900 mb-3">Các bước thực hiện:</h5>
                      <ol className="space-y-2">
                        {article.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start space-x-3">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                              {stepIndex + 1}
                            </span>
                            <span className="text-blue-800">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {article.features && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <h5 className="font-semibold text-green-900 mb-3">Tính năng chính:</h5>
                      <ul className="space-y-2">
                        {article.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-3">
                            <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              ✓
                            </span>
                            <span className="text-green-800">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {article.solutions && (
                    <div className="bg-orange-50 rounded-xl p-4">
                      <h5 className="font-semibold text-orange-900 mb-3">Giải pháp:</h5>
                      <ul className="space-y-2">
                        {article.solutions.map((solution, solutionIndex) => (
                          <li key={solutionIndex} className="flex items-start space-x-3">
                            <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              !
                            </span>
                            <span className="text-orange-800">{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
