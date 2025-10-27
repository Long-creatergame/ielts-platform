const OpenAI = require('openai');
const AIPersonalization = require('../models/AIPersonalization');
const Test = require('../models/Test');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
});

class AIPersonalizationService {
  
  // Initialize AI personalization for a new user
  static async initializePersonalization(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Check if personalization already exists
      let personalization = await AIPersonalization.findOne({ userId });
      
      if (!personalization) {
        // Create initial personalization profile
        personalization = new AIPersonalization({
          userId,
          learningStyle: 'visual', // Default, will be updated by AI
          preferredDifficulty: 'adaptive',
          studyTimePreference: 'evening',
          aiProfile: {
            strengths: [],
            weaknesses: [],
            learningPatterns: {
              bestPerformingTopics: [],
              challengingTopics: [],
              optimalQuestionTypes: [],
              timeSpentPerSkill: {
                reading: 0,
                writing: 0,
                listening: 0,
                speaking: 0
              }
            }
          },
          recommendations: [],
          progressHistory: [],
          adaptiveSettings: {
            questionDifficultyAdjustment: 'moderate',
            personalizedPrompts: {
              motivationalMessages: [],
              studyReminders: [],
              progressCelebrations: []
            },
            aiCoaching: {
              enabled: true,
              frequency: 'weekly',
              lastCoachingSession: null,
              coachingStyle: 'encouraging'
            }
          },
          contentPreferences: {
            preferredQuestionTypes: [],
            preferredTopics: [],
            preferredDifficultyLevel: user.currentLevel,
            preferredTimeOfDay: 'evening',
            preferredStudyDuration: 30
          },
          learningAnalytics: {
            totalStudyTime: 0,
            averageSessionLength: 0,
            consistencyScore: 0,
            improvementRate: 0,
            predictedBandScore: user.targetBand,
            confidenceLevel: 0.5,
            lastAnalyzed: new Date()
          },
          personalizationStatus: {
            isInitialized: true,
            lastUpdated: new Date(),
            version: '1.0',
            aiModelVersion: 'gpt-4o-mini'
          }
        });

        await personalization.save();
      }

      return personalization;
    } catch (error) {
      console.error('Error initializing AI personalization:', error);
      throw error;
    }
  }

  // Analyze user's learning patterns and update AI profile
  static async analyzeLearningPatterns(userId) {
    try {
      const personalization = await AIPersonalization.findOne({ userId });
      if (!personalization) {
        await this.initializePersonalization(userId);
        return;
      }

      // Get user's test history
      const tests = await Test.find({ userId })
        .sort({ createdAt: -1 })
        .limit(20);

      if (tests.length === 0) {
        console.log('No test data available for analysis');
        return;
      }

      // Prepare data for AI analysis
      const testData = tests.map(test => ({
        skill: test.skill || 'general',
        score: test.totalBand || 0,
        date: test.createdAt,
        answers: test.answers,
        aiFeedback: test.aiFeedback
      }));

      const user = await User.findById(userId);
      const userContext = {
        name: user.name,
        goal: user.goal,
        targetBand: user.targetBand,
        currentLevel: user.currentLevel,
        totalTests: user.totalTests,
        averageBand: user.averageBand
      };

      // AI Analysis Prompt
      const analysisPrompt = `
You are an AI learning analyst specializing in IELTS preparation. Analyze this student's learning data and provide personalized insights.

Student Context:
- Name: ${userContext.name}
- Goal: ${userContext.goal}
- Target Band: ${userContext.targetBand}
- Current Level: ${userContext.currentLevel}
- Total Tests: ${userContext.totalTests}
- Average Band: ${userContext.averageBand}

Test History (last 20 tests):
${JSON.stringify(testData, null, 2)}

Please provide a comprehensive analysis in this exact JSON format:
{
  "learningStyle": "visual|auditory|kinesthetic|reading",
  "strengths": [
    {
      "skill": "reading|writing|listening|speaking",
      "level": 6.5,
      "confidence": 0.8,
      "reasoning": "Brief explanation"
    }
  ],
  "weaknesses": [
    {
      "skill": "reading|writing|listening|speaking",
      "level": 5.0,
      "priority": "high|medium|low",
      "improvementAreas": ["specific areas to improve"],
      "reasoning": "Brief explanation"
    }
  ],
  "learningPatterns": {
    "bestPerformingTopics": ["topic1", "topic2"],
    "challengingTopics": ["topic1", "topic2"],
    "optimalQuestionTypes": ["type1", "type2"],
    "timeSpentPerSkill": {
      "reading": 120,
      "writing": 90,
      "listening": 60,
      "speaking": 45
    }
  },
  "recommendations": [
    {
      "type": "practice|study|review|challenge",
      "skill": "reading|writing|listening|speaking",
      "priority": "high|medium|low",
      "title": "Recommendation title",
      "description": "Detailed description",
      "actionItems": ["action1", "action2"],
      "estimatedTime": 30,
      "difficulty": "easy|medium|hard"
    }
  ],
  "personalizedPrompts": {
    "motivationalMessages": ["message1", "message2"],
    "studyReminders": ["reminder1", "reminder2"],
    "progressCelebrations": ["celebration1", "celebration2"]
  },
  "predictedBandScore": 6.5,
  "confidenceLevel": 0.8
}`;

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert IELTS learning analyst. Always respond with valid JSON format as requested.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const aiResponse = completion.choices[0].message.content;
      
      try {
        const analysis = JSON.parse(aiResponse);
        
        // Update personalization with AI analysis
        personalization.learningStyle = analysis.learningStyle;
        personalization.aiProfile.strengths = analysis.strengths;
        personalization.aiProfile.weaknesses = analysis.weaknesses;
        personalization.aiProfile.learningPatterns = analysis.learningPatterns;
        personalization.recommendations = analysis.recommendations.map(rec => ({
          ...rec,
          createdAt: new Date(),
          status: 'pending'
        }));
        personalization.adaptiveSettings.personalizedPrompts = analysis.personalizedPrompts;
        personalization.learningAnalytics.predictedBandScore = analysis.predictedBandScore;
        personalization.learningAnalytics.confidenceLevel = analysis.confidenceLevel;
        personalization.learningAnalytics.lastAnalyzed = new Date();
        personalization.personalizationStatus.lastUpdated = new Date();

        await personalization.save();
        
        console.log('✅ AI personalization analysis completed for user:', userId);
        return personalization;
        
      } catch (parseError) {
        console.error('Error parsing AI analysis response:', parseError);
        console.error('Raw AI response:', aiResponse);
        throw new Error('Failed to parse AI analysis response');
      }

    } catch (error) {
      console.error('Error analyzing learning patterns:', error);
      throw error;
    }
  }

  // Get personalized recommendations for user
  static async getPersonalizedRecommendations(userId) {
    try {
      let personalization = await AIPersonalization.findOne({ userId });
      
      if (!personalization) {
        personalization = await this.initializePersonalization(userId);
      }

      // If no recommendations or old recommendations, generate new ones
      if (personalization.recommendations.length === 0 || 
          personalization.personalizationStatus.lastUpdated < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        await this.analyzeLearningPatterns(userId);
        personalization = await AIPersonalization.findOne({ userId });
      }

      return personalization.recommendations.filter(rec => rec.status === 'pending');
      
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      throw error;
    }
  }

  // Update user progress and trigger AI analysis
  static async updateProgress(userId, progressData) {
    try {
      let personalization = await AIPersonalization.findOne({ userId });
      
      if (!personalization) {
        personalization = await this.initializePersonalization(userId);
      }

      // Add progress to history
      personalization.progressHistory.push({
        date: new Date(),
        skill: progressData.skill,
        score: progressData.score,
        timeSpent: progressData.timeSpent,
        questionsAnswered: progressData.questionsAnswered,
        accuracy: progressData.accuracy,
        improvement: progressData.improvement
      });

      // Update learning analytics
      personalization.learningAnalytics.totalStudyTime += progressData.timeSpent;
      personalization.learningAnalytics.averageSessionLength = 
        personalization.learningAnalytics.totalStudyTime / personalization.progressHistory.length;

      // Update time spent per skill
      if (personalization.aiProfile.learningPatterns.timeSpentPerSkill[progressData.skill]) {
        personalization.aiProfile.learningPatterns.timeSpentPerSkill[progressData.skill] += progressData.timeSpent;
      }

      await personalization.save();

      // Trigger AI analysis if enough new data
      if (personalization.progressHistory.length % 5 === 0) {
        await this.analyzeLearningPatterns(userId);
      }

      return personalization;
      
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  // Get personalized study plan
  static async getPersonalizedStudyPlan(userId) {
    try {
      const personalization = await AIPersonalization.findOne({ userId });
      
      if (!personalization) {
        await this.initializePersonalization(userId);
        return this.getPersonalizedStudyPlan(userId);
      }

      const user = await User.findById(userId);
      
      // Generate personalized study plan based on AI analysis
      const studyPlan = {
        dailyGoal: {
          timeSpent: personalization.contentPreferences.preferredStudyDuration,
          questions: 10,
          skills: ['reading', 'writing', 'listening', 'speaking']
        },
        weeklyGoal: {
          tests: 2,
          focusSkill: personalization.aiProfile.weaknesses[0]?.skill || 'writing',
          targetImprovement: 0.5
        },
        recommendations: personalization.recommendations.slice(0, 5),
        motivationalMessage: personalization.adaptiveSettings.personalizedPrompts.motivationalMessages[0] || 
          "Keep up the great work! Every practice session brings you closer to your IELTS goal."
      };

      return studyPlan;
      
    } catch (error) {
      console.error('Error getting personalized study plan:', error);
      throw error;
    }
  }
}

module.exports = AIPersonalizationService;
