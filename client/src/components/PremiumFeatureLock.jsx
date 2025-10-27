import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUpgradePrompt } from '../utils/featureAccess';

const PremiumFeatureLock = ({ 
  feature, 
  children, 
  showPreview = true,
  className = "",
  onUpgradeClick = null 
}) => {
  const { user } = useAuth();
  
  // If user has access, show the feature
  if (user && (user.paid || user.plan === 'paid')) {
    return <>{children}</>;
  }
  
  const prompt = getUpgradePrompt(feature);
  
  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      // Default behavior - redirect to pricing
      window.location.href = '/pricing';
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      {/* Blurred content preview */}
      {showPreview && (
        <div className="filter blur-sm pointer-events-none opacity-60">
          {children}
        </div>
      )}
      
      {/* Overlay with upgrade prompt */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
        <div className="text-center p-6 max-w-sm">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {prompt.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {prompt.message}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleUpgradeClick}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              {prompt.cta}
            </button>
            
            <div className="text-xs text-gray-500">
              💡 Nâng cấp để truy cập tất cả tính năng
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeatureLock;
