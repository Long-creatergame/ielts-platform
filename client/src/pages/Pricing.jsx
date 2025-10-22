import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Pricing = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // SECURITY: Check if user is logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Please login to view pricing</h1>
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/payment/plans`);
        if (response.ok) {
          const data = await response.json();
          setPlans(data.plans);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handlePurchase = async (planId) => {
    if (!user) {
      alert('Vui lòng đăng nhập để mua gói');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId, amount: plans.find(p => p.id === planId)?.price || 0 })
      });

      if (response.ok) {
        const data = await response.json();
        // In real app, redirect to payment URL
        alert(`Chuyển hướng đến trang thanh toán...\nURL: ${data.paymentUrl}`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Có lỗi xảy ra khi tạo thanh toán');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎯 Chọn gói phù hợp với bạn
          </h1>
          <p className="text-lg text-gray-600">
            Đầu tư cho tương lai IELTS của bạn ngay hôm nay
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-lg p-6 ${
                plan.id === 'premium' ? 'ring-2 ring-green-500 transform scale-105' : ''
              }`}
            >
              {plan.id === 'premium' && (
                <div className="bg-green-500 text-white text-center py-2 px-4 rounded-full text-sm font-bold mb-4 -mt-6">
                  🔥 Phổ biến nhất
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">{plan.name}</div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {plan.price === 0 ? 'Miễn phí' : `${plan.price.toLocaleString()}đ`}
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePurchase(plan.id)}
                className={`w-full py-3 px-4 rounded-lg font-bold transition-colors ${
                  plan.id === 'free'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : plan.id === 'premium'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                disabled={plan.id === 'free'}
              >
                {plan.id === 'free' ? 'Đã có' : 'Mua ngay'}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🎁 Ưu đãi đặc biệt cho người dùng mới
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="font-bold text-blue-800">💳 Thanh toán an toàn</div>
                <div className="text-blue-600">Stripe & PayOS</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="font-bold text-green-800">🔄 Hoàn tiền 100%</div>
                <div className="text-green-600">Trong 7 ngày đầu</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="font-bold text-purple-800">🎯 Cam kết hiệu quả</div>
                <div className="text-purple-600">Hoặc hoàn tiền</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Quay lại Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
