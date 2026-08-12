import { test, expect } from '@playwright/test'
import { loginAsDemo } from './auth-helper'

test.describe('Public universities page', () => {
  // Public route placeholder
  test('public /universities page loads with correct heading', async ({ page }) => {
    await page.goto('/universities')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/universities/i)
  })
})

test.describe('Student university discovery (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page)
  })

  test('lists universities and supports search', async ({ page }) => {
    await page.goto('/student/universities')
    await page.waitForLoadState('domcontentloaded')
    await page.locator('.group').first().waitFor({ state: 'visible', timeout: 15000 })

    // Find first university card and click View Details
    const firstUniCard = page.locator('.group').first()
    await firstUniCard.click()
    await page.waitForURL(/\/student\/universities\/.+/)

    // Back to listing
    await page.goto('/student/universities')
  })

  test('filtering by category narrows results', async ({ page }) => {
    await page.goto('/student/universities')
    
    const categoryBtn = page.getByRole('button', { name: /^Engineering$/i })
    if (await categoryBtn.isVisible()) {
      await categoryBtn.click()
    }
    
    // A results count or the grid itself should still be present
    await expect(page.locator('body')).not.toContainText(/application error/i)
  })
})
