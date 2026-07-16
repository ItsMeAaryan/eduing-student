import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('Demo Login successfully authenticates and redirects to dashboard', async ({ page }) => {
    await page.goto('/auth/student/login');
    
    // Expect the Demo mode button
    const demoButton = page.getByRole('button', { name: /Try Demo/i });
    if (await demoButton.isVisible()) {
      await demoButton.click();
      await page.getByRole('button', { name: /Student Demo/i }).click();
    } else {
      // Fallback if demo button is not found
      await page.fill('input[type="email"]', 'demo@eduing.com');
      await page.fill('input[type="password"]', 'demo123');
      await page.getByRole('button', { name: /Login/i }).click();
    }

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/student\/dashboard/, { timeout: 15000 });
    
    // Check if the dashboard rendered correctly
    await expect(page.getByText('Profile Strength')).toBeVisible();
    
    // Test logout
    await page.getByRole('button', { name: /Logout/i }).click();
    await expect(page).toHaveURL(/.*\/auth\/student\/login/);
  });

  test('Invalid login shows error message', async ({ page }) => {
    await page.goto('/auth/student/login');
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.getByRole('button', { name: /Login/i }).click();
    
    await expect(page.getByText(/Invalid credentials|User not found|error/i)).toBeVisible();
  });

  test('Protected routes redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/student/dashboard');
    await expect(page).toHaveURL(/.*\/auth\/student\/login/);
  });
});
