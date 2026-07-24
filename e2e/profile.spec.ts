import { test, expect } from '@playwright/test'
import { loginAsDemo } from './auth-helper'

test.describe('Student profile', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page)
  })

  test('loads the profile page and displays Identity tab', async ({ page }) => {
    await page.goto('/student/profile')
    await expect(page.getByText('Profile Strength')).toBeVisible()
    await expect(page.getByText('Identity')).toBeVisible()
  })

  test('Academic tab renders correctly', async ({ page }) => {
    await page.goto('/student/profile')
    await page.getByText('Academic').click()
    await expect(page.locator('body')).not.toContainText(/application error/i)
  })
})
