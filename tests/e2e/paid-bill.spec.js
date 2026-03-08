import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './auth.setup.js';

async function waitForBillsPage(page) {
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Upcoming' }).waitFor({ state: 'visible', timeout: 10000 });
}

test.describe('Paid bill visibility', () => {
  test('marking a bill paid removes it from Upcoming and adds it to Paid', async ({ page }) => {
    await ensureLoggedIn(page);
    await waitForBillsPage(page);

    // Create a test bill due in the future
    const fab = page.getByLabel('Add new bill');
    await fab.waitFor({ state: 'visible', timeout: 10000 });
    await fab.click();
    await page.fill('#name', 'Paid Test Bill');
    await page.fill('#amount', '42.00');

    // Set due date to 10 days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const dateStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`;
    await page.fill('#dueDate', dateStr);
    await page.getByRole('button', { name: 'Add Bill' }).click();
    await page.waitForURL(/.*(?<!new)$/, { timeout: 10000 });
    await waitForBillsPage(page);

    // Verify it's in the Upcoming tab
    await page.getByRole('button', { name: 'Upcoming' }).click();
    await expect(page.locator('.card a', { hasText: 'Paid Test Bill' })).toBeVisible();

    // Navigate to its details and mark as paid
    await page.locator('.card a', { hasText: 'Paid Test Bill' }).click();
    const markPaidBtn = page.getByRole('button', { name: 'Mark Paid' });
    await markPaidBtn.waitFor({ state: 'visible', timeout: 5000 });
    await markPaidBtn.click();
    await expect(page.getByRole('button', { name: 'Mark Unpaid' })).toBeVisible();

    // Go back to bills list
    await page.getByLabel('Go back').click();
    await waitForBillsPage(page);

    // Verify it's NOT in Upcoming
    await page.getByRole('button', { name: 'Upcoming' }).click();
    await expect(page.locator('.card a', { hasText: 'Paid Test Bill' })).not.toBeVisible();

    // Verify it IS in Paid tab
    await page.getByRole('button', { name: 'Paid' }).click();
    await expect(page.locator('.card a', { hasText: 'Paid Test Bill' })).toBeVisible();

    // Clean up: mark unpaid then delete
    await page.locator('.card a', { hasText: 'Paid Test Bill' }).click();
    await page.getByRole('button', { name: 'Mark Unpaid' }).click();
    await expect(page.getByRole('button', { name: 'Mark Paid' })).toBeVisible();
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Delete this bill' }).click();
    await page.waitForURL('/', { timeout: 10000 });
  });
});
