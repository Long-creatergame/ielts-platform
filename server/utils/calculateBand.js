// Calculate IELTS band score based on correct answers
function calculateBand(correctAnswers, totalQuestions, skill) {
  const percentage = (correctAnswers / totalQuestions) * 100;
  
  // IELTS band calculation based on skill
  switch (skill) {
    case 'reading':
    case 'listening':
      if (percentage >= 95) return 9.0;
      if (percentage >= 90) return 8.5;
      if (percentage >= 85) return 8.0;
      if (percentage >= 80) return 7.5;
      if (percentage >= 75) return 7.0;
      if (percentage >= 70) return 6.5;
      if (percentage >= 65) return 6.0;
      if (percentage >= 60) return 5.5;
      if (percentage >= 55) return 5.0;
      if (percentage >= 50) return 4.5;
      return 4.0;
    
    case 'writing':
    case 'speaking':
      // For writing/speaking, we'll use a simpler calculation
      // In a real app, this would use AI scoring
      return Math.min(9.0, Math.max(4.0, (percentage / 10) + 4));
    
    default:
      return 6.0;
  }
}

// Calculate overall band score
function calculateOverallBand(scores) {
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round((sum / scores.length) * 2) / 2; // Round to nearest 0.5
}

module.exports = {
  calculateBand,
  calculateOverallBand
};
