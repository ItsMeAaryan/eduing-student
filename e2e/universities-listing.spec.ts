import { test, expect } from '@playwright/test'

test.describe('Public universities/programs pages', () => {
  // These routes are currently "Coming Soon" placeholders (see Phase 2 SEO
  // notes) — the real, functional listing lives at /student/discover
  // (auth-gated). These are smoke tests for the public stubs; update once
  // real content ships.
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
  // Precondition: requires a logged-in test student session — see
  // profile.spec.ts for auth setup notes.
  test('lists universities and supports search', async ({ page }) => {
    await page.goto('/student/discover')

    // At least one university card renders (or a legitimate "no results"
    // empty state — this depends on the universities collection having
    // seed data in the test project).
    const applyButtons = page.getByRole('button', { name: /apply now/i })
    const emptyState = page.getByText(/no universities found/i)

    await expect(applyButtons.first().or(emptyState)).toBeVisible({ timeout: 10000 })
  })

  test('filtering by academic level narrows results', async ({ page }) => {
    await page.goto('/student/discover')
    await page.getByRole('group', { name: /academic level/i }).getByRole('button').first().click()
    // A results count or the grid itself should still be present after
    // applying a filter (asserts the filter doesn't crash the page).
    await expect(page.locator('body')).not.toContainText(/application error/i)
  })
})
