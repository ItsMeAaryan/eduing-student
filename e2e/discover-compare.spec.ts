import { test, expect } from '@playwright/test';
import { loginAsDemo } from './auth-helper';

test.describe('Discovery & Comparison Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page);
  });

  test('Discover Universities - Search and filter', async ({ page }) => {
    await page.goto('/student/discover');
    await expect(page.getByText('Discover Universities')).toBeVisible();

    const searchInput = page.getByPlaceholder(/What are the best Computer Science colleges/i);
    await searchInput.fill('VIT');
    
    // The search button next to the input
    const aiSearchBtn = page.getByRole('button', { name: /Search/i });
    if (await aiSearchBtn.isVisible()) {
      await aiSearchBtn.click();
    }
  });

  test('Compare Universities - Renders empty state and matrix', async ({ page }) => {
    await page.goto('/student/compare');
    await expect(page.getByText(/AI University Comparison/i)).toBeVisible();
    
    // Check if empty state exists (when no IDs in URL)
    await expect(page.getByText(/Select Universities to Compare/i)).toBeVisible();
  });
});
