const V2StudentProfile = require('../models/StudentProfile');

async function ensureProfile(userId) {
  const existing = await V2StudentProfile.findOne({ userId });
  if (existing) return existing;
  return V2StudentProfile.create({ userId });
}

exports.getMyProfile = async (req, res) => {
  const userId = req.user._id;
  const profile = await ensureProfile(userId);
  return res.json({
    success: true,
    data: {
      userId: profile.userId,
      targetBand: profile.targetBand,
      recurringWeaknesses: profile.recurringWeaknesses,
      plan7Days: profile.plan7Days,
      abilityHistory: profile.abilityHistory.slice(-20),
      lastUpdatedAt: profile.lastUpdatedAt,
    },
  });
};

