const fs = require('fs');
const path = require('path');

const filesToFix = [
  'server/routes/progressTracking.js',
  'server/routes/aiEngine.js',
  'server/routes/authenticIELTS.js',
  'server/routes/auth.js',
  'server/routes/aiRecommendations.js',
  'server/routes/upsell.js',
  'server/routes/tests.js',
  'server/routes/analytics.js',
  'server/routes/realIELTS.js',
  'server/routes/payment.js',
  'server/routes/dashboard.js',
  'server/routes/testHistory.js'
];

filesToFix.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace ES6 imports with CommonJS requires
    content = content.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g, 'const $1 = require(\'$2\');');
    content = content.replace(/import\s*{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"];?/g, 'const { $1 } = require(\'$2\');');
    content = content.replace(/import\s*\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g, 'const $1 = require(\'$2\');');
    
    // Replace ES6 exports with CommonJS exports
    content = content.replace(/export\s+default\s+/g, 'module.exports = ');
    content = content.replace(/export\s*{\s*([^}]+)\s*};?/g, 'module.exports = { $1 };');
    content = content.replace(/export\s+const\s+(\w+)/g, 'const $1');
    content = content.replace(/export\s+function\s+(\w+)/g, 'function $1');
    
    // Fix .js extensions in requires
    content = content.replace(/require\('([^']+)'\)/g, (match, p1) => {
      if (!p1.endsWith('.js') && !p1.startsWith('.')) {
        return match;
      }
      return match;
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});

console.log('🎉 All files fixed!');
