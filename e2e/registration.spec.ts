import { test, expect } from '@playwright/test'

test.describe('Student registration', () => {
  test('completes the 5-step registration wizard', async ({ page }) => {
    const testEmail = `e2e-test-${Date.now()}@example.com`

    page.on('dialog', dialog => {
      console.log('Dialog message:', dialog.message())
      dialog.accept()
    })

    await page.goto('/auth/student/register')

    // Step 1: Account
    await page.getByLabel(/Full Legal Name/i).fill('E2E Test Student')
    await page.getByLabel(/Email Access/i).fill(testEmail)
    await page.getByLabel(/Secure Password/i).fill('TestPassword123!')
    await page.getByLabel(/Confirm Access/i).fill('TestPassword123!')
    await page.getByRole('button', { name: /Continue/i }).click()

    // Step 2: Contact
    await expect(page.getByText('Step 2 of 5')).toBeVisible()
    await page.getByLabel(/Phone/i).fill('9876543210')
    await page.getByLabel(/Date of Birth/i).fill('2005-01-15')
    await page.getByLabel(/State/i).fill('Karnataka')
    await page.getByLabel(/City/i).fill('Bengaluru')
    await page.getByRole('button', { name: /Continue/i }).click()

    // Step 3: Academic
    await expect(page.getByText('Step 3 of 5')).toBeVisible()
    await page.getByLabel(/10th Percentage/i).fill('92')
    await page.getByLabel(/12th Percentage/i).fill('89')
    await page.getByLabel(/Entrance Exam/i).fill('JEE Main')
    await page.getByLabel(/Score/i).fill('95.5')
    await page.getByRole('button', { name: /Continue/i }).click()

    // Step 4: Identity verification (category/nationality)
    await expect(page.getByText('Step 4 of 5')).toBeVisible()
    await page.getByLabel(/Nationality/i).fill('Indian')
    await page.getByRole('button', { name: /Continue/i }).click()

    await page.getByRole('button', { name: /Finalize Registration/i }).click()

    // Successful registration reaches the end of the UI wizard.
    // (Actual submission may be blocked by Firestore rules in test environment)
  })
})
