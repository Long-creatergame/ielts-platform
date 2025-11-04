/**
 * Phase Integration Protocol Validation Script
 * Comprehensive testing of all Cambridge AI services and endpoints
 * Tests unified API endpoints, validates schemas, and generates detailed reports
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';
const TEST_TOKEN = process.env.TEST_TOKEN || 'test-token'; // In production, use real token

// Test results
const results = {
  endpoints: [],
  summary: {
    passed: 0,
    warnings: 0,
    failed: 0,
    total: 0
  },
  startTime: Date.now(),
  errors: []
};

// Expected schema for each endpoint
const endpointSchemas = {
  '/api/ai-master/test-submission': {
    fields: ['success', 'data'],
    dataFields: ['assessment', 'summary', 'supervisor', 'emotion', 'learningPath']
  },
  '/api/ai-master/adaptive-practice': {
    fields: ['success', 'data'],
    dataFields: ['adaptive', 'emotion', 'emotionSync']
  },
  '/api/ai-master/insights': {
    fields: ['success', 'data'],
    dataFields: ['summary', 'supervisor', 'emotion', 'learningPath']
  },
  '/api/ai-master/emotion-sync': {
    fields: ['success', 'data'],
    dataFields: ['emotion', 'toneSuggested', 'sentimentTrend']
  },
  '/api/assessment/summary/:userId': {
    fields: ['band', 'skills'],
    skillsFields: ['reading', 'writing', 'listening', 'speaking']
  },
  '/api/feedback/test/:id': {
    fields: ['tone', 'strengths', 'weaknesses', 'suggestions']
  },
  '/api/motivation/summary/:userId': {
    fields: ['streak', 'achievements', 'activity']
  },
  '/api/supervisor/trend/:userId': {
    fields: ['trend', 'progressRate', 'recommendation']
  },
  '/api/learningpath/:userId': {
    fields: ['path', 'skillFocus', 'nextGoal']
  },
  '/api/practice/summary/:userId': {
    fields: ['totalSessions', 'skills', 'overallBand']
  }
};

/**
 * Colorize text
 */
function colorize(text, color) {
  return `${colors[color] || ''}${text}${colors.reset}`;
}

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + (urlObj.search || ''),
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      timeout: 15000
    };

    const request = client.request(requestOptions, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({
            status: response.statusCode,
            data: parsed,
            headers: response.headers,
            raw: data
          });
        } catch (e) {
          resolve({
            status: response.statusCode,
            data: data,
            headers: response.headers,
            raw: data,
            parseError: e.message
          });
        }
      });
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout after 15s'));
    });

    if (options.body) {
      request.write(JSON.stringify(options.body));
    }
    
    request.end();
  });
}

/**
 * Validate schema
 */
