/**
 * AI Coach Personality Configuration
 * Defines Cambridge-style tone and emotional intelligence for AI feedback
 */

const coachPersonality = {
  // Tone variations by user performance
  tones: {
    encouraging: {
      verbs: ['Keep going!', 'You\'re on the right track!', 'Don\'t give up!'],
      phrases: [
        'Every test is a stepping stone',
        'Progress comes with practice',
        'You\'re building strong foundations'
      ]
    },
    celebrating: {
      verbs: ['Congratulations!', 'Outstanding work!', 'You nailed it!'],
      phrases: [
        'You\'ve reached a new milestone',
        'This is significant progress',
        'Your hard work is paying off'
      ]
    },
    guiding: {
      verbs: ['Let\'s focus on...', 'Consider working on...', 'Here\'s a strategy...'],
      phrases: [
        'Cambridge-style precision here',
        'Try this technique next time',
        'This approach will elevate your score'
      ]
    },
    supporting: {
      verbs: ['Take your time', 'It\'s okay to struggle', 'Let\'s break it down'],
      phrases: [
        'Every learner has their pace',
        'Understanding takes time',
        'You\'re making progress, even if it feels slow'
      ]
    }
  },

  // Level-specific coaching styles
  levelStyles: {
    'A1': {
      tone: 'supportive',
      complexity: 'simple',
      focus: 'Foundations are everything. You\'re building basics that will carry you forward.',
      example: 'Great effort! Try writing shorter sentences to build confidence.'
    },
    'A2': {
      tone: 'encouraging',
      complexity: 'simple',
      focus: 'Keep practicing consistently. Progress at this level is steady.',
      example: 'Good work! Let\'s add more connecting words to make your writing flow.'
    },
    'B1': {
      tone: 'guiding',
      complexity: 'moderate',
      focus: 'You\'re developing solid skills. Now let\'s refine them.',
      example: 'Solid effort! Focus on varying your sentence structures for a higher band.'
    },
    'B2': {
      tone: 'celebrating',
      complexity: 'moderate',
      focus: 'Strong competence. Polish your advanced techniques now.',
      example: 'Excellent! You\'re using complex structures well. Push for more sophisticated vocabulary.'
    },
    'C1': {
      tone: 'celebrating',
      complexity: 'advanced',
      focus: 'Professional-level skills. Perfect the nuances.',
      example: 'Outstanding! Your language is sophisticated. Fine-tune subtle grammatical accuracy.'
    },
    'C2': {
      tone: 'celebrating',
      complexity: 'expert',
      focus: 'Master-level performance. Maintain excellence.',
      example: 'Masterful work! You\'re achieving expert-level proficiency. Keep refining.'
    }
  },

  /**
   * Generate personalized greeting
   */
  generateGreeting: function(userName, userLevel, lastSession) {
    const style = this.levelStyles[userLevel] || this.levelStyles['B1'];
    const greetings = [
      `Welcome back, ${userName}! Let's continue your IELTS journey.`,
      `Hi ${userName}! Ready to push your ${userLevel} skills further?`,
      `Great to see you again, ${userName}! Let's build on your progress.`
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  },

  /**
   * Generate post-test celebration message
   */
  generateCelebration: function(score, improvement, skill) {
    if (improvement > 1.0) {
      return {
        type: 'major_breakthrough',
        message: `🎉 BREAKTHROUGH! You just improved by ${improvement.toFixed(1)} bands in ${skill}! This is outstanding progress. Your dedication is showing real results.`,
        color: 'bg-gradient-to-r from-yellow-400 to-orange-500'
      };
    } else if (improvement > 0.5) {
      return {
        type: 'significant_improvement',
        message: `🌟 Excellent work! You've improved by ${improvement.toFixed(1)} bands. Keep this momentum—you're on fire!`,
        color: 'bg-gradient-to-r from-green-400 to-emerald-600'
      };
    } else if (score >= 7.5) {
      return {
        type: 'excellence',
        message: `🏆 Outstanding! You're achieving excellence-level scores. Cambridge would be impressed.`,
        color: 'bg-gradient-to-r from-blue-500 to-purple-600'
      };
    } else if (improvement > 0) {
      return {
        type: 'progress',
        message: `👏 Nice improvement! Up by ${improvement.toFixed(1)} bands. Every step counts.`,
        color: 'bg-gradient-to-r from-indigo-400 to-blue-500'
      };
    }
    return null;
  },

  /**
   * Generate constructive feedback tone
   */
  generateFeedback: function(errorType, userLevel) {
    const style = this.levelStyles[userLevel] || this.levelStyles['B1'];
    
    const feedbackTemplates = {
      grammar: {
        A1: `That's a solid attempt! Let's remember: use "were" here because we're talking about multiple things. You're learning!`,
        A2: `Good thinking! Just adjust to "were" for plural subjects. You're getting the hang of this.`,
        B1: `Close! The verb needs to match the plural subject. Try "were" instead—this refines your accuracy.`,
        B2: `Nearly there. Use "were" for plural subjects to add precision to your writing.`,
        C1: `Subtle point: "were" is more appropriate for plural subjects here. Excellent overall.`,
        C2: `Fine detail: maintain subject-verb agreement with plural nouns. Top-tier work.`
      },
      vocabulary: {
        A1: `Good word choice! Cambridge likes varied vocabulary. Try "excellent" instead of "good"—it's stronger.`,
        A2: `Nice! To show Cambridge you have range, use "significant" instead of "big." This bumps your score.`,
        B1: `Strong vocabulary! Swap "big" for "substantial" to demonstrate more advanced lexical resource.`,
        B2: `Sophisticated language! Consider "substantial" or "considerable" for more nuanced expression.`,
        C1: `Refined vocabulary! Opt for "considerable" to showcase academic precision.`,
        C2: `Exceptional lexical range! "Considerable" adds scholarly nuance.`
      },
      coherence: {
        A1: `Your ideas are clear! Add "However" at the start of the next sentence to connect them better.`,
        A2: `Good flow! Try adding "Therefore" to link your ideas and show logical thinking.`,
        B1: `Solid structure! Use "Furthermore" or "Moreover" to add coherence and elevate your band.`,
        B2: `Excellent organization! Integrate "Nonetheless" or "Consequently" for sophisticated linking.`,
        C1: `Sophisticated flow! Consider "Notwithstanding" for advanced discourse markers.`,
        C2: `Masterful coherence! Add "Pertinently" for nuanced academic transitions.`
      },
      task: {
        A1: `You covered the main points! Cambridge wants more detail—add one more example to strengthen your answer.`,
        A2: `Good coverage! Expand with concrete examples to fully address the task.`,
        B1: `Strong response! Add a counterargument to demonstrate thorough task completion.`,
        B2: `Comprehensive coverage! Add a nuanced perspective to show mastery of task requirements.`,
        C1: `Excellent analysis! Integrate sophisticated examples to show exceptional task achievement.`,
        C2: `Masterful treatment! Add scholarly depth to demonstrate elite task response.`
      }
    };

    const templates = feedbackTemplates[errorType] || feedbackTemplates['grammar'];
    return templates[userLevel] || templates['B1'];
  },

  /**
   * Generate motivational closing
   */
  generateClosing: function(userLevel, testCount) {
    const style = this.levelStyles[userLevel] || this.levelStyles['B1'];
    
    const closings = [
      `Keep practicing. You're building something real.`,
      `Every test teaches you something new. You're growing.`,
      `Progress isn't always visible, but it's happening. Trust the process.`,
      `Cambridge sees improvement in consistency. You've got this.`,
      `Your journey is unique. Keep moving forward at your pace.`
    ];
    
    return closings[Math.floor(Math.random() * closings.length)];
  },

  /**
   * Generate weekly summary message
   */
  generateWeeklySummary: function(testsCompleted, avgImprovement, strongestSkill, weakestSkill) {
    if (testsCompleted === 0) {
      return {
        title: 'Start Your Journey',
        message: 'Ready to take your first IELTS test? Let\'s see where you are and how we can help you grow.',
        action: 'Take Your First Test'
      };
    }

    if (avgImprovement > 0.5) {
      return {
        title: 'Excellent Week!',
        message: `You completed ${testsCompleted} tests and improved by ${avgImprovement.toFixed(1)} bands on average. Your ${strongestSkill} is getting stronger!`,
        action: 'Keep the Momentum',
        mood: 'celebrating'
      };
    }

    if (avgImprovement > 0) {
      return {
        title: 'Steady Progress',
        message: `You completed ${testsCompleted} tests. Your ${strongestSkill} is showing improvement. Let\'s work on ${weakestSkill} next.`,
        action: 'Focus on Weaknesses',
        mood: 'encouraging'
      };
    }

    return {
      title: 'Consistency Matters',
      message: `You completed ${testsCompleted} tests this week. Keep practicing—progress takes time.`,
      action: 'Stay Committed',
      mood: 'supporting'
    };
  }
};

module.exports = coachPersonality;

