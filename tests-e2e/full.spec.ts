import { test, expect } from '@playwright/test';

test('full: register -> dashboard -> pricing', async ({ page }) => {
  const base = process.env.E2E_BASE_URL || '';
  const email = `e2e+${Date.now()}@example.com`;
  const password = 'Aa123456';

  await page.goto(`${base}/register`);

  await page.fill('input[name="name"]', 'E2E User');
  await page.fill('input[name="email"]', email);
  await page.fill('input#password', password);
  await page.fill('input#confirmPassword', password);

  await page.click('button[type="submit"]');

  // Should land on dashboard
  await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  await expect(page.locator('text=IELTS Platform').first()).toBeVisible();

  // Navigate to pricing and ensure it's rendered (even if no plans configured)
  await page.goto(`${base}/pricing`);
  await expect(page.locator('text=Chọn gói').or(page.locator('text=pricing', { hasText: /Chọn|pricing/i }))).toBeVisible();
});


