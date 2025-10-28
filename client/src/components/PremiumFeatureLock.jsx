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
    <div className={`relative group ${className}`}>
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
      
      {/* Hover tooltip with benefits */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
        <div className="text-center">
          <div className="font-semibold mb-1">✨ Unlock Premium Benefits</div>
          <div className="text-gray-300 text-xs">
            • AI-powered feedback<br/>
            • Unlimited practice tests<br/>
            • Advanced analytics<br/>
            • Priority support
          </div>
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

export default PremiumFeatureLock;
