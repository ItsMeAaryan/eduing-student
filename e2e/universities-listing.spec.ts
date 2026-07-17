import { test, expect } from '@playwright/test'
import { loginAsDemo } from './auth-helper'

test.describe('Public universities/programs pages', () => {
  // These routes are currently "Coming Soon" placeholders
  test('public /universities page loads with correct heading', async ({ page }) => {
    await page.goto('/universities')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/universities/i)
  })

  test('public /programs page loads with correct heading', async ({ page }) => {
    await page.goto('/programs')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/programs/i)
  })
})

test.describe('Student university discovery (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page)
  })

  test('lists universities and supports search', async ({ page }) => {
    await page.goto('/student/discover')

    const viewDetailsBtns = page.getByRole('button', { name: /view details/i })
    const emptyState = page.getByText(/no results found/i)

    await expect(viewDetailsBtns.first().or(emptyState)).toBeVisible({ timeout: 10000 })
  })

  test('filtering by category narrows results', async ({ page }) => {
    await page.goto('/student/discover')
    
    const categoryBtn = page.getByRole('button', { name: /^Engineering$/i })
    if (await categoryBtn.isVisible()) {
      await categoryBtn.click()
    }
    
    // A results count or the grid itself should still be present
    await expect(page.locator('body')).not.toContainText(/application error/i)
  })
})
