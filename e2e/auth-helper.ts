import { Page, expect } from '@playwright/test';

export async function loginAsDemo(page: Page) {
  await page.goto('/auth/login');
  await page.getByRole('button', { name: /Try Demo Account/i }).click();
  await page.getByRole('button', { name: /Sign In/i }).click();
  await expect(page).toHaveURL(/.*\/student\/dashboard/, { timeout: 15000 });
}
