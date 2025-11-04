const { getBandFromScore } = require('../../utils/bandCalculator');

function evaluateReading(userAnswers, answerKeys) {
  if (!userAnswers || !answerKeys) {
    return { band: 0, correct: 0, total: 40, percentage: 0 };
  }

  const total = Math.max(answerKeys.length, 40);
  let correct = 0;

  // Compare answers
  for (let i = 0; i < Math.min(userAnswers.length, answerKeys.length); i++) {
    const user = String(userAnswers[i] || '').trim().toLowerCase();
    const key = String(answerKeys[i] || '').trim().toLowerCase();
    if (user === key) correct++;
  }

  const percentage = (correct / total) * 100;
  const band = getBandFromScore(correct, total);

  return { band, correct, total, percentage };
}

module.exports = { evaluateReading };

