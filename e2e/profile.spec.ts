import { test, expect } from '@playwright/test'
import { loginAsDemo } from './auth-helper'

test.describe('Student profile', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page)
  })

  test('loads the profile page and displays Admission Identity', async ({ page }) => {
    await page.goto('/student/profile')

    await expect(page.getByRole('button', { name: /edit profile/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Admission Identity' }).first()).toBeVisible()
    await expect(page.getByText('Profile Strength')).toBeVisible()
    
    // Check cards
    await expect(page.getByText('Full Name')).toBeVisible()
    await expect(page.getByText('Email')).toBeVisible()
    await expect(page.getByText('Phone')).toBeVisible()
  })

  test('Academic Journey and AI Insights render correctly', async ({ page }) => {
    await page.goto('/student/profile')

    await expect(page.getByText('Academic Journey')).toBeVisible()
    await expect(page.getByText('AI Insights')).toBeVisible()
    await expect(page.getByText('Documents')).toBeVisible()
    
    // Check timeline items
    await expect(page.getByText('10th Standard')).toBeVisible()
    await expect(page.getByText('12th Standard')).toBeVisible()
    await expect(page.getByText('Entrance Exams')).toBeVisible()
  })
})
