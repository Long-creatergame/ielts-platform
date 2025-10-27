import React from 'react';
import { useTranslation } from 'react-i18next';

const FreeTrialProgress = ({ user }) => {
  const { t } = useTranslation();
  
  if (!user || user.paid) return null;
  
  const progress = (user.freeTestsUsed / user.freeTestsLimit) * 100;
  const remaining = user.freeTestsLimit - user.freeTestsUsed;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <span className="text-lg mr-2">🎯</span>
          Bài test miễn phí của bạn
        </h3>
        <span className="text-sm text-gray-600">
          {user.freeTestsUsed}/{user.freeTestsLimit} đã sử dụng
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
        <div 
          className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Còn lại: <span className="font-semibold text-blue-600">{remaining} bài test</span>
        </span>
        {remaining === 0 && (
          <span className="text-red-600 font-semibold">
            ⚠️ Đã hết bài test miễn phí
          </span>
        )}
      </div>
      
      {remaining > 0 && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Mẹo:</strong> Sử dụng cẩn thận {remaining} bài test còn lại để trải nghiệm đầy đủ platform!
          </p>
        </div>
      )}
    </div>
  );
};

export default FreeTrialProgress;
