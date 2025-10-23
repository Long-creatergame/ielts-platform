import express from 'express';

const router = express.Router();

// Enhanced Assessment Function with better accuracy
function generateEnhancedAssessment(skill, answer, level) {
  const wordCount = answer.trim().split(/\s+/).length;
  const sentenceCount = answer.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  
  // Base scoring factors
  let bandScore = 4.0;
  let feedback = [];
  let suggestions = [];
  
  // Word count analysis
  if (wordCount >= 150) bandScore += 1.0;
  else if (wordCount >= 100) bandScore += 0.5;
  else if (wordCount < 50) bandScore -= 1.0;
  
  // Sentence structure analysis
  if (avgWordsPerSentence >= 15) bandScore += 0.5;
  else if (avgWordsPerSentence < 8) bandScore -= 0.5;
  
  // Vocabulary analysis
  const uniqueWords = new Set(answer.toLowerCase().split(/\s+/)).size;
  const vocabularyRatio = uniqueWords / wordCount;
  if (vocabularyRatio > 0.7) bandScore += 0.5;
  else if (vocabularyRatio < 0.4) bandScore -= 0.5;
  
  // Grammar indicators
  const hasComplexSentences = answer.includes(',') && answer.includes('.');
  if (hasComplexSentences) bandScore += 0.5;
  
  // Task-specific analysis
  if (skill === 'writing') {
    if (answer.includes('however') || answer.includes('therefore') || answer.includes('furthermore')) {
      bandScore += 0.5;
    }
    if (answer.includes('I think') || answer.includes('In my opinion')) {
      bandScore += 0.3;
    }
  }
  
  // Cap the score
  bandScore = Math.min(Math.max(bandScore, 1.0), 9.0);
  
  // Generate feedback
  if (wordCount < 50) {
    feedback.push("Your answer is too short. Aim for at least 150 words.");
    suggestions.push("Expand your ideas with more details and examples");
  }
  
  if (vocabularyRatio < 0.4) {
    feedback.push("Try to use more varied vocabulary.");
    suggestions.push("Learn synonyms and avoid repeating the same words");
  }
  
  if (avgWordsPerSentence < 8) {
    feedback.push("Your sentences are too short. Try combining ideas.");
    suggestions.push("Practice writing complex sentences with conjunctions");
  }
  
  if (bandScore >= 7.0) {
    feedback.push("Good work! Your answer shows strong language skills.");
  } else if (bandScore >= 5.0) {
    feedback.push("Your answer is adequate but needs improvement.");
  } else {
    feedback.push("Your answer needs significant improvement.");
  }
  
  return {
    bandScore: Math.round(bandScore * 10) / 10,
    breakdown: {
      taskAchievement: Math.round(bandScore * 10) / 10,
      coherenceCohesion: Math.round((bandScore - 0.2) * 10) / 10,
      lexicalResource: Math.round((bandScore - 0.1) * 10) / 10,
      grammaticalRange: Math.round((bandScore + 0.1) * 10) / 10,
      fluency: Math.round(bandScore * 10) / 10,
      pronunciation: Math.round(bandScore * 10) / 10
    },
    feedback: feedback.join(' '),
    suggestions: suggestions.length > 0 ? suggestions : [
      "Practice more with sample questions",
      "Focus on time management", 
      "Improve vocabulary range"
    ]
  };
}

// POST /ai/assess - AI Assessment endpoint
router.post('/assess', async (req, res) => {
  try {
    const { skill, answer, level } = req.body;
    
    if (!answer || answer.trim().length === 0) {
      return res.json({
        bandScore: 0,
        feedback: 'No answer provided. Please complete the task to receive an assessment.'
      });
    }

    // Enhanced Assessment Logic with better accuracy
    const assessment = generateEnhancedAssessment(skill, answer, level);
    
    return res.json(assessment);

  } catch (error) {
    console.error('AI assessment error:', error);
    res.status(500).json({
      bandScore: 5.0,
      feedback: 'AI assessment temporarily unavailable. Please try again later.'
    });
  }
});

export default router;