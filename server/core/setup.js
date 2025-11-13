const { connectCoreDB } = require('./config/db');
const IELTSItem = require('./models/IELTSItem');

/**
 * Core V3 Setup - Initialize database and seed demo data
 */
async function setupCoreV3() {
  try {
    console.log('[Core V3] Starting setup...');

    // Connect to Core V3 database
    await connectCoreDB();
    console.log('[Core V3] Database connected');

    // Create indexes
    console.log('[Core V3] Creating indexes...');
    await Promise.all([
      IELTSItem.createIndexes(),
      require('./models/UserCore').createIndexes(),
      require('./models/AssignedItem').createIndexes(),
      require('./models/UserResponse').createIndexes(),
      require('./models/UserAnalytics').createIndexes()
    ]);
    console.log('[Core V3] Indexes created');

    // Seed demo IELTS items
    const existingItems = await IELTSItem.countDocuments();
    if (existingItems === 0) {
      console.log('[Core V3] Seeding demo items...');
      
      const demoItems = [
        {
          type: 'reading',
          skill: 'reading',
          level: 'B1',
          topic: 'Environment',
          title: 'Climate Change and Its Effects',
          content: {
            passage: 'Climate change is one of the most pressing issues of our time...',
            questions: [
              {
                id: 1,
                question: 'What is the main topic of the passage?',
                type: 'multiple-choice',
                options: ['A', 'B', 'C', 'D']
              }
            ]
          },
          questions: [
            {
              id: 1,
              question: 'What is the main topic of the passage?',
              type: 'multiple-choice',
              options: ['A', 'B', 'C', 'D']
            }
          ],
          answers: { 1: 'A' },
          instructions: 'Read the passage and answer the questions.',
          timeLimit: 20,
          points: 10,
          difficulty: 5,
          isActive: true,
          tags: ['environment', 'climate', 'science']
        },
        {
          type: 'listening',
          skill: 'listening',
          level: 'B2',
          topic: 'Education',
          title: 'University Lecture on History',
          content: {
            audioUrl: '/audio/demo-lecture.mp3',
            transcript: 'Welcome to today\'s lecture on European history...',
            questions: [
              {
                id: 1,
                question: 'What period does the lecture focus on?',
                type: 'multiple-choice',
                options: ['A', 'B', 'C', 'D']
              }
            ]
          },
          questions: [
            {
              id: 1,
              question: 'What period does the lecture focus on?',
              type: 'multiple-choice',
              options: ['A', 'B', 'C', 'D']
            }
          ],
          answers: { 1: 'B' },
          instructions: 'Listen to the lecture and answer the questions.',
          timeLimit: 30,
          points: 10,
          difficulty: 6,
          isActive: true,
          tags: ['education', 'history', 'lecture']
        }
      ];

      await IELTSItem.insertMany(demoItems);
      console.log('[Core V3] Demo items seeded');
    } else {
      console.log('[Core V3] Items already exist, skipping seed');
    }

    console.log('[Core V3] CORE DATABASE READY ✔');
    return true;
  } catch (error) {
    console.error('[Core V3] Setup error:', error);
    throw error;
  }
}

module.exports = { setupCoreV3 };

