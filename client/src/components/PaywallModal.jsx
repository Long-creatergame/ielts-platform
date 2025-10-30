import React from 'react';
import { Link } from 'react-router-dom';

const PaywallModal = ({ isOpen, onClose, testId = null }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Bạn đã hoàn thành bài thi thử miễn phí đầu tiên!
          </h2>
          <p className="text-gray-600 mb-6">
            Mở khóa toàn bộ đề luyện IELTS cá nhân hóa để tiếp tục nhé 💪
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">🎁 Ưu đãi đặc biệt</h3>
          <p className="text-sm text-gray-600">
            Giảm 50% cho gói Standard - Chỉ còn 64.500đ/tháng
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <Link
            to="/pricing"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors block"
          >
            🚀 Nâng cấp ngay
          </Link>
          {testId && (
            <Link
              to={`/test/result/${testId}`}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors block"
            >
              🔓 Mở khóa kết quả (29.000đ)
            </Link>
          )}
          <button
            onClick={onClose}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>

        <p className="text-xs text-gray-500">
          * Thanh toán an toàn với Stripe/PayOS
        </p>
      </div>
    </div>
  );
};

export default PaywallModal;
