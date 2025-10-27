import React from 'react';
import { useTranslation } from 'react-i18next';
import { FEATURE_ACCESS } from '../utils/featureAccess';

const FeatureComparison = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      name: 'Bài test IELTS',
      free: '3 bài miễn phí',
      premium: 'Không giới hạn',
      icon: '📝'
    },
    {
      name: 'AI Practice',
      free: '1 lần/ngày',
      premium: 'Không giới hạn',
      icon: '🤖'
    },
    {
      name: 'Phân tích điểm yếu',
      free: '❌ Không có',
      premium: '✅ Chi tiết & cá nhân hóa',
      icon: '📊'
    },
    {
      name: 'AI Personalization',
      free: '❌ Không có',
      premium: '✅ Lộ trình học tối ưu',
      icon: '🎯'
    },
    {
      name: 'Gợi ý thông minh',
      free: '❌ Không có',
      premium: '✅ Dựa trên AI',
      icon: '💡'
    },
    {
      name: 'Theo dõi tiến độ',
      free: 'Cơ bản',
      premium: 'Chi tiết & xuất báo cáo',
      icon: '📈'
    },
    {
      name: 'Voice Analysis',
      free: '❌ Không có',
      premium: '✅ Phân tích Speaking',
      icon: '🎤'
    },
    {
      name: 'Hỗ trợ',
      free: 'Email',
      premium: 'Ưu tiên & Chat trực tiếp',
      icon: '🆘'
    }
  ];
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          🔍 So sánh tính năng
        </h2>
        <p className="text-gray-600">
          Xem sự khác biệt giữa gói miễn phí và Premium
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-4 px-6 font-semibold text-gray-800">Tính năng</th>
              <th className="text-center py-4 px-6 font-semibold text-gray-800">Miễn phí</th>
              <th className="text-center py-4 px-6 font-semibold text-blue-600">Premium</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{feature.icon}</span>
                    <span className="font-medium text-gray-800">{feature.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className={`text-sm ${
                    feature.free.includes('❌') ? 'text-red-500' : 
                    feature.free.includes('✅') ? 'text-green-500' : 
                    'text-gray-600'
                  }`}>
                    {feature.free}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className={`text-sm font-medium ${
                    feature.premium.includes('❌') ? 'text-red-500' : 
                    feature.premium.includes('✅') ? 'text-green-500' : 
                    'text-blue-600'
                  }`}>
                    {feature.premium}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            🚀 Sẵn sàng nâng cấp?
          </h3>
          <p className="text-gray-600 mb-4">
            Mở khóa tất cả tính năng với chỉ 299,000đ/tháng
          </p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Nâng cấp ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureComparison;
