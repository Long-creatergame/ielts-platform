/**
 * Phase 2.18.I18N.fix – i18n Audit Script
 * Scans all JSX files for hardcoded strings that should be translated
 */
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const SCAN_DIRS = [
  'client/src/pages/**/*.jsx',
  'client/src/components/**/*.jsx'
];

const HARDCODED_PATTERNS = [
  // Vietnamese strings
  /["']Tổng quan["']/gi,
  /["']Luyện tập kỹ năng["']/gi,
  /["']Mục tiêu của bạn["']/gi,
  /["']Xem chi tiết bài test["']/gi,
  /["']Kết quả["']/gi,
  /["']Bài test["']/gi,
  /["']vừa xong["']/gi,
  /["']hôm qua["']/gi,
  
  // English strings that should be translated
  /["']vs last month["']/gi,
  /["']Scored["']/gi,
  /["']View Detail["']/gi,
  /["']View All["']/gi,
  /["']Dashboard["']/gi,
  /["']Overview["']/gi,
  /["']Skills["']/gi,
  /["']Insights["']/gi,
  /["']Path["']/gi,
  /["']History["']/gi,
  
  // Common patterns
  /["'][A-Z][a-z]+ [A-Z][a-z]+["']/g, // "Two Words"
  /["'][\u4e00-\u9fff]+["']/g, // Chinese characters
  /["'][\u3040-\u309f\u30a0-\u30ff]+["']/g, // Japanese characters
  /["'][\uac00-\ud7af]+["']/g, // Korean characters
];

const IGNORE_PATTERNS = [
  /import.*from/,
  /className=/,
  /id=/,
  /src=/,
  /alt=/,
  /href=/,
  /to=/,
  /placeholder=/,
  /console\./,
  /\/\/.*/,
  /\/\*.*\*\//,
  /t\(/,
  /i18n\./,
  /useTranslation/,
];

function isIgnored(line) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(line));
}

async function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  lines.forEach((line, index) => {
    if (isIgnored(line)) return;

    HARDCODED_PATTERNS.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches) {
        matches.forEach(match => {
          issues.push({
            file: filePath,
            line: index + 1,
            text: match,
            context: line.trim()
          });
        });
      }
    });
  });

  return issues;
}

async function main() {
  console.log('🔍 Scanning for hardcoded strings...\n');

  const allIssues = [];
  
  for (const pattern of SCAN_DIRS) {
    const files = await glob(pattern, { ignore: ['**/node_modules/**', '**/dist/**'] });
    
    for (const file of files) {
      const issues = await scanFile(file);
      if (issues.length > 0) {
        allIssues.push(...issues);
      }
    }
  }

  // Group by file
  const grouped = {};
  allIssues.forEach(issue => {
    if (!grouped[issue.file]) {
      grouped[issue.file] = [];
    }
    grouped[issue.file].push(issue);
  });

  // Write report
  const reportPath = path.join(__dirname, '..', 'logs', 'i18n-missing-keys.txt');
  const logDir = path.dirname(reportPath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  let report = 'i18n Translation Audit Report\n';
  report += '='.repeat(60) + '\n\n';
  report += `Generated: ${new Date().toISOString()}\n`;
  report += `Total issues found: ${allIssues.length}\n\n`;

  Object.keys(grouped).sort().forEach(file => {
    report += `\n📄 ${file}\n`;
    report += '-'.repeat(60) + '\n';
    grouped[file].forEach(issue => {
      report += `  Line ${issue.line}: ${issue.text}\n`;
      report += `    Context: ${issue.context.substring(0, 80)}...\n`;
    });
  });

  fs.writeFileSync(reportPath, report, 'utf8');

  console.log(`✅ Audit complete! Found ${allIssues.length} potential issues.`);
  console.log(`📄 Report saved to: ${reportPath}\n`);

  if (allIssues.length > 0) {
    console.log('⚠️  Files with hardcoded strings:');
    Object.keys(grouped).forEach(file => {
      console.log(`   - ${file} (${grouped[file].length} issues)`);
    });
  } else {
    console.log('✅ No hardcoded strings found!');
  }
}

main().catch(console.error);

