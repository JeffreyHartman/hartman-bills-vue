import { test, expect } from '@playwright/test';
import { ensureLoggedIn, ensureTestBillExists } from './auth.setup.js';

// Helper: wait for the bills page to be fully loaded (tabs visible)
async function waitForBillsPage(page) {
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Upcoming' }).waitFor({ state: 'visible', timeout: 10000 });
}

// Helper: navigate to bills page with auth
async function gotoBillsPage(page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  // If redirected to login, auth session may not be loaded yet — wait for navigation
  if (page.url().includes('/login')) {
    await page.waitForURL(/.*(?<!login)$/, { timeout: 10000 });
  }
  await waitForBillsPage(page);
}

test.describe('Bills App', () => {
  test.beforeEach(async ({ page }) => {
    await ensureTestBillExists(page);
  });

  test('loads the main page with tabs', async ({ page }) => {
    // beforeEach already left us on the bills page
    await waitForBillsPage(page);
    await expect(page.getByRole('button', { name: 'Upcoming' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Overdue' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Recurring' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Paid' })).toBeVisible();
  });

  test('can navigate to bill details', async ({ page }) => {
    await waitForBillsPage(page);
    const firstBill = page.locator('.card a').first();
    await firstBill.waitFor({ state: 'visible', timeout: 10000 });
    await firstBill.click();

    await expect(page.locator('.card h2')).toBeVisible();
    await expect(page.locator('text=Due Date')).toBeVisible();
    await expect(page.locator('text=Frequency')).toBeVisible();
  });

  test('can mark a bill as paid and unpaid', async ({ page }) => {
    await waitForBillsPage(page);
    const billLink = page.locator('.card a').first();
    await billLink.waitFor({ state: 'visible', timeout: 10000 });
    await billLink.click();

    const markPaidBtn = page.getByRole('button', { name: 'Mark Paid' });
    await expect(markPaidBtn).toBeVisible({ timeout: 5000 });
    await markPaidBtn.click();
    await expect(page.getByRole('button', { name: 'Mark Unpaid' })).toBeVisible();

    await page.getByRole('button', { name: 'Mark Unpaid' }).click();
    await expect(page.getByRole('button', { name: 'Mark Paid' })).toBeVisible();
  });

  test('can switch between tabs', async ({ page }) => {
    await waitForBillsPage(page);

    await page.getByRole('button', { name: 'Overdue' }).click();
    const overdueBtn = page.getByRole('button', { name: 'Overdue' });
    await expect(overdueBtn).toHaveClass(/shadow-card/);

    await page.getByRole('button', { name: 'Recurring' }).click();
    const recurringBtn = page.getByRole('button', { name: 'Recurring' });
    await expect(recurringBtn).toHaveClass(/shadow-card/);
  });

  test('can navigate to add bill form and create a bill', async ({ page }) => {
    await waitForBillsPage(page);

    const fab = page.getByLabel('Add new bill');
    await fab.waitFor({ state: 'visible', timeout: 10000 });
    await fab.click();
    await expect(page.locator('text=New Bill')).toBeVisible();

    await page.fill('#name', 'Playwright Test Bill');
    await page.fill('#amount', '99.99');
    await page.fill('#dueDate', '2026-12-25');

    await page.getByRole('button', { name: 'Add Bill' }).click();
    await page.waitForURL(/.*(?<!new)$/, { timeout: 10000 });
  });

  test('can edit an existing bill', async ({ page }) => {
    await waitForBillsPage(page);

    const billLink = page.locator('.card a').first();
    await billLink.waitFor({ state: 'visible', timeout: 10000 });
    await billLink.click();

    await page.getByRole('link', { name: 'Edit' }).click();
    await expect(page.locator('text=Edit Bill')).toBeVisible();

    const nameInput = page.locator('#name');
    await expect(nameInput).not.toHaveValue('');

    await nameInput.fill('Updated Bill Name');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await page.waitForURL(/.*(?<!edit)$/, { timeout: 10000 });
  });

  test('can delete a bill', async ({ page }) => {
    await waitForBillsPage(page);

    // Create a bill to delete
    const fab = page.getByLabel('Add new bill');
    await fab.waitFor({ state: 'visible', timeout: 10000 });
    await fab.click();
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const futureDate = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`;
    await page.fill('#name', 'Bill To Delete');
    await page.fill('#amount', '1.00');
    await page.fill('#dueDate', futureDate);
    await page.getByRole('button', { name: 'Add Bill' }).click();
    await page.waitForURL(/.*(?<!new)$/, { timeout: 10000 });
    await waitForBillsPage(page);

    // Find and navigate to the bill we just created
    const billLink = page.locator('.card a', { hasText: 'Bill To Delete' }).first();
    await billLink.waitFor({ state: 'visible', timeout: 10000 });
    await billLink.click();

    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Delete this bill' }).click();
    await page.waitForURL('/', { timeout: 10000 });
  });

  test('dark mode toggle works', async ({ page }) => {
    await waitForBillsPage(page);

    const darkToggle = page.getByLabel(/Switch to dark mode/i);
    await darkToggle.click();

    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    const lightToggle = page.getByLabel(/Switch to light mode/i);
    await lightToggle.click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test('responsive: shows properly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await waitForBillsPage(page);

    await expect(page.getByRole('button', { name: 'Upcoming' })).toBeVisible();
    await expect(page.getByLabel('Add new bill')).toBeVisible();
  });
});

test.describe('Authentication', () => {
  test('redirects to login page when not authenticated', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('can sign in with valid credentials', async ({ page }) => {
    await ensureLoggedIn(page);
    await expect(page).toHaveURL('/');
  });

  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'nonexistent@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.locator('.text-status-overdue')).toBeVisible();
  });
});

test.describe('Input Validation', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
    // Wait for the FAB to appear (confirms auth + page loaded)
    const fab = page.getByLabel('Add new bill');
    await fab.waitFor({ state: 'visible', timeout: 10000 });
    await fab.click();
    await page.waitForLoadState('networkidle');
  });

  test('amount field only accepts monetary values', async ({ page }) => {
    const amountInput = page.locator('#amount');

    // Type valid amount
    await amountInput.fill('123.45');
    await expect(amountInput).toHaveValue('123.45');

    // Clear and type with letters — input handler strips non-numeric chars
    await amountInput.fill('');
    await amountInput.type('abc');
    const value = await amountInput.inputValue();
    expect(value).toBe('');
  });

  test('amount field handles pasted values with commas', async ({ page }) => {
    const amountInput = page.locator('#amount');

    // Fill simulates paste (triggers input event)
    await amountInput.fill('$1,234.56');
    const value = await amountInput.inputValue();
    expect(value).toBe('1234.56');
  });

  test('amount field limits decimal places to 2', async ({ page }) => {
    const amountInput = page.locator('#amount');

    await amountInput.fill('99.999');
    const value = await amountInput.inputValue();
    expect(value).toBe('99.99');
  });

  test('shows validation error for empty amount', async ({ page }) => {
    await page.fill('#name', 'Test Bill');
    await page.fill('#dueDate', '2026-12-25');

    await page.getByRole('button', { name: 'Add Bill' }).click();

    await expect(page.locator('text=valid amount')).toBeVisible();
  });

  test('shows validation error for empty name', async ({ page }) => {
    const amountInput = page.locator('#amount');
    await amountInput.fill('50');
    await page.fill('#dueDate', '2026-12-25');

    await page.getByRole('button', { name: 'Add Bill' }).click();

    await expect(page.locator('text=Bill name is required')).toBeVisible();
  });

  test('interval field only accepts digits', async ({ page }) => {
    // Enable recurring
    const toggle = page.locator('[role="switch"]');
    await toggle.click();

    const intervalInput = page.locator('#interval');
    await intervalInput.fill('');
    await intervalInput.type('abc12xyz');
    const value = await intervalInput.inputValue();
    // Only digits should remain
    expect(value.replace(/[^\d]/g, '')).toBe(value);
  });

  test('bill name has max length', async ({ page }) => {
    const nameInput = page.locator('#name');
    expect(await nameInput.getAttribute('maxlength')).toBe('100');
  });
});
