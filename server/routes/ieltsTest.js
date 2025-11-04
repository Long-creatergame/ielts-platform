const express = require('express');
const auth = require('../middleware/auth');
const Test = require('../models/Test');
const { getRandomContent, generateWithAITemplate } = require('../services/contentGenerator');
const { generateAuthenticTest } = require('../utils/generateAuthenticTest');

const router = express.Router();

// Helper function to format content for test
function formatContentForTest(content, skill) {
  switch (skill) {
    case 'reading':
      // Check if content has combined 3 passages or single passage
      const numQuestions = content.questions?.length || 0;
      return {
        title: `IELTS Academic Reading`,
        instructions: numQuestions >= 30 
          ? "Read the passages and answer all questions below. You have 60 minutes to complete this section. There are 3 passages with approximately 13-14 questions each."
          : "Read the passage and answer the questions below. You have 60 minutes to complete this section.",
        timeLimit: 60,
        passage: content.content,
        questions: content.questions,
        totalQuestions: numQuestions || 40
      };
    case 'writing':
      // Check if content has tasks array (full IELTS format) or single task
      const hasTasks = content.tasks && Array.isArray(content.tasks);
      
      if (hasTasks) {
        // Full IELTS Writing: 2 tasks
        return {
          title: `IELTS Academic Writing`,
          instructions: "Complete both writing tasks below. Task 1: 20 minutes, 150 words minimum. Task 2: 40 minutes, 250 words minimum.",
          timeLimit: content.timeLimit || 60,
          tasks: content.tasks,
          criteria: [
            "Task Achievement - Address all parts of the task",
            "Coherence and Cohesion - Organize information logically",
            "Lexical Resource - Use appropriate vocabulary",
            "Grammar Range and Accuracy - Use varied sentence structures"
          ]
        };
      } else {
        // Single task format (fallback)
        return {
          title: `IELTS Academic Writing - ${content.type}`,
          instructions: `You should spend about ${content.timeLimit} minutes on this task. Write at least ${content.wordCount} words.`,
          timeLimit: content.timeLimit || (content.type.includes('Task 1') ? 20 : 40),
          task: content.task,
          taskType: content.type,
          wordCount: content.wordCount || (content.type.includes('Task 1') ? 150 : 250),
          criteria: [
            "Task Achievement - Address all parts of the task",
            "Coherence and Cohesion - Organize information logically",
            "Lexical Resource - Use appropriate vocabulary",
            "Grammar Range and Accuracy - Use varied sentence structures"
          ]
        };
      }
    case 'listening':
      // Check if content has sections (multiple audio files) or single audio
      const hasSections = content.sections && Array.isArray(content.sections);
      const listeningQuestions = hasSections 
        ? content.sections.flatMap(s => s.questions || [])
        : content.questions || [];
      
      return {
        title: `IELTS Academic Listening`,
        instructions: hasSections
          ? "Listen to the recordings and answer all questions below. You will hear each recording once. There are 4 sections with 10 questions each. You have 30 minutes plus 10 minutes to transfer answers."
          : "Listen to the recording and answer the questions below. You will hear the recording once. You have 30 minutes plus 10 minutes to transfer answers.",
        timeLimit: 30,
        audioUrl: hasSections ? content.sections[0]?.audioUrl : content.audioUrl,
        sections: hasSections ? content.sections : null,
        questions: listeningQuestions,
        totalQuestions: listeningQuestions.length || 40
      };
    case 'speaking':
      // Check if content has parts array (full IELTS format) or single part
      const hasParts = content.parts && Array.isArray(content.parts);
      
      if (hasParts) {
        // Full IELTS Speaking: 3 parts
        return {
          title: `IELTS Academic Speaking`,
          instructions: "Complete all speaking parts below. Part 1: 4-5 minutes. Part 2: 3-4 minutes (with 1 min preparation). Part 3: 4-5 minutes.",
          timeLimit: content.timeLimit || 14,
          parts: content.parts,
          criteria: [
            "Fluency and Coherence - Speak smoothly and clearly",
            "Lexical Resource - Use varied vocabulary",
            "Grammatical Range and Accuracy - Use correct grammar",
            "Pronunciation - Clear pronunciation"
          ]
        };
      } else {
        // Single part format (fallback)
        return {
          title: `IELTS Academic Speaking - Part ${content.part}`,
          instructions: "Answer the questions below clearly and in detail. The Speaking test takes 11-14 minutes and consists of 3 parts.",
          timeLimit: content.part === 1 ? 5 : content.part === 2 ? 4 : 5,
          questions: content.questions || [content.task],
          preparationTime: content.preparationTime,
          speakingTime: content.speakingTime
        };
      }
    default:
      return content;
  }
}

