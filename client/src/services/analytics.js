class AnalyticsService {
  constructor() {
    this.apiBase = import.meta.env.VITE_API_BASE_URL;
    this.userId = null;
    this.sessionId = this.generateSessionId();
    this.events = [];
    this.isOnline = navigator.onLine;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEvents();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  setUserId(userId) {
    this.userId = userId;
  }

  // Track user actions
  track(event, data = {}) {
    const eventData = {
      event,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      data
    };

    this.events.push(eventData);
    
    // Send immediately if online, otherwise queue
    if (this.isOnline) {
      this.sendEvent(eventData);
    }
  }

  // Send single event
  async sendEvent(eventData) {
    try {
      await fetch(`${this.apiBase}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventData)
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }

  // Flush queued events when back online
  async flushEvents() {
    if (!this.isOnline || this.events.length === 0) return;

    try {
      await fetch(`${this.apiBase}/api/analytics/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ events: this.events })
      });
      
      this.events = [];
    } catch (error) {
      console.error('Analytics batch send failed:', error);
    }
  }

  // Specific tracking methods
  trackPageView(page) {
    this.track('page_view', { page });
  }

  trackTestStart(skill, level) {
    this.track('test_start', { skill, level });
  }

  trackTestComplete(skill, score, timeSpent) {
    this.track('test_complete', { skill, score, timeSpent });
  }

  trackQuestionAnswer(skill, questionId, isCorrect, timeSpent) {
    this.track('question_answer', { skill, questionId, isCorrect, timeSpent });
  }

  trackAudioPlay(audioId, duration) {
    this.track('audio_play', { audioId, duration });
  }

  trackVoiceRecording(skill, duration) {
    this.track('voice_recording', { skill, duration });
  }

  trackUserEngagement(action, data) {
    this.track('user_engagement', { action, ...data });
  }

  trackError(error, context) {
    this.track('error', { error: error.message, stack: error.stack, context });
  }

  trackPerformance(metric, value) {
    this.track('performance', { metric, value });
  }
}

// Create singleton instance
const analytics = new AnalyticsService();

export default analytics;
