import { test, expect, Page } from '@playwright/test';

import { loginAsDemo } from './auth-helper';
test.describe('Authentication Flow', () => {
  test('Demo Login successfully authenticates and redirects to dashboard', async ({ page }) => {
    await loginAsDemo(page);
    
    // Check if the dashboard rendered correctly (Home is selected in sidebar)
    await expect(page.getByRole('link', { name: /Home/i })).toBeVisible();
    
    // Test logout
    await page.getByRole('button', { name: /Log Out/i }).click();
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('Invalid login shows error message', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel(/Email Address/i).fill('invalid@example.com');
    await page.getByLabel(/Password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /Sign In/i }).click();
    
    await expect(page.getByText(/Invalid email or password|error/i)).toBeVisible();
  });

  test('Protected routes redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/student/dashboard');
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });
});
