import { Page, expect } from '@playwright/test';

export async function loginAsDemo(page: Page) {
  await page.goto('/auth/login');
  await page.getByLabel(/Email Address/i).fill('aaryan.student@eduing.in');
  await page.getByLabel(/Password/i).fill('demo123');
  await page.getByRole('button', { name: /Sign In/i }).click();
  await expect(page).toHaveURL(/.*\/student\/dashboard/, { timeout: 15000 });
}
