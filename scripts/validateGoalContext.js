const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(process.env.DASHBOARD_URL || 'http://localhost:5173/dashboard');
  await page.evaluate(() => localStorage.setItem('i18nextLng', 'ko'));
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForSelector('.goal-text');
  const text = await page.$eval('.goal-text', (el) => el.innerText);
  if (text.includes('undefined')) {
    console.error('❌ Goal key unresolved');
    process.exit(1);
  } else {
    console.log('✅ Goal key correctly localized:', text);
    process.exit(0);
  }
})();


