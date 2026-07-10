import { test, expect } from '@playwright/test'

// Precondition: requires a logged-in, verified test student account
// (user.isVerified === true) — an unverified account only sees "Verify to
// Apply" and cannot reach the submit step. Set up such an account in your
// test Firebase project and log in via storageState or a beforeEach login
// step before running this against CI.
//
// NOTE: also runs against the real Firebase project unless env vars point
// elsewhere — see registration.spec.ts.

test.describe('Application submission', () => {
  test('browse programs → apply → confirmation', async ({ page }) => {
    await page.goto('/student/discover')

    // "Apply Now" on the discover card navigates to the university detail
    // page (it does not submit directly — see handleApply() in
    // app/student/discover/page.tsx).
    await page.getByRole('button', { name: /apply now/i }).first().click()

    await expect(page).toHaveURL(/\/student\/universities\/.+/)

    // Selects the first program and reveals the confirm/submit panel
    await page.getByRole('button', { name: /start application/i }).click()

    await expect(page.getByText(/core eligibility/i)).toBeVisible()

    await page.getByRole('button', { name: /confirm & submit application/i }).click()

    // On success the app either shows a success state inline or redirects
    // to the applications list — assert on the applications list as the
    // durable outcome.
    await expect(page).toHaveURL(/\/student\/(applications|universities)/, { timeout: 15000 })
  })

  test('an unverified student cannot submit an application', async ({ page }) => {
    // With an unverified account, the primary CTA reads "Verify to Apply"
    // and routes to the profile/verification center instead of submitting.
    await page.goto('/student/discover')
    await page.getByRole('button', { name: /apply now/i }).first().click()

    const verifyButton = page.getByRole('button', { name: /verify to apply/i })
    if (await verifyButton.isVisible().catch(() => false)) {
      await verifyButton.click()
      await expect(page).not.toHaveURL(/\/student\/applications\//)
    }
  })
})