function validateSchema(data, schema, path = '') {
  const errors = [];
  
  if (!schema || !data) {
    return { valid: false, errors: ['Missing schema or data'] };
  }

  // Check required fields
  if (schema.fields && Array.isArray(schema.fields)) {
    schema.fields.forEach(field => {
      if (!(field in data) && data[field] !== null && data[field] !== undefined) {
        errors.push(`Missing required field: ${path ? path + '.' : ''}${field}`);
      }
    });
  }

  // Check nested fields (e.g., dataFields)
  if (schema.dataFields && data.data && typeof data.data === 'object') {
    schema.dataFields.forEach(field => {
      if (!(field in data.data) && data.data[field] !== null) {
        errors.push(`Missing data field: data.${field}`);
      }
    });
  }

  // Check skills fields
  if (schema.skillsFields && data.skills && typeof data.skills === 'object') {
    schema.skillsFields.forEach(field => {
      if (!(field in data.skills) && data.skills[field] !== null) {
        errors.push(`Missing skills field: skills.${field}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Test endpoint
 */
async function testEndpoint(name, method, path, body = null, authToken = null) {
  const startTime = Date.now();
  
  try {
    // Replace placeholders in path
    let testPath = path;
    if (path.includes(':userId')) {
      testPath = path.replace(':userId', 'test-user-123');
    }
    if (path.includes(':id')) {
      testPath = path.replace(':id', 'test-id-123');
    }

    const url = `${API_BASE_URL}${testPath}`;
    const options = {
      method,
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
    };
    
    if (body) {
      options.body = body;
    }

    const response = await makeRequest(url, options);
    const duration = Date.now() - startTime;

    const isSuccess = response.status >= 200 && response.status < 300;
    const schema = endpointSchemas[path];
    
    let schemaValid = { valid: true, errors: [] };
    if (schema && isSuccess && response.data) {
      schemaValid = validateSchema(response.data, schema);
    }

    const result = {
      name,
      path: testPath,
      method,
      status: response.status,
      success: isSuccess,
      duration,
      hasData: !!response.data,
      schemaValid: schemaValid.valid,
      schemaErrors: schemaValid.errors,
      response: response.data
    };

    // Determine status
    if (!isSuccess) {
      result.statusType = 'failed';
      results.summary.failed++;
    } else if (!schemaValid.valid) {
      result.statusType = 'warning';
      results.summary.warnings++;
    } else {
      result.statusType = 'passed';
      results.summary.passed++;
    }

    results.summary.total++;
    results.endpoints.push(result);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    const result = {
      name,
      path: testPath || path,
      method,
      success: false,
      duration,
      error: error.message,
      statusType: 'failed'
    };

    results.summary.failed++;
    results.summary.total++;
    results.endpoints.push(result);
    results.errors.push({
      endpoint: name,
      path,
      error: error.message
    });

    return result;
  }
}

/**
 * Test all endpoints in parallel
 */
async function testAllEndpoints() {
  console.log(colorize('\n🔍 Validating Cambridge AI System...\n', 'cyan'));
  
  const testPromises = [
    // AI Master endpoints
    testEndpoint('AI Master Test Submission', 'POST', '/api/ai-master/test-submission', {
      testResult: {
        skill: 'reading',
        answers: [],
        timeSpent: 30,
        userId: 'test-user-123'
      }
    }, TEST_TOKEN),
    
    testEndpoint('AI Master Adaptive Practice', 'POST', '/api/ai-master/adaptive-practice', {
      skill: 'reading',
      performance: {
        correct: 8,
        total: 10
      },
      mode: 'academic'
    }, TEST_TOKEN),
    
    testEndpoint('AI Master Insights', 'GET', '/api/ai-master/insights', null, TEST_TOKEN),
    
    testEndpoint('AI Master Emotion Sync', 'POST', '/api/ai-master/emotion-sync', {
      performance: {
        accuracy: 0.75,
        streak: 3,
        skill: 'reading'
      }
    }, TEST_TOKEN),
    
    // Individual service endpoints
    testEndpoint('Assessment Summary', 'GET', '/api/assessment/summary/:userId', null, TEST_TOKEN),
    testEndpoint('Feedback Test', 'GET', '/api/feedback/test/:id', null, TEST_TOKEN),
    testEndpoint('Motivation Summary', 'GET', '/api/motivation/summary/:userId', null, TEST_TOKEN),
    testEndpoint('Supervisor Trend', 'GET', '/api/supervisor/trend/:userId', null, TEST_TOKEN),
    testEndpoint('Learning Path', 'GET', '/api/learningpath/:userId', null, TEST_TOKEN),
    testEndpoint('Practice Summary', 'GET', '/api/practice/summary/:userId', null, TEST_TOKEN)
  ];

  const results = await Promise.allSettled(testPromises);
  
  // Process results
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(colorize(`❌ Test ${index + 1} rejected:`, 'red'), result.reason);
    }
  });

  return results;
}

/**
 * Print endpoint result
 */
function printEndpointResult(endpoint) {
  let icon = '✅';
  let statusColor = 'green';
  let statusText = 'OK';
  
  if (endpoint.statusType === 'failed') {
    icon = '❌';
    statusColor = 'red';
    statusText = 'FAILED';
  } else if (endpoint.statusType === 'warning') {
    icon = '⚠️';
    statusColor = 'yellow';
    statusText = 'WARNING';
  }

  const statusMsg = endpoint.statusType === 'failed' 
    ? `${endpoint.status || 'ERROR'} (${endpoint.duration}ms)`
    : `${endpoint.status} OK (${endpoint.duration}ms)`;

  console.log(
    `${icon} ${colorize(endpoint.name, 'bright')} — ${colorize(statusMsg, statusColor)}`
  );

  if (endpoint.schemaErrors && endpoint.schemaErrors.length > 0) {
    endpoint.schemaErrors.forEach(error => {
      console.log(`   ${colorize('⚠️', 'yellow')} ${colorize(error, 'yellow')}`);
    });
  }

  if (endpoint.error) {
    console.log(`   ${colorize('❌', 'red')} ${colorize(endpoint.error, 'red')}`);
  }
}

/**
 * Generate report
 */
function generateReport() {
  const duration = Date.now() - results.startTime;
  
  console.log(colorize('\n' + '='.repeat(70), 'cyan'));
  console.log(colorize('📋 VALIDATION REPORT', 'bright'));
  console.log(colorize('='.repeat(70) + '\n', 'cyan'));

  // Print all endpoint results
  results.endpoints.forEach(endpoint => {
    printEndpointResult(endpoint);
  });

  // Summary
  console.log(colorize('\n' + '─'.repeat(70), 'gray'));
  console.log(colorize('📊 Summary:', 'bright'));
  console.log(
    `   ${colorize('✅ Passed:', 'green')} ${results.summary.passed}`,
    `| ${colorize('⚠️  Warnings:', 'yellow')} ${results.summary.warnings}`,
    `| ${colorize('❌ Failed:', 'red')} ${results.summary.failed}`
  );
  console.log(`   ${colorize('⏱️  Total Time:', 'gray')} ${duration}ms`);
  console.log(colorize('─'.repeat(70) + '\n', 'gray'));

  // Final status
  const allPassed = results.summary.failed === 0 && results.summary.warnings === 0;
  const partialSuccess = results.summary.failed === 0 && results.summary.warnings > 0;
  
  if (allPassed) {
    console.log(colorize('🎓 Cambridge AI System Integrity: 100% ✅', 'green'));
    console.log(colorize('All services are live and synchronized.\n', 'green'));
  } else if (partialSuccess) {
    console.log(colorize(`⚠️  Cambridge AI System: ${results.summary.passed}/${results.summary.total} passed`, 'yellow'));
    console.log(colorize('Some modules have schema warnings but are functional.\n', 'yellow'));
  } else {
    console.log(colorize(`❌ Cambridge AI System: ${results.summary.failed} failed`, 'red'));
    console.log(colorize('Some services are not responding correctly.\n', 'red'));
  }

  return { allPassed, partialSuccess };
}

/**
 * Write log file
 */
function writeLogFile() {
  const logsDir = path.join(process.cwd(), 'logs');
  
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const logPath = path.join(logsDir, 'validation-report.txt');
  const timestamp = new Date().toISOString();
  
  let logContent = `Cambridge AI System Validation Report\n`;
  logContent += `Generated: ${timestamp}\n`;
  logContent += `API Base URL: ${API_BASE_URL}\n`;
  logContent += `${'='.repeat(70)}\n\n`;

  // Endpoint results
  results.endpoints.forEach(endpoint => {
    logContent += `${endpoint.name}\n`;
    logContent += `  Path: ${endpoint.path}\n`;
    logContent += `  Method: ${endpoint.method}\n`;
    logContent += `  Status: ${endpoint.status || 'ERROR'}\n`;
    logContent += `  Duration: ${endpoint.duration}ms\n`;
    logContent += `  Result: ${endpoint.statusType.toUpperCase()}\n`;
    
    if (endpoint.schemaErrors && endpoint.schemaErrors.length > 0) {
      logContent += `  Schema Errors:\n`;
      endpoint.schemaErrors.forEach(error => {
        logContent += `    - ${error}\n`;
      });
    }
    
    if (endpoint.error) {
      logContent += `  Error: ${endpoint.error}\n`;
    }
    
    logContent += '\n';
  });

  // Summary
  logContent += `${'='.repeat(70)}\n`;
  logContent += `Summary:\n`;
  logContent += `  Passed: ${results.summary.passed}\n`;
  logContent += `  Warnings: ${results.summary.warnings}\n`;
  logContent += `  Failed: ${results.summary.failed}\n`;
  logContent += `  Total: ${results.summary.total}\n`;
  logContent += `  Duration: ${Date.now() - results.startTime}ms\n`;

  fs.writeFileSync(logPath, logContent, 'utf8');
  console.log(colorize(`📝 Report saved to: ${logPath}`, 'gray'));
}

/**
 * Main validation function
 */
async function validatePhases() {
  try {
    await testAllEndpoints();
    
    const report = generateReport();
    writeLogFile();
    
    // Exit with appropriate code
    if (report.allPassed) {
      process.exit(0);
    } else if (report.partialSuccess) {
      process.exit(0); // Warnings don't fail the build
    } else {
      process.exit(1); // Failures cause exit code 1
    }
  } catch (error) {
    console.error(colorize('❌ Validation failed:', 'red'), error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run validation
if (require.main === module) {
  validatePhases();
}

module.exports = { validatePhases, testEndpoint, validateSchema };
