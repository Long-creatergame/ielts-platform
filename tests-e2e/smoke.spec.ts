import { test, expect } from '@playwright/test';

test('smoke: open login and see title', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/IELTS Platform/i);
});

test('smoke: failed login reveals forgot password link', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'e2e@example.com');
  await page.fill('input[name="password"]', 'wrong');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Forgot Password').or(page.locator('text=Quên mật khẩu'))).toBeVisible({ timeout: 5000 });
});


