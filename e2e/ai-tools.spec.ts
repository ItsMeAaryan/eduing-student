import { test, expect } from '@playwright/test';
import { loginAsDemo } from './auth-helper';

test.describe('AI Tools Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page);
  });

  test('AI Copilot - Chat and empty state', async ({ page }) => {
    await page.goto('/student/copilot');
    await expect(page.getByText('What would you like help with today?')).toBeVisible();
    
    // Type in the chat input
    const input = page.getByPlaceholder(/Ask Copilot anything.../i);
    await input.fill('What universities are good for Computer Science?');
    await page.keyboard.press('Enter');
    
    // Should show user message
    await expect(page.getByText('What universities are good for Computer Science?')).toBeVisible();
  });

  test('Career Advisor - Renders correctly', async ({ page }) => {
    await page.goto('/student/career');
    await expect(page.getByRole('heading', { name: 'Career Roadmap' }).first()).toBeVisible();
    
    // Look for generate button
    const generateBtn = page.getByRole('button', { name: /Map My Future|Generate/i }).first();
    if (await generateBtn.isVisible()) {
      await generateBtn.click();

    }
  });

  test('SOP Generator - Renders and initiates', async ({ page }) => {
    await page.goto('/student/sop');
    await expect(page.getByRole('heading', { name: /SOP Studio|Blank Canvas/i }).first()).toBeVisible();
    
    const generateBtn = page.getByRole('button', { name: /Generate/i }).first();
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
    }
  });

  test('Resume Builder - Renders correctly', async ({ page }) => {
    await page.goto('/student/resume');
    await expect(page.getByRole('heading', { name: /Resume/i }).first()).toBeVisible();
  });
});
