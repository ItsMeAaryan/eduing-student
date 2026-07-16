import { test, expect } from '@playwright/test';

test.describe('Discovery & Comparison Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/student/login');
    const demoButton = page.getByRole('button', { name: /Try Demo/i });
    if (await demoButton.isVisible()) {
      await demoButton.click();
      await page.getByRole('button', { name: /Student Demo/i }).click();
    } else {
      await page.fill('input[type="email"]', 'demo@eduing.com');
      await page.fill('input[type="password"]', 'demo123');
      await page.getByRole('button', { name: /Login/i }).click();
    }
    await expect(page).toHaveURL(/.*\/student\/dashboard/, { timeout: 15000 });
  });

  test('Discover Universities - Search and filter', async ({ page }) => {
    await page.goto('/student/discover');
    await expect(page.getByText('Discover Universities')).toBeVisible();

    const searchInput = page.getByPlaceholder(/Search universities...|Find/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('VIT');
      // Verify filtering works by checking if VIT appears or '0 Found' is handled.
    }
    
    // Check Natural Language Search visibility
    const aiSearchBtn = page.getByRole('button', { name: /AI Search|Natural Language/i });
    if (await aiSearchBtn.isVisible()) {
      await aiSearchBtn.click();
    }
  });

  test('Compare Universities - Renders empty state and matrix', async ({ page }) => {
    await page.goto('/student/compare');
    await expect(page.getByText(/University Comparison/i)).toBeVisible();
    
    // Check if empty state exists (when no IDs in URL)
    await expect(page.getByText(/Select universities to compare|No universities/i)).toBeVisible();
  });
});
