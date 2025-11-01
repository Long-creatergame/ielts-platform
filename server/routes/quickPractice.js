const express = require('express');
const auth = require('../middleware/auth');
const PracticeSession = require('../models/PracticeSession');
const { getRandomContent } = require('../services/contentGenerator');

const router = express.Router();

// Get quick practice content for a specific skill
router.get('/:skill', auth, async (req, res) => {
  try {
    const { skill } = req.params;
    const { level } = req.query; // Get level from query params
    
    if (!['reading', 'writing', 'listening', 'speaking'].includes(skill)) {
      return res.status(400).json({ error: 'Invalid skill. Must be reading, writing, listening, or speaking.' });
    }

    // Try to get content from contentGenerator first, then fallback
    let practiceContent = null;
    const userLevel = level || req.user?.currentLevel || 'A2';
    
    try {
      practiceContent = getRandomContent(skill, userLevel);
    } catch (error) {
      console.log('ContentGenerator failed, using fallback:', error.message);
    }
    
    // If no content from generator, use fallback
    if (!practiceContent) {
      practiceContent = generateQuickPracticeContent(skill);
    }
    
    res.json({
      success: true,
      data: practiceContent
    });
  } catch (error) {
    console.error('Quick practice error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

function generateQuickPracticeContent(skill) {
  const baseContent = {
    reading: {
      title: "Quick Reading Practice",
      instructions: "Read the passage and answer the questions below.",
      timeLimit: 20, // minutes
      passage: `The Impact of Social Media on Modern Communication

Social media has revolutionized the way people communicate in the 21st century. Platforms like Facebook, Twitter, Instagram, and LinkedIn have created new opportunities for connection, but they have also introduced challenges to traditional communication methods.

One of the most significant benefits of social media is its ability to connect people across vast distances. Families separated by continents can maintain daily contact, and friends can share experiences in real-time. This has been particularly valuable during the COVID-19 pandemic, when physical distancing measures made digital communication essential.

However, social media also presents several drawbacks. The brevity of platforms like Twitter encourages superficial communication, while the curated nature of posts can create unrealistic expectations. Additionally, the constant availability of social media can lead to addiction and decreased face-to-face interaction skills.

Research suggests that while social media enhances our ability to maintain weak social ties, it may weaken our strongest relationships. The key is finding a balance between digital and traditional communication methods.`,
      questions: [
        {
          id: 1,
          question: "According to the passage, what is one benefit of social media?",
          options: [
            "It reduces face-to-face interaction",
            "It connects people across vast distances",
            "It creates unrealistic expectations",
            "It encourages superficial communication"
          ],
          correctAnswer: 1,
          explanation: "The passage states that 'One of the most significant benefits of social media is its ability to connect people across vast distances.'"
        },
        {
          id: 2,
          question: "What does the passage suggest about social media and strong relationships?",
          options: [
            "It strengthens them",
            "It has no effect on them",
            "It may weaken them",
            "It replaces them completely"
          ],
          correctAnswer: 2,
          explanation: "The passage states that 'while social media enhances our ability to maintain weak social ties, it may weaken our strongest relationships.'"
        },
        {
          id: 3,
          question: "What is the main recommendation given in the passage?",
          options: [
            "Avoid social media completely",
            "Use only traditional communication",
            "Find a balance between digital and traditional methods",
            "Focus only on weak social ties"
          ],
          correctAnswer: 2,
          explanation: "The passage concludes that 'The key is finding a balance between digital and traditional communication methods.'"
        }
      ]
    },
    writing: {
      title: "Quick Writing Practice",
      instructions: "Write a response to the task below. Aim for 150-200 words.",
      timeLimit: 30,
      task: "Some people believe that social media has a negative impact on young people's social skills. Others argue that it helps them develop new communication abilities. Discuss both views and give your own opinion.",
      taskType: "Task 2 Essay",
      wordCount: 200,
      criteria: [
        "Task Response - Address all parts of the question",
        "Coherence and Cohesion - Organize ideas logically",
        "Lexical Resource - Use varied vocabulary",
        "Grammar Range and Accuracy - Use complex structures"
      ]
    },
    listening: {
      title: "Quick Listening Practice",
      instructions: "Listen to the audio and answer the questions below.",
      timeLimit: 15,
      audioUrl: "/audio/sample-listening.mp3", // Placeholder
      questions: [
        {
          id: 1,
          question: "What is the main topic of the conversation?",
          options: [
            "University courses",
            "Job opportunities",
            "Travel plans",
            "Housing options"
          ],
          correctAnswer: 0,
          explanation: "The conversation is about university courses and academic planning."
        },
        {
          id: 2,
          question: "How many courses does the student plan to take?",
          options: [
            "Three",
            "Four",
            "Five",
            "Six"
          ],
          correctAnswer: 1,
          explanation: "The student mentions taking four courses this semester."
        }
      ]
    },
    speaking: {
      title: "Quick Speaking Practice",
      instructions: "Answer the questions below. Record your responses.",
      timeLimit: 10,
      questions: [
        {
          id: 1,
          question: "Describe your hometown. What do you like most about it?",
          preparationTime: 1,
          speakingTime: 2,
          tips: [
            "Mention location and size",
            "Describe main features",
            "Explain what you like about it",
            "Use descriptive vocabulary"
          ]
        },
        {
          id: 2,
          question: "Do you prefer to study alone or with others? Why?",
          preparationTime: 0,
          speakingTime: 1,
          tips: [
            "Give a clear preference",
            "Provide reasons for your choice",
            "Use linking words to connect ideas",
            "Give specific examples"
          ]
        }
      ]
    }
  };

  return baseContent[skill];
}

// Submit quick practice answers
router.post('/submit', auth, async (req, res) => {
  try {
    const { skill, answers, timeSpent } = req.body;
    const userId = req.user._id;

    // Safety checks
    if (!skill) {
      console.warn('❗ Missing skill in quick practice submission');
      return res.status(200).json({ 
        success: false,
        message: 'Skill is required' 
      });
    }

    if (!answers) {
      console.warn('❗ No answers provided in quick practice submission');
      return res.status(200).json({ 
        success: false,
        message: 'Please provide your answers before submitting' 
      });
    }

    // Calculate score based on answers
    const score = calculateQuickPracticeScore(skill, answers);
    const feedback = generateFeedback(skill, score);
    
    // ✅ SAVE practice session to database for tracking
    const practiceSession = await PracticeSession.create({
      userId: userId,
      skill: skill,
      bandScore: score.bandScore,
      feedback: feedback,
      timeSpent: timeSpent || 0,
      answers: answers,
      type: 'quick-practice',
      completedAt: new Date()
    });
    
    // Update user statistics (best effort)
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);
      if (user) {
        // Increment practice count
        if (!user.practiceCount) user.practiceCount = {};
        user.practiceCount[skill] = (user.practiceCount[skill] || 0) + 1;
        await user.save();
      }
    } catch (error) {
      console.error('Failed to update user practice count:', error);
    }
    
    res.json({
      success: true,
      data: {
        score,
        feedback: feedback,
        timeSpent,
        submittedAt: practiceSession.completedAt,
        practiceId: practiceSession._id
      }
    });
  } catch (error) {
    console.error('Submit quick practice error:', error);
    return res.status(200).json({ 
      success: false,
      message: 'Failed to submit practice. Please try again later.' 
    });
  }
});

function calculateQuickPracticeScore(skill, answers) {
  // Simple scoring logic - in real implementation, this would be more sophisticated
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(answer => answer.isCorrect).length;
  
  return {
    total: totalQuestions,
    correct: correctAnswers,
    percentage: Math.round((correctAnswers / totalQuestions) * 100),
    bandScore: Math.max(4, Math.min(9, 4 + (correctAnswers / totalQuestions) * 5))
  };
}

function generateFeedback(skill, score) {
  const bandScore = score.bandScore;
  
  if (bandScore >= 7) {
    return "Excellent work! You demonstrate strong understanding of this skill.";
  } else if (bandScore >= 6) {
    return "Good job! You're making solid progress. Focus on areas where you lost points.";
  } else if (bandScore >= 5) {
    return "Keep practicing! You're on the right track but need more work on this skill.";
  } else {
    return "Don't give up! This skill needs more attention. Consider reviewing the basics.";
  }
}

// Get user's practice history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const practiceSessions = await PracticeSession.find({ userId })
      .sort({ completedAt: -1 })
      .limit(50); // Last 50 practice sessions
    
    res.json({
      success: true,
      data: practiceSessions,
      total: practiceSessions.length
    });
  } catch (error) {
    console.error('Get practice history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
