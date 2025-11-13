// Verification script to ensure no variable named 'node' exists in backend code
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const serverDir = path.join(__dirname, '..');
const routesDir = path.join(serverDir, 'routes');
const controllersDir = path.join(serverDir, 'controllers');

const foundIssues = [];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Skip comments and require statements
    if (line.trim().startsWith('//') || line.includes('require') || line.includes('node-fetch')) {
      return;
    }
    
    // Check for variable declarations
    const patterns = [
      /(const|let|var)\s+node\s*[=:]/,
      /function\s+\w+\s*\([^)]*node[^)]*\)/,
      /,\s*node\s*[,\)]/,
      /\{\s*node\s*[:}]/,
      /\[.*node.*\]/
    ];
    
    patterns.forEach(pattern => {
      if (pattern.test(line)) {
        foundIssues.push({
          file: filePath,
          line: index + 1,
          content: line.trim()
        });
      }
    });
  });
}

// Check all route files
if (fs.existsSync(routesDir)) {
  fs.readdirSync(routesDir).forEach(file => {
    if (file.endsWith('.js')) {
      checkFile(path.join(routesDir, file));
    }
  });
}

// Check all controller files
if (fs.existsSync(controllersDir)) {
  fs.readdirSync(controllersDir).forEach(file => {
    if (file.endsWith('.js')) {
      checkFile(path.join(controllersDir, file));
    }
  });
}

if (foundIssues.length > 0) {
  console.error('❌ Found potential issues:');
  foundIssues.forEach(issue => {
    console.error(`  ${issue.file}:${issue.line} - ${issue.content}`);
  });
  process.exit(1);
} else {
  console.log('✅ Verification passed: No variable named "node" found in routes or controllers');
  process.exit(0);
}
