import { test, expect } from '@playwright/test';
import { loginAsDemo } from './auth-helper';

test.describe('Discovery & Comparison Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page);
  });

  test('Discover Universities - Search and filter', async ({ page }) => {
    await page.goto('/student/universities');
    await expect(page.getByText('Explore Universities & Programs')).toBeVisible();

    const searchInput = page.getByPlaceholder(/Search universities, locations/i);
    await searchInput.fill('VIT');
    
    const aiSearchBtn = page.getByRole('button', { name: 'Search', exact: true });
    if (await aiSearchBtn.isVisible()) {
      await aiSearchBtn.click();
    }
  });

  test('Compare Universities - Redirects to discover', async ({ page }) => {
    await page.goto('/student/compare');
    await expect(page.getByText('Explore Universities & Programs')).toBeVisible();
    // The empty state is now just the discovery page since it redirects.
  });
});
