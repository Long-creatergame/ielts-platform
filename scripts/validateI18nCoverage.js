/**
 * Phase 2.18.I18N.fix – i18n Coverage Validation Script
 * Checks that all visible text on key pages match current i18n.language
 */
const puppeteer = require('puppeteer');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const LANGUAGES = ['en', 'vi', 'zh', 'ja', 'ko'];

// Expected translations for key UI elements
const EXPECTED_TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard',
    overview: 'Overview',
    skills: 'Skills Practice',
    history: 'Results & Tests',
    help: 'Help',
  },
  vi: {
    dashboard: 'Bảng điều khiển',
    overview: 'Tổng quan',
    skills: 'Luyện tập kỹ năng',
    history: 'Kết quả & Bài test',
    help: 'Trợ giúp',
  },
  zh: {
    dashboard: '仪表板',
    overview: '概览',
    skills: '技能练习',
    history: '结果与测试',
    help: '帮助',
  },
  ja: {
    dashboard: 'ダッシュボード',
    overview: '概要',
    skills: 'スキル練習',
    history: '結果とテスト',
    help: 'ヘルプ',
  },
  ko: {
    dashboard: '대시보드',
    overview: '개요',
    skills: '스킬 연습',
    history: '결과 및 테스트',
    help: '도움말',
  },
};

async function validateLanguage(lang) {
  console.log(`\n🌐 Testing language: ${lang}`);
  
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    
    // Set language in localStorage
    await page.evaluate((lng) => {
      localStorage.setItem('i18nextLng', lng);
      window.location.reload();
    }, lang);
    
    await page.waitForTimeout(2000);
    
    // Check if page loaded
    await page.waitForSelector('h1, [class*="dashboard"]', { timeout: 5000 });
    
    // Get visible text
    const pageText = await page.evaluate(() => {
      return document.body.innerText;
    });
    
    const expected = EXPECTED_TRANSLATIONS[lang];
    const issues = [];
    
    // Check for English text when language is not English
    if (lang !== 'en') {
      Object.entries(EXPECTED_TRANSLATIONS.en).forEach(([key, englishText]) => {
        if (pageText.includes(englishText) && !pageText.includes(expected[key])) {
          issues.push(`Found English "${englishText}" instead of ${lang} translation`);
        }
      });
    }
    
    // Check for expected translations
    Object.entries(expected).forEach(([key, expectedText]) => {
      if (!pageText.includes(expectedText)) {
        issues.push(`Missing expected translation for "${key}": "${expectedText}"`);
      }
    });
    
    if (issues.length > 0) {
      console.log(`  ❌ Found ${issues.length} issues:`);
      issues.forEach(issue => console.log(`     - ${issue}`));
      return false;
    } else {
      console.log(`  ✅ All translations correct for ${lang}`);
      return true;
    }
    
  } catch (error) {
    console.log(`  ❌ Error validating ${lang}:`, error.message);
    return false;
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('🔍 Validating i18n Coverage...');
  console.log(`Base URL: ${BASE_URL}\n`);
  
  const results = {};
  
  for (const lang of LANGUAGES) {
    results[lang] = await validateLanguage(lang);
  }
  
  console.log('\n📊 Summary:');
  console.log('='.repeat(50));
  
  const allPassed = Object.values(results).every(r => r);
  
  LANGUAGES.forEach(lang => {
    const status = results[lang] ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${lang}: ${status}`);
  });
  
  if (allPassed) {
    console.log('\n✅ All language validations passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some language validations failed. Please check the issues above.');
    process.exit(1);
  }
}

main().catch(console.error);

