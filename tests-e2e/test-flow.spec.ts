import { test, expect } from '@playwright/test';

test('test flow: open reading test and interact', async ({ page }) => {
  const base = process.env.E2E_BASE_URL || '';

  // Assume already registered from previous test; go to login and create a quick session
  await page.goto(`${base}/login`);
  await page.fill('input[name="email"]', `e2e_login_${Date.now()}@example.com`);
  await page.fill('input[name="password"]', 'Aa123456');
  // Try login (may fail if user not exist) -> navigate to register path
  await page.click('button[type="submit"]');
  // If still on login, go to register
  if ((await page.url()).includes('/login')) {
    await page.goto(`${base}/register`);
    await page.fill('input[name="name"]', 'E2E User');
    await page.fill('input[name="email"]', `e2e_${Date.now()}@example.com`);
    await page.fill('input#password', 'Aa123456');
    await page.fill('input#confirmPassword', 'Aa123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  }

  // Go to reading test
  await page.goto(`${base}/test/reading`);
  // Expect header/time/progress exists best-effort
  await expect(page.locator('text=Test').or(page.locator('text=Question'))).toBeVisible({ timeout: 10000 });

  // If there is Next or Submit button, click it once
  const nextBtn = page.locator('button:has-text("Next")');
  if (await nextBtn.count()) {
    await nextBtn.first().click();
  }

  const submitBtn = page.locator('button:has-text("Submit")').or(page.locator('button:has-text("Submit Test")'));
  if (await submitBtn.count()) {
    await submitBtn.first().click();
  }

  // After submit, either result or dashboard
  await expect(page).toHaveURL(/(result|dashboard)/, { timeout: 15000 });
});


