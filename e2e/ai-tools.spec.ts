import { test, expect } from '@playwright/test';

test.describe('AI Tools Workflows', () => {
  // Helper to login
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

  test('AI Copilot - Chat and empty state', async ({ page }) => {
    await page.goto('/student/copilot');
    await expect(page.getByText('AI Copilot')).toBeVisible();
    
    // Type in the chat input
    const input = page.getByPlaceholder(/Ask the AI copilot...|Message/i);
    if (await input.isVisible()) {
      await input.fill('What universities are good for Computer Science?');
      await page.getByRole('button', { name: /send|submit/i }).click();
      
      // Should show user message
      await expect(page.getByText('What universities are good for Computer Science?')).toBeVisible();
    }
  });

  test('Career Advisor - Renders correctly', async ({ page }) => {
    await page.goto('/student/career');
    await expect(page.getByText('Career Advisor')).toBeVisible();
    
    // Look for generate button
    const generateBtn = page.getByRole('button', { name: /Analyze|Generate/i }).first();
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      await expect(page.getByText(/Analyzing|Loading/i)).toBeVisible();
    }
  });

  test('SOP Generator - Renders and initiates', async ({ page }) => {
    await page.goto('/student/sop');
    await expect(page.getByText(/Statement of Purpose|SOP/i)).toBeVisible();
    
    const generateBtn = page.getByRole('button', { name: /Generate/i }).first();
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
    }
  });

  test('Resume Builder - Renders correctly', async ({ page }) => {
    await page.goto('/student/resume');
    await expect(page.getByText(/Resume Builder/i)).toBeVisible();
  });
});
