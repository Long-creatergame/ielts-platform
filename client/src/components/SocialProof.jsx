import React from 'react';
import { useTranslation } from 'react-i18next';

const SocialProof = () => {
  const { t } = useTranslation();
  
  const testimonials = [
    {
      name: "Nguyễn Minh Anh",
      score: "8.5",
      text: "Từ 6.0 lên 8.5 chỉ sau 2 tháng! AI feedback cực kỳ chi tiết và hữu ích.",
      avatar: "👩‍🎓"
    },
    {
      name: "Trần Văn Hùng", 
      score: "7.5",
      text: "Platform này thực sự hiệu quả. Mình đã đạt target band 7.5 như mong muốn!",
      avatar: "👨‍💼"
    },
    {
      name: "Lê Thị Mai",
      score: "8.0", 
      text: "AI personalization giúp mình tập trung vào đúng điểm yếu. Rất recommend!",
      avatar: "👩‍🎨"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Học viên đã đạt target" },
    { number: "95%", label: "Tỷ lệ thành công" },
    { number: "4.9/5", label: "Đánh giá trung bình" }
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          🏆 Hàng nghìn học viên đã thành công
        </h2>
        <p className="text-lg text-gray-600">
          Tham gia cộng đồng học viên IELTS thành công nhất Việt Nam
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
            <div className="text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="text-2xl mr-3">{testimonial.avatar}</div>
              <div>
                <div className="font-semibold text-gray-800">{testimonial.name}</div>
                <div className="text-sm text-blue-600 font-bold">Band {testimonial.score}</div>
              </div>
            </div>
            <p className="text-gray-600 italic">"{testimonial.text}"</p>
            <div className="flex text-yellow-400 mt-3">
              {"★".repeat(5)}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-8">
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl p-6">
          <h3 className="text-xl font-bold mb-2">🎯 Bạn có muốn trở thành câu chuyện thành công tiếp theo?</h3>
          <p className="text-sm opacity-90">
            Tham gia cùng hàng nghìn học viên đã đạt target IELTS với sự hỗ trợ của AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialProof;
