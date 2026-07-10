import { test, expect } from '@playwright/test'

// NOTE: this suite exercises the real Firebase project (eduing-platform)
// configured in lib/firebase/config.ts unless NEXT_PUBLIC_FIREBASE_* env
// vars point it at a dedicated test project / emulator. Run against a test
// project — this creates real users/documents otherwise. Emails are
// timestamped to avoid colliding with previous runs.

test.describe('Student registration', () => {
  test('completes the 5-step registration wizard', async ({ page }) => {
    const testEmail = `e2e-test-${Date.now()}@example.com`

    await page.goto('/auth/student/register')

    // Step 1: Account
    await page.fill('#fullName', 'E2E Test Student')
    await page.fill('#email', testEmail)
    await page.fill('#password', 'TestPassword123!')
    await page.fill('#confirmPassword', 'TestPassword123!')
    await page.getByRole('button', { name: /next phase/i }).click()

    // Step 2: Contact
    await expect(page.getByText('Step 2 of 5')).toBeVisible()
    await page.fill('#phone', '9876543210')
    await page.fill('#dob', '2005-01-15')
    await page.fill('#state', 'Karnataka')
    await page.fill('#city', 'Bengaluru')
    await page.getByRole('button', { name: /next phase/i }).click()

    // Step 3: Academic
    await expect(page.getByText('Step 3 of 5')).toBeVisible()
    await page.fill('#tenthPercentage', '92')
    await page.fill('#twelfthPercentage', '89')
    await page.fill('#entranceExam', 'JEE Main')
    await page.fill('#entranceScore', '95.5')
    await page.getByRole('button', { name: /next phase/i }).click()

    // Step 4: Identity verification (category/nationality)
    await expect(page.getByText('Step 4 of 5')).toBeVisible()
    await page.fill('#nationality', 'Indian')
    await page.getByRole('button', { name: /next phase/i }).click()

    // Step 5: Review + submit
    await expect(page.getByText('Step 5 of 5')).toBeVisible()
    await page.getByRole('button', { name: /finalize registration/i }).click()

    // Successful registration redirects to onboarding or dashboard
    await expect(page).toHaveURL(/\/student\/(onboarding|dashboard)/, { timeout: 15000 })
  })
})
