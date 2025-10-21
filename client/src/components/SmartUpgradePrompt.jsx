import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SmartUpgradePrompt = () => {
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.paid) {
      setLoading(false);
      return;
    }

    const fetchRecommendation = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/upsell/recommendation/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setRecommendation(data);
        }
      } catch (error) {
        console.error('Error fetching recommendation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [user]);

  if (loading || !recommendation || !recommendation.recommendation) return null;

  const { recommendation: rec } = recommendation;
  const urgencyColors = {
    high: 'from-red-500 to-orange-500',
    medium: 'from-yellow-500 to-orange-500',
    low: 'from-blue-500 to-green-500'
  };

  return (
    <div className={`bg-gradient-to-r ${urgencyColors[rec.urgency]} text-white p-4 rounded-lg shadow-lg mb-6`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl">💡</span>
            <h3 className="font-bold">Gợi ý cải thiện cá nhân hóa</h3>
          </div>
          <p className="text-sm opacity-90 mb-3">
            {recommendation.message}
          </p>
          <div className="flex items-center space-x-4 text-xs">
            <span>Kỹ năng: <strong>{rec.skill}</strong></span>
            <span>Hiện tại: <strong>Band {rec.currentBand.toFixed(1)}</strong></span>
            <span>Mục tiêu: <strong>Band {rec.targetBand}</strong></span>
          </div>
        </div>
        <Link
          to="/pricing"
          className="bg-white text-gray-800 hover:bg-gray-100 font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap ml-4"
        >
          Thử ngay
        </Link>
      </div>
    </div>
  );
};

export default SmartUpgradePrompt;
