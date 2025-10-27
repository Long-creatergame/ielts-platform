import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFeatureLimitations } from '../utils/featureAccess';

const LimitedAccess = ({ 
  feature, 
  children, 
  fallback = null,
  className = "" 
}) => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const limitations = getFeatureLimitations(user, feature);
  
  // If no limitations or user is paid, show full content
  if (!limitations || user.paid || user.plan === 'paid') {
    return <>{children}</>;
  }
  
  // Show limited version with usage info
  return (
    <div className={className}>
      {children}
      
      {/* Usage indicator */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-800">
            {feature === 'limited_ai_practice' ? (
              <>
                🤖 AI Practice: {limitations.usedToday}/{limitations.dailyLimit} hôm nay
                {limitations.usedToday >= limitations.dailyLimit && (
                  <span className="text-red-600 font-semibold ml-2">
                    (Đã hết lượt)
                  </span>
                )}
              </>
            ) : feature === 'basic_tests' ? (
              <>
                🎯 Bài test: {limitations.remaining}/{limitations.total} còn lại
                {limitations.remaining === 0 && (
                  <span className="text-red-600 font-semibold ml-2">
                    (Đã hết)
                  </span>
                )}
              </>
            ) : null}
          </span>
          
          {(limitations.usedToday >= limitations.dailyLimit || limitations.remaining === 0) && (
            <button
              onClick={() => window.location.href = '/pricing'}
              className="text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              Nâng cấp
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LimitedAccess;
