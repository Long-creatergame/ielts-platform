const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Test = require('../models/Test');
const auth = require('../middleware/auth');

// Get personalized upsell recommendation
router.get('/recommendation/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get last 3 test results
    const recentTests = await Test.find({ userId })
      .sort({ dateTaken: -1 })
      .limit(3)
      .select('skillBands totalBand');

    if (recentTests.length === 0) {
      return res.json({
        recommendation: null,
        message: 'Complete your first test to get personalized recommendations'
      });
    }

    // Calculate average skill bands
    const skillAverages = {
      reading: 0,
      listening: 0,
      writing: 0,
      speaking: 0
    };

    recentTests.forEach(test => {
      if (test.skillBands) {
        Object.keys(skillAverages).forEach(skill => {
          skillAverages[skill] += test.skillBands[skill] || 0;
        });
      }
    });

    Object.keys(skillAverages).forEach(skill => {
      skillAverages[skill] = skillAverages[skill] / recentTests.length;
    });

    // Find weakest skill
    const weakestSkill = Object.keys(skillAverages).reduce((a, b) =>
      skillAverages[a] < skillAverages[b] ? a : b
    );

    const weakestBand = skillAverages[weakestSkill];
    const targetBand = user.targetBand;
    const gap = targetBand - weakestBand;

    // Generate personalized recommendation
    let recommendation = null;
    let message = '';

    if (gap > 1.0) {
      recommendation = {
        skill: weakestSkill,
        currentBand: weakestBand,
        targetBand: targetBand,
        gap: gap,
        package: getRecommendedPackage(weakestSkill, gap),
        urgency: 'high'
      };
      
      message = `🎯 ${weakestSkill.charAt(0).toUpperCase() + weakestSkill.slice(1)} của bạn đang ở Band ${weakestBand.toFixed(1)}, thấp hơn mục tiêu ${targetBand} là ${gap.toFixed(1)} band. Hãy thử gói ${recommendation.package.name} để cải thiện nhanh chóng!`;
    } else if (gap > 0.5) {
      recommendation = {
        skill: weakestSkill,
        currentBand: weakestBand,
        targetBand: targetBand,
        gap: gap,
        package: getRecommendedPackage(weakestSkill, gap),
        urgency: 'medium'
      };
      
      message = `💪 ${weakestSkill.charAt(0).toUpperCase() + weakestSkill.slice(1)} của bạn gần đạt mục tiêu rồi! Chỉ cần cải thiện thêm ${gap.toFixed(1)} band nữa với gói ${recommendation.package.name}.`;
    } else {
      message = `🎉 Tuyệt vời! Các kỹ năng của bạn đang tiến triển tốt. Tiếp tục luyện tập để duy trì phong độ nhé!`;
    }

    res.json({
      recommendation,
      message,
      skillAverages,
      recentTests: recentTests.length
    });
  } catch (error) {
    console.error('Upsell recommendation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to get recommended package based on skill and gap
function getRecommendedPackage(skill, gap) {
  const packages = {
    reading: {
      name: 'Reading Master Pack',
      price: 99000,
      description: 'Tập trung cải thiện Reading với 10 đề chuyên sâu'
    },
    listening: {
      name: 'Listening Pro Pack',
      price: 99000,
      description: 'Luyện Listening với audio chất lượng cao'
    },
    writing: {
      name: 'Writing Coach Pack',
      price: 149000,
      description: 'Writing coach 1-1 + AI feedback chi tiết'
    },
    speaking: {
      name: 'Speaking AI Pack',
      price: 199000,
      description: 'Speaking AI + phát âm chuẩn'
    }
  };

  return packages[skill] || packages.writing;
}

module.exports = router;
