import { test, expect } from '@playwright/test';

test('smoke: open login and see title', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/IELTS Platform/i);
});


