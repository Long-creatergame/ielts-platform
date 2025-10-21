// Personalized coach messages based on user progress and goals
function getCoachMessage(user, lastTest) {
  if (!lastTest) {
    return `🎯 Chào ${user.name}! Hãy bắt đầu bài thi đầu tiên để tôi có thể đưa ra lời khuyên phù hợp nhé!`;
  }

  const { totalBand } = lastTest;
  const { targetBand, goal, name } = user;

  // Achievement messages
  if (totalBand >= targetBand) {
    return `🔥 Xuất sắc! ${name}, bạn đã đạt hoặc vượt mục tiêu ${targetBand}! Tiếp tục duy trì phong độ nhé!`;
  }

  // Progress messages
  const gap = targetBand - totalBand;
  if (gap <= 0.5) {
    return `💪 Gần đạt rồi, ${name}! Bạn chỉ còn thiếu ${gap.toFixed(1)} band nữa để đạt mục tiêu ${targetBand}.`;
  }

  if (gap <= 1.0) {
    return `🎯 Cố gắng lên, ${name}! Bạn cần cải thiện thêm ${gap.toFixed(1)} band để đạt mục tiêu ${targetBand}.`;
  }

  // Encouragement messages
  return `🌟 Đừng nản lòng, ${name}! Mỗi bài thi là một bước tiến. Hãy kiên trì luyện tập để đạt mục tiêu ${targetBand}!`;
}

// Get skill-specific feedback
function getSkillFeedback(skillBands, targetBand) {
  const skills = Object.keys(skillBands);
  const weakestSkill = skills.reduce((min, skill) => 
    skillBands[skill] < skillBands[min] ? skill : min
  );
  const strongestSkill = skills.reduce((max, skill) => 
    skillBands[skill] > skillBands[max] ? skill : max
  );

  const skillNames = {
    reading: 'Reading',
    listening: 'Listening', 
    writing: 'Writing',
    speaking: 'Speaking'
  };

  return {
    weakest: {
      skill: weakestSkill,
      name: skillNames[weakestSkill],
      band: skillBands[weakestSkill]
    },
    strongest: {
      skill: strongestSkill,
      name: skillNames[strongestSkill],
      band: skillBands[strongestSkill]
    }
  };
}

// Get personalized recommendations
function getRecommendations(user, lastTest) {
  if (!lastTest) return [];

  const recommendations = [];
  const { skillBands, totalBand } = lastTest;
  const { targetBand } = user;

  // Skill-specific recommendations
  Object.entries(skillBands).forEach(([skill, band]) => {
    if (band < targetBand - 0.5) {
      const skillNames = {
        reading: 'Reading',
        listening: 'Listening',
        writing: 'Writing', 
        speaking: 'Speaking'
      };
      recommendations.push(`Tập trung cải thiện ${skillNames[skill]} - hiện tại Band ${band}`);
    }
  });

  // General recommendations
  if (totalBand < targetBand) {
    recommendations.push(`Luyện tập thêm để đạt mục tiêu Band ${targetBand}`);
  }

  return recommendations;
}

// Get motivational message based on time of day
function getTimeBasedGreeting(name) {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return `🌞 Chào buổi sáng, ${name}! Sẵn sàng cho bài luyện tập hôm nay chưa?`;
  } else if (hour < 18) {
    return `☀️ Chào buổi chiều, ${name}! Thời gian luyện tập tuyệt vời!`;
  } else {
    return `🌙 Chào buổi tối, ${name}! Kết thúc ngày bằng một bài thi nhé?`;
  }
}

module.exports = {
  getCoachMessage,
  getSkillFeedback,
  getRecommendations,
  getTimeBasedGreeting
};
