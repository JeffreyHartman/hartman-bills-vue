import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './auth.setup.js';

async function waitForBillsPage(page) {
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Upcoming' }).waitFor({ state: 'visible', timeout: 10000 });
}

test.describe('Recurring tab', () => {
  test('recurring bill shows next due date, not absurd overdue count', async ({ page }) => {
    await ensureLoggedIn(page);
    await waitForBillsPage(page);

    // Create a recurring monthly bill
    const fab = page.getByLabel('Add new bill');
    await fab.waitFor({ state: 'visible', timeout: 10000 });
    await fab.click();
    await page.fill('#name', 'Recurring Tab Test');
    await page.fill('#amount', '50');

    // Enable recurring
    await page.locator('[role="switch"]').click();
    // Defaults to monthly interval 1, which is what we want

    await page.getByRole('button', { name: 'Add Bill' }).click();
    await page.waitForURL(/.*(?<!new)$/, { timeout: 10000 });
    await waitForBillsPage(page);

    // Switch to Recurring tab
    await page.getByRole('button', { name: 'Recurring' }).click();

    // The recurring bill should be visible
    const billItem = page.locator('.card a', { hasText: 'Recurring Tab Test' });
    await expect(billItem).toBeVisible();

    // Should NOT show thousands of days overdue — the due label should be reasonable
    // (a date, "Due today", "Due tomorrow", "X days left", or at most a few days overdue)
    const dueLabel = billItem.locator('p.text-xs');
    const text = await dueLabel.textContent();
    // Should not contain more than 3-digit overdue numbers
    expect(text).not.toMatch(/\d{4,} days overdue/);

    // Clean up: navigate to detail and delete
    await billItem.click();
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Delete this bill' }).click();
    await page.waitForURL('/', { timeout: 10000 });
  });
});
