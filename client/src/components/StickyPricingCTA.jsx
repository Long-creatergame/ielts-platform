import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function StickyPricingCTA() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user || user.paid) return;
    
    // Show after 10 seconds on page
    const timer = setTimeout(() => {
      if (!dismissed) setIsVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [user, dismissed]);

  if (!isVisible || user?.paid) return null;

  return (
    <div
      className="fixed z-50 max-w-sm"
      style={{
        // Avoid overlap with chat widgets at bottom-right
        right: 16,
        bottom: 96, // move up 96px to clear Tawk/Zalo buttons
      }}
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-2xl p-4 animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm">🚀 Nâng cấp ngay!</h3>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/80 hover:text-white text-lg"
          >
            ×
          </button>
        </div>
        <p className="text-xs text-blue-100 mb-3">
          Mở khóa tất cả tính năng AI + không giới hạn bài test
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => window.location.href = '/pricing'}
            className="bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Xem giá
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-blue-100 text-xs hover:text-white transition-colors"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
}
