// Feature Access Control System
export const FEATURE_ACCESS = {
  // FREE FEATURES - Always available
  FREE: {
    // Basic test taking (limited)
    BASIC_TESTS: 'basic_tests',
    // Basic dashboard overview
    DASHBOARD_OVERVIEW: 'dashboard_overview',
    // Limited AI practice (1 per day)
    LIMITED_AI_PRACTICE: 'limited_ai_practice',
    // Basic progress tracking
    BASIC_PROGRESS: 'basic_progress',
    // Community features
    COMMUNITY: 'community',
    // Help center
    HELP_CENTER: 'help_center'
  },
  
  // PREMIUM FEATURES - Require paid subscription
  PREMIUM: {
    // Unlimited tests
    UNLIMITED_TESTS: 'unlimited_tests',
    // Advanced AI features
    ADVANCED_AI: 'advanced_ai',
    // AI Personalization
    AI_PERSONALIZATION: 'ai_personalization',
    // Detailed weakness analysis
    WEAKNESS_ANALYSIS: 'weakness_analysis',
    // Advanced recommendations
    ADVANCED_RECOMMENDATIONS: 'advanced_recommendations',
    // Detailed progress tracking
    DETAILED_PROGRESS: 'detailed_progress',
    // Voice recording analysis
    VOICE_ANALYSIS: 'voice_analysis',
    // Export results
    EXPORT_RESULTS: 'export_results',
    // Priority support
    PRIORITY_SUPPORT: 'priority_support'
  }
};

// Check if user has access to a feature
export const hasFeatureAccess = (user, feature) => {
  if (!user) return false;
  
  // TEMPORARY: ALL FEATURES UNLOCKED FOR TESTING
  return true;
  
  // Paid users have access to everything
  if (user.paid || user.plan === 'paid') {
    return true;
  }
  
  // Free users only have access to FREE features
  const freeFeatures = Object.values(FEATURE_ACCESS.FREE);
  return freeFeatures.includes(feature);
};

// Get feature limitations for free users
export const getFeatureLimitations = (user, feature) => {
  // TEMPORARY: NO LIMITATIONS FOR TESTING
  if (!user) return null;
  return null;
  
  if (!user || user.paid || user.plan === 'paid') {
    return null; // No limitations for paid users
  }
  
  const limitations = {
    [FEATURE_ACCESS.FREE.LIMITED_AI_PRACTICE]: {
      dailyLimit: 1,
      usedToday: user.aiPracticeUsedToday || 0,
      resetTime: 'midnight'
    },
    [FEATURE_ACCESS.FREE.BASIC_TESTS]: {
      remaining: user.freeTestsLimit - user.freeTestsUsed,
      total: user.freeTestsLimit
    }
  };
  
  return limitations[feature] || null;
};

// Check if user can perform an action
export const canPerformAction = (user, action) => {
  // TEMPORARY: ALL ACTIONS ALLOWED FOR TESTING
  return true;
  
  switch (action) {
    case 'start_test':
      return user.paid || user.plan === 'paid' || user.freeTestsUsed < user.freeTestsLimit;
    
    case 'ai_practice':
      if (user.paid || user.plan === 'paid') return true;
      return (user.aiPracticeUsedToday || 0) < 1;
    
    case 'view_detailed_analysis':
      return user.paid || user.plan === 'paid';
    
    case 'export_results':
      return user.paid || user.plan === 'paid';
    
    default:
      return true;
  }
};

// Get upgrade prompt message for a feature
export const getUpgradePrompt = (feature) => {
  const prompts = {
    [FEATURE_ACCESS.PREMIUM.UNLIMITED_TESTS]: {
      title: '🚀 Nâng cấp để làm test không giới hạn',
      message: 'Bạn đã sử dụng hết bài test miễn phí. Nâng cấp để tiếp tục luyện tập!',
      cta: 'Nâng cấp ngay'
    },
    [FEATURE_ACCESS.PREMIUM.ADVANCED_AI]: {
      title: '🤖 AI nâng cao chỉ dành cho thành viên Premium',
      message: 'Truy cập AI phân tích chi tiết, gợi ý cá nhân hóa và đánh giá chuyên sâu.',
      cta: 'Khám phá AI Premium'
    },
    [FEATURE_ACCESS.PREMIUM.AI_PERSONALIZATION]: {
      title: '🎯 Phân tích cá nhân hóa AI',
      message: 'Nhận phân tích điểm mạnh/yếu chi tiết và lộ trình học tập được tối ưu cho bạn.',
      cta: 'Mở khóa AI Personalization'
    },
    [FEATURE_ACCESS.PREMIUM.WEAKNESS_ANALYSIS]: {
      title: '📊 Phân tích điểm yếu chuyên sâu',
      message: 'Xem phân tích chi tiết về điểm yếu và cách cải thiện cụ thể.',
      cta: 'Xem phân tích chi tiết'
    }
  };
  
  return prompts[feature] || {
    title: '🔒 Tính năng Premium',
    message: 'Tính năng này chỉ dành cho thành viên Premium.',
    cta: 'Nâng cấp ngay'
  };
};
