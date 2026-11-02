import { test, expect } from '@playwright/test';
import { loginAsDemo } from './auth-helper';

test.describe('AI Tools Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page);
  });

  test('AI Copilot - Chat and empty state', async ({ page }) => {
    await page.goto('/student/copilot');
    await expect(page.getByPlaceholder('Ask Eduing AI anything...')).toBeVisible();
    
    const input = page.getByPlaceholder('Ask Eduing AI anything...');
    await input.fill('What universities are good for Computer Science?');
    await page.keyboard.press('Enter');
    
    await expect(page.getByText('What universities are good for Computer Science?')).toBeVisible();
  });

  test('SOP Generator - Renders and initiates', async ({ page }) => {
    await page.goto('/student/sop');
    await expect(page.getByRole('heading', { name: /SOP/i }).first()).toBeVisible();
  });

  test('Interview Prep - offers admission-focused tracks only', async ({ page }) => {
    await page.goto('/student/interview');
    await expect(page.getByText('University Admission').first()).toBeVisible();
    await expect(page.getByText('Internship')).toHaveCount(0);
  });
});