// Generate IELTS test content
router.post('/generate', auth, async (req, res) => {
  try {
    const { level = 'A2', skill = 'reading', mode = 'academic' } = req.body;
    const userId = req.user._id;

    if (!['reading', 'writing', 'listening', 'speaking'].includes(skill)) {
      return res.status(400).json({ error: 'Invalid skill. Must be reading, writing, listening, or speaking.' });
    }

    if (!['academic', 'general'].includes(mode)) {
      return res.status(400).json({ error: 'Invalid mode. Must be academic or general.' });
    }

    // Get authentic Cambridge blueprint structure
    let authenticBlueprint = null;
    try {
      authenticBlueprint = await generateAuthenticTest(skill, mode);
      console.log(`[Authentic Blueprint] Generated for ${skill} (${mode})`);
    } catch (blueprintError) {
      console.warn('[Authentic Blueprint] Failed to generate, using fallback:', blueprintError.message);
    }

    // Try to get content from database first
    let testContent = null;
    const randomContent = getRandomContent(skill, level);
    
    if (randomContent) {
      // Use database content
      testContent = formatContentForTest(randomContent, skill);
    } else {
      // Try to generate with AI using new template-based system
      try {
        const aiContent = await generateWithAITemplate(skill, level);
        
        if (aiContent) {
          // Format AI content using existing formatter
          testContent = formatContentForTest(aiContent, skill);
          console.log(`✅ AI Template generated content for ${skill} ${level}`);
        }
      } catch (aiError) {
        console.error('AI Template generation failed:', aiError.message);
        // Continue to fallback
      }
      
      // Fallback to default content if AI fails
      if (!testContent) {
        testContent = generateIELTSTestContent(skill, level);
        console.log(`⚠️ Using fallback content for ${skill} ${level}`);
      }
    }
    
    // Create test record (try to save, but don't fail if DB is down)
    let testId = Date.now().toString();
    try {
      const testRecord = new Test({
        userId,
        skill,
        level,
        questions: testContent.questions,
        passage: testContent.passage,
        audioUrl: testContent.audioUrl,
        timeLimit: testContent.timeLimit,
        status: 'in_progress',
        createdAt: new Date()
      });

      await testRecord.save();
      testId = testRecord._id;
    } catch (dbError) {
      // Continue with fallback ID
    }

    // Combine authentic blueprint with generated content
    const responseData = {
      testId: testId,
      skill,
      mode,
      level, // Keep for backward compatibility
      content: testContent,
      timeLimit: testContent.timeLimit
    };

    // Add authentic blueprint structure if available
    if (authenticBlueprint) {
      responseData.blueprint = {
        formType: authenticBlueprint.formType,
        structure: authenticBlueprint.structure || authenticBlueprint.tasks,
        totalQuestions: authenticBlueprint.totalQuestions,
        duration: authenticBlueprint.duration,
        version: authenticBlueprint.version
      };
    }

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Generate IELTS test error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit test answers
router.post('/submit', auth, async (req, res) => {
  try {
    const { testId, answers, timeSpent } = req.body;
    const userId = req.user._id;

    if (!testId || !answers) {
      return res.status(400).json({ error: 'Test ID and answers are required' });
    }

    // Find test record
    const test = await Test.findById(testId);
    if (!test || test.userId.toString() !== userId.toString()) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Calculate score
    const score = calculateIELTSScore(test, answers);
    
    // Update test record
    test.answers = answers;
    test.score = score;
    test.status = 'completed';
    test.completedAt = new Date();
    test.timeSpent = timeSpent;

    await test.save();

    // Update user statistics
    await updateUserStatistics(userId, score);

    res.json({
      success: true,
      data: {
        testId: test._id,
        score,
        feedback: generateTestFeedback(score),
        completedAt: test.completedAt
      }
    });
  } catch (error) {
    console.error('Submit IELTS test error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get test result
router.get('/result/:testId', auth, async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user._id;

    const test = await Test.findById(testId);
    if (!test || test.userId.toString() !== userId.toString()) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json({
      success: true,
      data: {
        testId: test._id,
        skill: test.skill,
        level: test.level,
        score: test.score,
        answers: test.answers,
        completedAt: test.completedAt,
        timeSpent: test.timeSpent
      }
    });
  } catch (error) {
    console.error('Get test result error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

function generateIELTSTestContent(skill, level) {
  const baseContent = {
    reading: {
      title: "IELTS Academic Reading",
      instructions: "Read the passages and answer questions 1-40. You have 60 minutes to complete this section. There are 3 passages with approximately 13-14 questions each.",
      timeLimit: 60,
      passage: `The Future of Renewable Energy

As the world grapples with climate change and the need for sustainable energy sources, renewable energy technologies have emerged as a crucial solution. Solar, wind, hydroelectric, and geothermal power are no longer experimental technologies but are becoming mainstream energy sources in many countries.

Solar energy has seen the most dramatic growth in recent years. The cost of solar panels has dropped by over 80% since 2010, making solar power competitive with fossil fuels in many markets. Countries like Germany, China, and the United States have invested heavily in solar infrastructure, with some regions now generating more electricity from solar than from traditional sources during peak hours.

Wind energy has also experienced significant expansion, particularly in offshore installations. Modern wind turbines are more efficient and can generate electricity even in lower wind speeds. Countries with extensive coastlines, such as the United Kingdom and Denmark, have become leaders in offshore wind development.

However, renewable energy faces several challenges. The intermittent nature of solar and wind power requires sophisticated energy storage solutions and grid management systems. Battery technology has improved dramatically, but large-scale storage remains expensive and technically complex.

Another challenge is the need for significant infrastructure investment. While renewable energy sources have low operating costs once installed, the initial capital investment is substantial. Governments and private investors must commit to long-term projects that may not show returns for years.

Despite these challenges, the trend toward renewable energy is accelerating. Many countries have set ambitious targets for renewable energy adoption, and technological advances continue to reduce costs and improve efficiency. The transition to a renewable energy future is not just environmentally necessary but increasingly economically viable.`,
      questions: [
        {
          id: 1,
          question: "According to the passage, what has happened to the cost of solar panels since 2010?",
          type: "multiple_choice",
          options: [
            "It has increased by 80%",
            "It has decreased by 80%",
            "It has remained stable",
            "It has fluctuated significantly"
          ],
          correctAnswer: 1
        },
        {
          id: 2,
          question: "Which countries are mentioned as leaders in offshore wind development?",
          type: "multiple_choice",
          options: [
            "Germany and China",
            "United States and Germany",
            "United Kingdom and Denmark",
            "China and United States"
          ],
          correctAnswer: 2
        },
        {
          id: 3,
          question: "What is the main challenge mentioned regarding renewable energy?",
          type: "multiple_choice",
          options: [
            "High operating costs",
            "Intermittent nature",
            "Lack of government support",
            "Technological limitations"
          ],
          correctAnswer: 1
        }
      ]
    },
    writing: {
      tasks: [
        {
          taskNumber: 1,
          title: "IELTS Academic Writing Task 1",
          instructions: "You should spend about 20 minutes on this task. Write at least 150 words.",
          timeLimit: 20,
          task: "The chart below shows the percentage of households in different income groups who owned cars in a particular country between 1995 and 2015. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
          wordCount: 150
        },
        {
          taskNumber: 2,
          title: "IELTS Academic Writing Task 2",
          instructions: "You should spend about 40 minutes on this task. Write at least 250 words.",
          timeLimit: 40,
          task: "Some people believe that technology has made our lives easier, while others think it has made life more complicated. Discuss both views and give your own opinion.",
          wordCount: 250
        }
      ],
      totalTime: 60,
      criteria: [
        "Task Achievement - Address all parts of the task",
        "Coherence and Cohesion - Organize information logically",
        "Lexical Resource - Use appropriate vocabulary",
        "Grammar Range and Accuracy - Use varied sentence structures"
      ]
    },
    listening: {
      title: "IELTS Academic Listening",
      instructions: "Listen to the recordings and answer questions 1-40. You will hear the recordings once. There are 4 sections with 10 questions each. You have 30 minutes plus 10 minutes to transfer answers.",
      timeLimit: 30,
      sections: [
        {
          section: 1,
          title: "Section 1",
          audioUrl: "/api/audio/ielts-listening-sample-1.mp3",
          questions: Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            question: `Question ${i + 1}`,
            type: "multiple_choice",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: Math.floor(Math.random() * 4)
          }))
        },
        {
          section: 2,
          title: "Section 2",
          audioUrl: "/api/audio/ielts-listening-sample-2.mp3",
          questions: Array.from({ length: 10 }, (_, i) => ({
            id: i + 11,
            question: `Question ${i + 11}`,
            type: "multiple_choice",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: Math.floor(Math.random() * 4)
          }))
        },
        {
          section: 3,
          title: "Section 3",
          audioUrl: "/api/audio/ielts-listening-sample-1.mp3",
          questions: Array.from({ length: 10 }, (_, i) => ({
            id: i + 21,
            question: `Question ${i + 21}`,
            type: "multiple_choice",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: Math.floor(Math.random() * 4)
          }))
        },
        {
          section: 4,
          title: "Section 4",
          audioUrl: "/api/audio/ielts-listening-sample-2.mp3",
          questions: Array.from({ length: 10 }, (_, i) => ({
            id: i + 31,
            question: `Question ${i + 31}`,
            type: "multiple_choice",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: Math.floor(Math.random() * 4)
          }))
        }
      ],
      totalQuestions: 40
    },
    speaking: {
      title: "IELTS Academic Speaking",
      instructions: "This speaking test has three parts and takes 11-14 minutes. Answer all questions clearly and in detail.",
      totalTime: 11,
      parts: [
        {
          part: 1,
          title: "Introduction and Interview",
          timeLimit: 4,
          questions: [
            "What is your full name?",
            "Where are you from?",
            "Do you work or study?",
            "What do you like about your job/studies?"
          ]
        },
        {
          part: 2,
          title: "Individual Long Turn",
          timeLimit: 4,
          task: "Describe a memorable journey you have taken. You should say: where you went, when you went there, who you went with, what you did there, and explain why this journey was memorable for you.",
          preparationTime: 1,
          speakingTime: 2
        },
        {
          part: 3,
          title: "Two-way Discussion",
          timeLimit: 5,
          questions: [
            "What are the benefits of traveling?",
            "How has technology changed the way people travel?",
            "Do you think travel will become more or less popular in the future?"
          ]
        }
      ]
    }
  };

  return baseContent[skill];
}

function calculateIELTSScore(test, answers) {
  // Simple scoring logic - in real implementation, this would be more sophisticated
  const totalQuestions = test.questions ? test.questions.length : 1;
  const correctAnswers = answers.filter(answer => answer.isCorrect).length;
  
  const percentage = (correctAnswers / totalQuestions) * 100;
  const bandScore = Math.max(4, Math.min(9, 4 + (percentage / 100) * 5));
  
  return {
    total: totalQuestions,
    correct: correctAnswers,
    percentage: Math.round(percentage),
    bandScore: Math.round(bandScore * 10) / 10
  };
}

function generateTestFeedback(score) {
  const bandScore = score.bandScore;
  
  if (bandScore >= 7) {
    return "Excellent performance! You demonstrate strong proficiency in this skill.";
  } else if (bandScore >= 6) {
    return "Good work! You're making solid progress. Focus on areas where you can improve.";
  } else if (bandScore >= 5) {
    return "Keep practicing! You're on the right track but need more work on this skill.";
  } else {
    return "Don't give up! This skill needs more attention. Consider reviewing the fundamentals.";
  }
}

async function updateUserStatistics(userId, score) {
  try {
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (user) {
      user.totalTests = (user.totalTests || 0) + 1;
      
      // Update average band score
      const currentAverage = user.averageBand || 0;
      const totalTests = user.totalTests;
      user.averageBand = ((currentAverage * (totalTests - 1)) + score.bandScore) / totalTests;
      
      await user.save();
    }
  } catch (error) {
    console.error('Update user statistics error:', error);
  }
}

module.exports = router;
