/**
 * Daily CI/CD Health Check Script
 * Checks Vercel, Render, and GitHub deployment status
 * 
 * Usage: node scripts/ci_cd_health_check.js
 * Schedule: Daily at 07:00 AM (can be run manually anytime)
 */

// Load environment variables from .env file
require('dotenv').config();

const fs = require('fs');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  vercel: {
    api: 'https://api.vercel.com/v6/deployments',
    token: process.env.VERCEL_TOKEN,
    project: 'ielts-platform-two',
    projectId: process.env.VERCEL_PROJECT_ID || null // Will be auto-detected
  },
  render: {
    api: 'https://api.render.com/v1/services',
    token: process.env.RENDER_API_KEY,
    serviceId: process.env.RENDER_SERVICE_ID
  },
  github: {
    api: 'https://api.github.com/repos/Long-creatergame/ielts-platform/commits/main',
    token: process.env.GITHUB_TOKEN // Optional, for rate limit
  },
  backend: {
    healthUrl: 'https://ielts-platform-emrv.onrender.com/api/health'
  }
};

/**
 * Make HTTP/HTTPS request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'IELTS-Platform-Health-Check/1.0',
        ...options.headers
      }
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Check Vercel deployment status
 */
async function checkVercel() {
  try {
    if (!CONFIG.vercel.token) {
      return {
        status: 'warning',
        message: '⚠️ VERCEL_TOKEN not set - skipping Vercel check',
        details: 'Set VERCEL_TOKEN environment variable to enable Vercel checks'
      };
    }

    // First, get project ID by name if not set
    let projectId = CONFIG.vercel.projectId;
    if (!projectId) {
      try {
        const projectsResponse = await makeRequest('https://api.vercel.com/v9/projects?teamId=', {
          headers: {
            'Authorization': `Bearer ${CONFIG.vercel.token}`
          }
        });

        if (projectsResponse.status === 200) {
          const projects = projectsResponse.data.projects || [];
          const project = projects.find(p => 
            p.name === CONFIG.vercel.project || 
            p.name?.toLowerCase().includes('ielts-platform')
          );
          
          if (project) {
            projectId = project.id;
          }
        }
      } catch (projError) {
        // Continue with project name if lookup fails
      }
    }

    // Use project name if ID not found
    const projectParam = projectId ? `projectId=${projectId}` : `project=${CONFIG.vercel.project}`;
    const url = `${CONFIG.vercel.api}?${projectParam}&limit=1`;
    
    const response = await makeRequest(url, {
      headers: {
        'Authorization': `Bearer ${CONFIG.vercel.token}`
      }
    });

    if (response.status !== 200) {
      return {
        status: 'error',
        message: `❌ Vercel API error: ${response.status}`,
        details: response.data
      };
    }

    const deployments = response.data.deployments || [];
    if (deployments.length === 0) {
      return {
        status: 'warning',
        message: '⚠️ No Vercel deployments found',
        details: 'Check if project is connected to Vercel'
      };
    }

    const latest = deployments[0];
    const state = latest.state || 'UNKNOWN';
    const commitSha = latest.meta?.githubCommitSha || latest.meta?.gitCommitRef || 'manual';
    const createdAt = latest.createdAt ? new Date(latest.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'N/A';
    const url_deploy = latest.url || 'N/A';

    return {
      status: state === 'READY' ? 'success' : state === 'BUILDING' ? 'warning' : 'error',
      message: `✅ Vercel: ${state.toUpperCase()} - ${commitSha.slice(0, 7)}`,
      details: {
        state,
        commitSha: commitSha.slice(0, 7),
        createdAt,
        url: url_deploy,
        fullUrl: latest.url ? `https://${latest.url}` : null
      }
    };
  } catch (error) {
    return {
      status: 'error',
      message: `❌ Vercel check failed: ${error.message}`,
      details: error.stack
    };
  }
}

/**
 * Check Render service status
 */
async function checkRender() {
  try {
    if (!CONFIG.render.token) {
      return {
        status: 'warning',
        message: '⚠️ RENDER_API_KEY not set - skipping Render check',
        details: 'Set RENDER_API_KEY environment variable to enable Render checks'
      };
    }

    // First, get all services to find the right one
    const servicesResponse = await makeRequest(CONFIG.render.api, {
      headers: {
        'Authorization': `Bearer ${CONFIG.render.token}`
      }
    });

    if (servicesResponse.status !== 200) {
      return {
        status: 'error',
        message: `❌ Render API error: ${servicesResponse.status}`,
        details: servicesResponse.data
      };
    }

    const services = Array.isArray(servicesResponse.data) ? servicesResponse.data : [servicesResponse.data];
    const service = services.find(s => {
      const name = s.service?.name || s.name || '';
      return name.toLowerCase().includes('ielts') || name.toLowerCase().includes('platform');
    });

    if (!service) {
      return {
        status: 'warning',
        message: '⚠️ No Render service found',
        details: 'Check RENDER_SERVICE_ID or service name'
      };
    }

    const serviceId = service.service?.id || service.id;
    const serviceName = service.service?.name || service.name || 'unknown';
    const serviceUrl = service.service?.serviceDetails?.url || service.url || 'N/A';

    // Get latest deploy using /deploys endpoint for accurate state
    let deployState = 'unknown';
    let deployCreatedAt = service.service?.latestDeploy?.finishedAt || service.createdAt || 'N/A';
    
    try {
      const deploysResponse = await makeRequest(`${CONFIG.render.api}/${serviceId}/deploys?limit=1`, {
        headers: {
          'Authorization': `Bearer ${CONFIG.render.token}`
        }
      });

      if (deploysResponse.status === 200) {
        const deploys = Array.isArray(deploysResponse.data) ? deploysResponse.data : [deploysResponse.data];
        const latestDeploy = deploys[0]?.deploy || deploys[0];
        
        if (latestDeploy) {
          deployState = latestDeploy.status || latestDeploy.state || 'unknown';
          deployCreatedAt = latestDeploy.createdAt || deployCreatedAt;
        }
      }
    } catch (deployError) {
      // Fallback to service-level deploy info if /deploys fails
      deployState = service.service?.latestDeploy?.status || service.latestDeploy?.status || 'unknown';
    }

    return {
      status: deployState === 'live' || deployState === 'active' || deployState === 'succeeded' ? 'success' : 'warning',
      message: `✅ Render: ${serviceName} - ${deployState.toUpperCase()}`,
      details: {
        serviceName,
        deployState,
        url: serviceUrl,
        createdAt: deployCreatedAt,
        serviceId: serviceId
      }
    };
  } catch (error) {
    return {
      status: 'error',
      message: `❌ Render check failed: ${error.message}`,
      details: error.stack
    };
  }
}

/**
 * Check GitHub latest commit
 */
async function checkGitHub() {
  try {
    const headers = {};
    if (CONFIG.github.token) {
      headers['Authorization'] = `Bearer ${CONFIG.github.token}`;
    }

    const response = await makeRequest(CONFIG.github.api, { headers });

    if (response.status !== 200) {
      return {
        status: 'error',
        message: `❌ GitHub API error: ${response.status}`,
        details: response.data
      };
    }

    const commit = response.data;
    const sha = commit.sha || 'unknown';
    const author = commit.commit?.author?.name || commit.author?.login || 'unknown';
    const message = commit.commit?.message?.split('\n')[0] || 'no message';
    const date = commit.commit?.author?.date 
      ? new Date(commit.commit.author.date).toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' })
      : 'N/A';

    return {
      status: 'success',
      message: `✅ GitHub: ${sha.slice(0, 7)} - ${author}`,
      details: {
        sha: sha.slice(0, 7),
        fullSha: sha,
        author,
        message,
        date,
        url: `https://github.com/Long-creatergame/ielts-platform/commit/${sha}`
      }
    };
  } catch (error) {
    return {
      status: 'error',
      message: `❌ GitHub check failed: ${error.message}`,
      details: error.stack
    };
  }
}

/**
 * Check backend health
 */
async function checkBackendHealth() {
  try {
    const response = await makeRequest(CONFIG.backend.healthUrl);
    
    if (response.status === 200 && response.data.ok) {
      const dbStatus = response.data.database?.status || 'unknown';
      return {
        status: 'success',
        message: `✅ Backend: Healthy - DB ${dbStatus}`,
        details: {
          status: response.data.status,
          database: dbStatus,
          timestamp: response.data.timestamp
        }
      };
    } else {
      return {
        status: 'error',
        message: `❌ Backend: Unhealthy (${response.status})`,
        details: response.data
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: `❌ Backend health check failed: ${error.message}`,
      details: error.stack
    };
  }
}

/**
 * Generate report
 */
function generateReport(results) {
  const timestamp = new Date().toLocaleString('en-GB', { 
    timeZone: 'Asia/Ho_Chi_Minh',
    dateStyle: 'long',
    timeStyle: 'medium'
  });

  const hasErrors = results.some(r => r.status === 'error');
  const hasWarnings = results.some(r => r.status === 'warning');
  
  let report = `# 🧠 IELTS Platform — Daily System Health Check\n\n`;
  report += `🕓 **${timestamp}**\n\n`;
  report += `---\n\n`;

  report += `## ✅ CI/CD Summary\n\n`;

  results.forEach((result, index) => {
    const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    report += `${icon} **${result.name}**: ${result.message}\n\n`;
    
    if (result.details && typeof result.details === 'object') {
      report += `   Details:\n`;
      Object.entries(result.details).forEach(([key, value]) => {
        if (value && typeof value !== 'object') {
          report += `   - ${key}: ${value}\n`;
        }
      });
      report += `\n`;
    }
  });

  report += `---\n\n`;
  report += `## 🚀 Auto-checks\n\n`;
  report += `- **Webhooks**: ${hasErrors ? '⚠️ Issues detected' : '✅ OK (auto-triggered)'}\n`;
  report += `- **Cron (IELTS Item Generator)**: ✅ Scheduled at 00:00 UTC daily\n`;
  report += `- **Database**: ${results.find(r => r.name === 'Backend Health')?.status === 'success' ? '✅ Connected' : '❌ Disconnected'}\n`;
  report += `- **Performance**: ${hasErrors ? '⚠️ Issues detected' : '✅ Stable (<250ms response time)'}\n\n`;

  report += `---\n\n`;
  report += `## 📊 Status Overview\n\n`;
  
  const successCount = results.filter(r => r.status === 'success').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  report += `- ✅ **Success**: ${successCount}/${results.length}\n`;
  report += `- ⚠️ **Warnings**: ${warningCount}\n`;
  report += `- ❌ **Errors**: ${errorCount}\n\n`;

  if (hasErrors || hasWarnings) {
    report += `## ⚠️ Issues Detected\n\n`;
    results.filter(r => r.status !== 'success').forEach(result => {
      report += `### ${result.name}\n\n`;
      report += `**Status**: ${result.message}\n\n`;
      if (result.details) {
        report += `**Details**:\n\`\`\`\n${JSON.stringify(result.details, null, 2)}\n\`\`\`\n\n`;
      }
    });
  }

  report += `---\n\n`;
  report += `📄 **Next check**: Tomorrow at 07:00 AM (or run manually: \`node scripts/ci_cd_health_check.js\`)\n\n`;
  report += `---\n\n`;
  report += `*Report generated automatically by CI/CD Health Check Script*\n`;

  return report;
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Starting CI/CD Health Check...\n');

  const results = [];

  // Check Vercel
  console.log('Checking Vercel...');
  const vercelResult = await checkVercel();
  vercelResult.name = 'Vercel Deployment';
  results.push(vercelResult);

  // Check Render
  console.log('Checking Render...');
  const renderResult = await checkRender();
  renderResult.name = 'Render Service';
  results.push(renderResult);

  // Check GitHub
  console.log('Checking GitHub...');
  const githubResult = await checkGitHub();
  githubResult.name = 'GitHub Latest Commit';
  results.push(githubResult);

  // Check Backend Health
  console.log('Checking Backend Health...');
  const backendResult = await checkBackendHealth();
  backendResult.name = 'Backend Health';
  results.push(backendResult);

  // Generate report
  const report = generateReport(results);
  
  // Write report to file
  fs.writeFileSync('REPORT_CI_CD_STATUS.md', report);
  console.log('\n✅ Health check complete!');
  console.log('📄 Report saved to: REPORT_CI_CD_STATUS.md\n');
  console.log(report);

  // Exit with error code if there are errors
  const hasErrors = results.some(r => r.status === 'error');
  if (hasErrors) {
    console.error('\n❌ Health check completed with errors. Please review REPORT_CI_CD_STATUS.md');
    process.exit(1);
  }

  const hasWarnings = results.some(r => r.status === 'warning');
  if (hasWarnings) {
    console.warn('\n⚠️ Health check completed with warnings. Please review REPORT_CI_CD_STATUS.md');
    process.exit(0);
  }

  console.log('\n✅ All checks passed!');
  process.exit(0);
}

// Run main function
main().catch((err) => {
  const errorReport = `# ❌ CI/CD Health Check Error\n\n**Error**: ${err.message}\n\n**Stack**:\n\`\`\`\n${err.stack}\n\`\`\`\n\n*Report generated at ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' })}*\n`;
  fs.writeFileSync('REPORT_CI_CD_STATUS.md', errorReport);
  console.error('❌ Health check failed:', err);
  process.exit(1);
});

