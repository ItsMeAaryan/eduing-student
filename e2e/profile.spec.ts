import { test, expect } from '@playwright/test'

// Precondition: requires a logged-in test student session. Configure
// Playwright storageState (see https://playwright.dev/docs/auth) with a
// pre-authenticated session for a test account in your Firebase test
// project, or add a login step in a beforeEach here.

test.describe('Student profile', () => {
  test('loads the profile page and can enter edit mode', async ({ page }) => {
    await page.goto('/student/profile')

    await expect(page.getByRole('button', { name: /edit identity|cancel edit/i })).toBeVisible()

    await page.getByRole('button', { name: /edit identity/i }).click()

    // Editing mode swaps read-only divs for real inputs
    await expect(page.locator('#profile-fullname')).toBeVisible()
    await expect(page.getByRole('button', { name: /cancel edit/i })).toBeVisible()
  })

  test('editing a field and cancelling discards the change', async ({ page }) => {
    await page.goto('/student/profile')
    await page.getByRole('button', { name: /edit identity/i }).click()

    const nameInput = page.locator('#profile-fullname')
    const originalValue = await nameInput.inputValue()

    await nameInput.fill('Temporary E2E Name')
    await page.getByRole('button', { name: /cancel edit/i }).click()

    // Back in read-only mode, the original value should be shown, not the
    // unsaved edit.
    await expect(page.getByText(originalValue, { exact: true })).toBeVisible()
  })
})
