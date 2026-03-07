import { test, expect } from '@playwright/test';

test.describe('Bills App', () => {
  test('loads the main page with summary stats and bill list', async ({ page }) => {
    await page.goto('/');
    // Summary stats should be visible
    await expect(page.getByRole('button', { name: 'Upcoming' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Overdue' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Recurring' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Paid' })).toBeVisible();
  });

  test('can navigate to bill details', async ({ page }) => {
    await page.goto('/');
    // Click on the first bill in the list
    const firstBill = page.locator('.card a').first();
    await firstBill.click();

    // Should see the details page
    await expect(page.locator('text=Details')).toBeVisible();
    await expect(page.locator('text=Due Date')).toBeVisible();
    await expect(page.locator('text=Frequency')).toBeVisible();
  });

  test('can mark a bill as paid and unpaid', async ({ page }) => {
    await page.goto('/');

    // Navigate to a bill detail (upcoming tab should have unpaid bills)
    const billLink = page.locator('.card a').first();
    await billLink.click();

    // Mark as paid
    const markPaidBtn = page.getByRole('button', { name: 'Mark Paid' });
    await expect(markPaidBtn).toBeVisible();
    await markPaidBtn.click();

    // Should now show "Mark Unpaid"
    await expect(page.getByRole('button', { name: 'Mark Unpaid' })).toBeVisible();

    // Mark unpaid
    await page.getByRole('button', { name: 'Mark Unpaid' }).click();
    await expect(page.getByRole('button', { name: 'Mark Paid' })).toBeVisible();
  });

  test('can switch between tabs', async ({ page }) => {
    await page.goto('/');

    // Click overdue tab
    await page.getByRole('button', { name: 'Overdue' }).click();
    // The overdue tab should be visually active (has shadow)
    const overdueBtn = page.getByRole('button', { name: 'Overdue' });
    await expect(overdueBtn).toHaveClass(/shadow-card/);

    // Switch to recurring
    await page.getByRole('button', { name: 'Recurring' }).click();
    const recurringBtn = page.getByRole('button', { name: 'Recurring' });
    await expect(recurringBtn).toHaveClass(/shadow-card/);
  });

  test('can navigate to add bill form and create a bill', async ({ page }) => {
    await page.goto('/');

    // Click FAB (add button)
    await page.getByLabel('Add new bill').click();

    // Should see the form
    await expect(page.locator('text=New Bill')).toBeVisible();

    // Fill the form
    await page.fill('#name', 'Test Bill');
    await page.fill('#amount', '99.99');
    await page.fill('#dueDate', '2026-12-25');

    // Submit
    await page.getByRole('button', { name: 'Add Bill' }).click();

    // Should redirect to home
    await expect(page).toHaveURL('/');
  });

  test('can edit an existing bill', async ({ page }) => {
    await page.goto('/');

    // Navigate to first bill detail
    const billLink = page.locator('.card a').first();
    await billLink.click();

    // Click edit
    await page.getByRole('link', { name: 'Edit' }).click();

    // Should see edit form with pre-filled data
    await expect(page.locator('text=Edit Bill')).toBeVisible();
    const nameInput = page.locator('#name');
    await expect(nameInput).not.toHaveValue('');

    // Modify and save
    await nameInput.fill('Updated Bill Name');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Should redirect to home
    await expect(page).toHaveURL('/');
  });

  test('can delete a bill', async ({ page }) => {
    await page.goto('/');

    // Navigate to a bill
    const billLink = page.locator('.card a').first();
    await billLink.click();

    // Click delete and confirm
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Delete this bill' }).click();

    // Should redirect to home
    await expect(page).toHaveURL('/');
  });

  test('dark mode toggle works', async ({ page }) => {
    await page.goto('/');

    // Toggle dark mode
    const darkToggle = page.getByLabel(/Switch to dark mode/i);
    await darkToggle.click();

    // Check that dark class is applied
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    // Toggle back
    const lightToggle = page.getByLabel(/Switch to light mode/i);
    await lightToggle.click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test('responsive: shows properly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // App should still be functional
    await expect(page.getByRole('button', { name: 'Upcoming' })).toBeVisible();
    await expect(page.getByLabel('Add new bill')).toBeVisible();
  });
});
