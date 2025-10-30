const express = require('express');
const auth = require('../middleware/auth');
const Test = require('../models/Test');
const { getRandomContent } = require('../services/contentGenerator');

const router = express.Router();

// Helper function to format content for test
function formatContentForTest(content, skill) {
  switch (skill) {
    case 'reading':
      return {
        title: `IELTS Academic Reading - ${content.title}`,
        instructions: "Read the passage and answer the questions below. You have 60 minutes to complete this section. There are 3 passages with 40 questions total.",
        timeLimit: 60,
        passage: content.content,
        questions: content.questions,
        totalQuestions: 40
      };
    case 'writing':
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
    case 'listening':
      return {
        title: `IELTS Academic Listening - ${content.title}`,
        instructions: "Listen to the recording and answer the questions below. You will hear the recording once. There are 4 sections with 40 questions total. You have 30 minutes plus 10 minutes to transfer answers.",
        timeLimit: 30,
        audioUrl: content.audioUrl,
        questions: content.questions,
        totalQuestions: 40
      };
    case 'speaking':
      return {
        title: `IELTS Academic Speaking - Part ${content.part}`,
        instructions: "Answer the questions below clearly and in detail. The Speaking test takes 11-14 minutes and consists of 3 parts.",
        timeLimit: content.part === 1 ? 5 : content.part === 2 ? 4 : 5,
        questions: content.questions || [content.task],
        preparationTime: content.preparationTime,
        speakingTime: content.speakingTime
      };
    default:
      return content;
  }
}

// Generate IELTS test content
router.post('/generate', auth, async (req, res) => {
  try {
    const { level = 'A2', skill = 'reading' } = req.body;
    const userId = req.user._id;

    if (!['reading', 'writing', 'listening', 'speaking'].includes(skill)) {
      return res.status(400).json({ error: 'Invalid skill. Must be reading, writing, listening, or speaking.' });
    }

    // Try to get content from database first
    let testContent = null;
    const randomContent = getRandomContent(skill, level);
    
    if (randomContent) {
      // Use database content
      testContent = formatContentForTest(randomContent, skill);
    } else {
      // Try to generate with AI if database has no content
      try {
        if (process.env.OPENAI_API_KEY) {
          const OpenAI = require('openai');
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          
          // Convert CEFR level to IELTS band score for AI
          const levelToBand = {
            'A1': 3.5, 'A2': 4.5, 'B1': 5.5, 
            'B2': 6.5, 'C1': 7.5, 'C2': 8.5
          };
          const bandScore = levelToBand[level] || 6.5;
          
          const systemPrompt = `You are an IELTS question generator. Generate authentic IELTS ${skill} content for band ${bandScore} level.
          
Return JSON format with:
- For reading/listening: { "passage": "...", "questions": [{ "id": 1, "question": "...", "options": [...], "correctAnswer": 0 }] }
- For writing: { "task": "...", "wordCount": 250, "timeLimit": 40 }
- For speaking: { "questions": [...] or "task": "..." }

Keep it authentic to IELTS format.`;

          const aiResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Generate ${skill} content for level ${level} (band ${bandScore})` }
            ],
            temperature: 0.7,
            max_tokens: 1500
          });

          let aiContent;
          try {
            aiContent = JSON.parse(aiResponse.choices[0].message.content);
          } catch (parseError) {
            // If not JSON, try to extract JSON from markdown
            const content = aiResponse.choices[0].message.content;
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
            aiContent = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : null;
          }
          
          if (aiContent) {
            console.log('✅ AI Generated content for', skill, level);
            
            // Format AI content properly
            if (skill === 'reading') {
              testContent = {
                title: `IELTS Academic Reading`,
                instructions: "Read the passage and answer the questions below. You have 60 minutes to complete this section.",
                timeLimit: 60,
                passage: aiContent.passage || aiContent.content,
                questions: aiContent.questions || [],
                totalQuestions: aiContent.questions?.length || 0
              };
            } else if (skill === 'writing') {
              testContent = {
                title: `IELTS Academic Writing`,
                instructions: `You should spend about ${aiContent.timeLimit || 40} minutes on this task. Write at least ${aiContent.wordCount || 250} words.`,
                timeLimit: aiContent.timeLimit || 40,
                task: aiContent.task,
                wordCount: aiContent.wordCount || 250
              };
            } else if (skill === 'listening') {
              testContent = {
                title: `IELTS Academic Listening`,
                instructions: "Listen to the recording and answer the questions below. You have 30 minutes.",
                timeLimit: 30,
                audioUrl: aiContent.audioUrl,
                questions: aiContent.questions || []
              };
            } else if (skill === 'speaking') {
              testContent = {
                title: `IELTS Academic Speaking`,
                instructions: "Answer the questions below clearly and in detail.",
                timeLimit: 15,
                questions: aiContent.questions || [],
                preparationTime: aiContent.preparationTime,
                speakingTime: aiContent.speakingTime
              };
            }
          }
        }
      } catch (aiError) {
        console.log('⚠️ AI generation failed, using fallback:', aiError.message);
      }
      
      // Fallback to default content if AI fails
      if (!testContent) {
        testContent = generateIELTSTestContent(skill, level);
      }
    }
    
    // Create test record
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

    res.json({
      success: true,
      data: {
        testId: testRecord._id,
        skill,
        level,
        content: testContent,
        timeLimit: testContent.timeLimit
      }
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
