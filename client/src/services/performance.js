class PerformanceService {
  constructor() {
    this.metrics = {};
    this.observers = [];
    this.init();
  }

  init() {
    // Measure Core Web Vitals
    this.measureCoreWebVitals();
    
    // Measure custom metrics
    this.measureCustomMetrics();
    
    // Setup performance observers
    this.setupObservers();
  }

  // Measure Core Web Vitals
  measureCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    this.measureLCP();
    
    // First Input Delay (FID)
    this.measureFID();
    
    // Cumulative Layout Shift (CLS)
    this.measureCLS();
    
    // First Contentful Paint (FCP)
    this.measureFCP();
  }

  measureLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.metrics.lcp = {
          value: lastEntry.startTime,
          rating: this.getLCPRating(lastEntry.startTime)
        };
        
        this.reportMetric('lcp', this.metrics.lcp);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  measureFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.fid = {
            value: entry.processingStart - entry.startTime,
            rating: this.getFIDRating(entry.processingStart - entry.startTime)
          };
          
          this.reportMetric('fid', this.metrics.fid);
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  measureCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const clsEntries = [];
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        });
        
        this.metrics.cls = {
          value: clsValue,
          rating: this.getCLSRating(clsValue)
        };
        
        this.reportMetric('cls', this.metrics.cls);
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  measureFCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.fcp = {
            value: entry.startTime,
            rating: this.getFCPRating(entry.startTime)
          };
          
          this.reportMetric('fcp', this.metrics.fcp);
        });
      });
      
      observer.observe({ entryTypes: ['paint'] });
    }
  }

  // Custom metrics
  measureCustomMetrics() {
    // Page load time
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      this.metrics.loadTime = {
        value: loadTime,
        rating: this.getLoadTimeRating(loadTime)
      };
      
      this.reportMetric('loadTime', this.metrics.loadTime);
    });

    // Time to Interactive (TTI)
    this.measureTTI();
    
    // Memory usage
    this.measureMemoryUsage();
  }

  measureTTI() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'longtask') {
            this.metrics.tti = {
              value: entry.startTime,
              rating: this.getTTIRating(entry.startTime)
            };
            
            this.reportMetric('tti', this.metrics.tti);
          }
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    }
  }

  measureMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      this.metrics.memory = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
      
      this.reportMetric('memory', this.metrics.memory);
    }
  }

  // Setup performance observers
  setupObservers() {
    // Network performance
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.metrics.navigation = {
              dns: entry.domainLookupEnd - entry.domainLookupStart,
              tcp: entry.connectEnd - entry.connectStart,
              request: entry.responseStart - entry.requestStart,
              response: entry.responseEnd - entry.responseStart,
              dom: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart
            };
            
            this.reportMetric('navigation', this.metrics.navigation);
          }
        });
      });
      
      observer.observe({ entryTypes: ['navigation'] });
    }
  }

  // Rating functions
  getLCPRating(value) {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  getFIDRating(value) {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  getCLSRating(value) {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  getFCPRating(value) {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  }

  getLoadTimeRating(value) {
    if (value <= 2000) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  getTTIRating(value) {
    if (value <= 3800) return 'good';
    if (value <= 7300) return 'needs-improvement';
    return 'poor';
  }

  // Report metrics
  reportMetric(name, metric) {
    // Send to analytics
    if (window.analytics) {
      window.analytics.trackPerformance(name, metric.value);
    }
    
    // Store locally
    this.storeMetric(name, metric);
    
    // Notify observers
    this.notifyObservers(name, metric);
  }

  storeMetric(name, metric) {
    const stored = JSON.parse(localStorage.getItem('performance_metrics') || '{}');
    stored[name] = {
      ...metric,
      timestamp: Date.now()
    };
    localStorage.setItem('performance_metrics', JSON.stringify(stored));
  }

  notifyObservers(name, metric) {
    this.observers.forEach(observer => {
      if (observer.name === name || observer.name === 'all') {
        observer.callback(name, metric);
      }
    });
  }

  // Public API
  getMetrics() {
    return this.metrics;
  }

  getMetric(name) {
    return this.metrics[name];
  }

  subscribe(name, callback) {
    this.observers.push({ name, callback });
    
    return () => {
      this.observers = this.observers.filter(obs => obs.callback !== callback);
    };
  }

  // Performance optimization helpers
  optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy';
      }
      
      if (!img.decoding) {
        img.decoding = 'async';
      }
    });
  }

  preloadCriticalResources() {
    const criticalResources = [
      '/api/authentic-ielts/reading',
      '/api/authentic-ielts/listening',
      '/api/authentic-ielts/writing',
      '/api/authentic-ielts/speaking'
    ];
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  enableResourceHints() {
    // DNS prefetch for external domains
    const externalDomains = [
      'https://api.openai.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];
    
    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  }

  // Bundle optimization
  optimizeBundles() {
    // Code splitting for routes
    if (window.import) {
      // Dynamic imports for non-critical components
      const lazyComponents = [
        'TestResult',
        'Analytics',
        'Settings'
      ];
      
      lazyComponents.forEach(component => {
        window[`load${component}`] = () => import(`../components/${component}`);
      });
    }
  }
}

// Create singleton instance
const performanceService = new PerformanceService();

export default performanceService;
