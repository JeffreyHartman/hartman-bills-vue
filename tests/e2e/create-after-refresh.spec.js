import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './auth.setup.js';

test('can create a bill after page refresh', async ({ page }) => {
  // Login and refresh to simulate returning user
  await ensureLoggedIn(page);
  await page.reload({ waitUntil: 'networkidle' });

  // Wait for page to be ready after refresh
  const fab = page.getByLabel('Add new bill');
  await fab.waitFor({ state: 'visible', timeout: 15000 });

  // Navigate to add bill form
  await fab.click();
  await page.waitForLoadState('networkidle');

  // Fill the form
  await page.fill('#name', 'Post-Refresh Bill');
  await page.fill('#amount', '1500');
  await page.fill('#dueDate', '2026-04-15');

  // Click Save and verify navigation back to bills list
  await page.getByRole('button', { name: 'Add Bill' }).click();
  await page.waitForURL('/', { timeout: 15000 });
  expect(page.url()).toContain('/');
});
