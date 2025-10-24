const Test = require('../models/Test');

class RecommendationService {
  constructor() {
    this.skillWeights = {
      reading: 0.25,
      listening: 0.25,
      writing: 0.25,
      speaking: 0.25
    };
  }

  async generateRecommendations(userId) {
    try {
      // Get user's test history
      const userTests = await Test.find({ userId }).sort({ createdAt: -1 }).limit(10);
      
      if (userTests.length === 0) {
        return this.getDefaultRecommendations();
      }

      // Analyze performance
      const analysis = this.analyzePerformance(userTests);
      
      // Generate personalized recommendations
      const recommendations = this.createRecommendations(analysis);
      
      return {
        success: true,
        data: recommendations,
        analysis: analysis
      };
    } catch (error) {
      console.error('Recommendation Error:', error);
      return this.getDefaultRecommendations();
    }
  }

  analyzePerformance(tests) {
    const skillScores = {
      reading: [],
      listening: [],
      writing: [],
      speaking: []
    };

    // Group scores by skill
    tests.forEach(test => {
      if (test.skill && test.bandScore) {
        skillScores[test.skill].push(test.bandScore);
      }
    });

    // Calculate averages and trends
    const analysis = {};
    Object.keys(skillScores).forEach(skill => {
      const scores = skillScores[skill];
      if (scores.length > 0) {
        analysis[skill] = {
          average: this.calculateAverage(scores),
          trend: this.calculateTrend(scores),
          count: scores.length,
          latest: scores[0],
          improvement: this.calculateImprovement(scores)
        };
      }
    });

    // Identify weakest skill
    const weakestSkill = this.identifyWeakestSkill(analysis);
    
    // Calculate overall progress
    const overallProgress = this.calculateOverallProgress(analysis);

    return {
      skillAnalysis: analysis,
      weakestSkill: weakestSkill,
      overallProgress: overallProgress,
      totalTests: tests.length
    };
  }

  createRecommendations(analysis) {
    const recommendations = [];

    // Skill-specific recommendations
    Object.keys(analysis.skillAnalysis).forEach(skill => {
      const skillData = analysis.skillAnalysis[skill];
      if (skillData.average < 6.0) {
        recommendations.push({
          type: 'skill_improvement',
          priority: 'high',
          skill: skill,
          title: `Improve ${skill.charAt(0).toUpperCase() + skill.slice(1)} Skills`,
          description: `Your ${skill} score is ${skillData.average.toFixed(1)}. Focus on this area to boost your overall band score.`,
          action: `Practice ${skill} exercises`,
          estimatedTime: '30 minutes daily',
          resources: this.getSkillResources(skill)
        });
      }
    });

    // Overall progress recommendations
    if (analysis.overallProgress < 6.5) {
      recommendations.push({
        type: 'overall_improvement',
        priority: 'medium',
        title: 'Boost Overall Band Score',
        description: `Your current average is ${analysis.overallProgress.toFixed(1)}. Focus on consistent practice to reach your target.`,
        action: 'Take full practice tests',
        estimatedTime: '2 hours weekly',
        resources: ['Full IELTS Practice Tests', 'Mock Exams']
      });
    }

    // Weakest skill focus
    if (analysis.weakestSkill) {
      recommendations.push({
        type: 'weakest_skill',
        priority: 'high',
        skill: analysis.weakestSkill,
        title: `Focus on ${analysis.weakestSkill.charAt(0).toUpperCase() + analysis.weakestSkill.slice(1)}`,
        description: `This is your weakest area. Dedicated practice here will have the biggest impact on your overall score.`,
        action: `Intensive ${analysis.weakestSkill} practice`,
        estimatedTime: '45 minutes daily',
        resources: this.getSkillResources(analysis.weakestSkill)
      });
    }

    // Motivation and encouragement
    if (analysis.totalTests > 5) {
      recommendations.push({
        type: 'motivation',
        priority: 'low',
        title: 'Keep Up the Great Work!',
        description: `You've completed ${analysis.totalTests} tests. Your dedication is paying off!`,
        action: 'Continue regular practice',
        estimatedTime: 'Maintain current schedule',
        resources: ['Progress tracking', 'Goal setting']
      });
    }

    return recommendations;
  }

  getSkillResources(skill) {
    const resources = {
      reading: [
        'Academic reading passages',
        'Skimming and scanning techniques',
        'Vocabulary building exercises',
        'Time management practice'
      ],
      listening: [
        'Audio practice materials',
        'Note-taking techniques',
        'Accent recognition practice',
        'Listening comprehension exercises'
      ],
      writing: [
        'Essay structure templates',
        'Task 1 and Task 2 practice',
        'Grammar and vocabulary exercises',
        'Sample essays and feedback'
      ],
      speaking: [
        'Speaking practice topics',
        'Fluency exercises',
        'Pronunciation practice',
        'Mock speaking tests'
      ]
    };

    return resources[skill] || [];
  }

  calculateAverage(scores) {
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  calculateTrend(scores) {
    if (scores.length < 2) return 'stable';
    
    const recent = scores.slice(0, Math.ceil(scores.length / 2));
    const older = scores.slice(Math.ceil(scores.length / 2));
    
    const recentAvg = this.calculateAverage(recent);
    const olderAvg = this.calculateAverage(older);
    
    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
  }

  calculateImprovement(scores) {
    if (scores.length < 2) return 0;
    
    const latest = scores[0];
    const earliest = scores[scores.length - 1];
    
    return latest - earliest;
  }

  identifyWeakestSkill(analysis) {
    let weakestSkill = null;
    let lowestScore = 10;
    
    Object.keys(analysis).forEach(skill => {
      if (analysis[skill].average < lowestScore) {
        lowestScore = analysis[skill].average;
        weakestSkill = skill;
      }
    });
    
    return weakestSkill;
  }

  calculateOverallProgress(analysis) {
    const scores = Object.values(analysis).map(skill => skill.average);
    return this.calculateAverage(scores);
  }

  getDefaultRecommendations() {
    return {
      success: true,
      data: [
        {
          type: 'welcome',
          priority: 'high',
          title: 'Welcome to IELTS Platform!',
          description: 'Start your first test to get personalized recommendations based on your performance.',
          action: 'Take your first test',
          estimatedTime: '30 minutes',
          resources: ['Quick Assessment', 'Skill Practice']
        },
        {
          type: 'exploration',
          priority: 'medium',
          title: 'Explore Our Features',
          description: 'Discover AI-powered practice, progress tracking, and personalized coaching.',
          action: 'Browse features',
          estimatedTime: '10 minutes',
          resources: ['Dashboard', 'Help Center']
        }
      ],
      analysis: null
    };
  }
}

module.exports = new RecommendationService();
