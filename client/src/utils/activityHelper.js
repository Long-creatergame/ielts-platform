// Helper functions for saving activities to localStorage

export const saveMilestoneToLocalStorage = (milestone, description) => {
  try {
    const milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
    milestones.unshift({
      id: `milestone-${Date.now()}`,
      name: milestone,
      description: description || `Achievement unlocked: ${milestone}`,
      date: new Date().toISOString()
    });
    // Keep only last 10 milestones
    const recentMilestones = milestones.slice(0, 10);
    localStorage.setItem('milestones', JSON.stringify(recentMilestones));
  } catch (error) {
    console.error('Error saving milestone:', error);
  }
};

export const saveDailyChallengeToLocalStorage = (challengeData) => {
  try {
    const challenges = JSON.parse(localStorage.getItem('dailyChallenges') || '[]');
    challenges.unshift({
      id: challengeData.id || `challenge-${Date.now()}`,
      skill: challengeData.skill,
      date: new Date().toISOString(),
      streak: challengeData.streak || 0,
      completed: true
    });
    // Keep only last 20 challenges
    const recentChallenges = challenges.slice(0, 20);
    localStorage.setItem('dailyChallenges', JSON.stringify(recentChallenges));
  } catch (error) {
    console.error('Error saving daily challenge:', error);
  }
};

export const saveTestActivityToLocalStorage = (testData) => {
  try {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    activities.unshift({
      id: testData.id || `test-${Date.now()}`,
      type: 'test',
      testType: testData.testType || 'IELTS Test',
      date: new Date().toISOString(),
      score: testData.overallScore,
      skill: testData.skill
    });
    // Keep only last 20 activities
    const recentActivities = activities.slice(0, 20);
    localStorage.setItem('activities', JSON.stringify(recentActivities));
  } catch (error) {
    console.error('Error saving test activity:', error);
  }
};

export const getAllActivities = () => {
  try {
    const milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
    const challenges = JSON.parse(localStorage.getItem('dailyChallenges') || '[]');
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    
    return {
      milestones,
      challenges,
      activities,
      all: [...milestones, ...challenges, ...activities].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      )
    };
  } catch (error) {
    console.error('Error getting activities:', error);
    return { milestones: [], challenges: [], activities: [], all: [] };
  }
};
