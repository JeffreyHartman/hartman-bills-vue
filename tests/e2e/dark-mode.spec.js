import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './auth.setup.js';

test.describe('Dark mode persistence', () => {
  test('dark mode persists across page refresh', async ({ page }) => {
    await ensureLoggedIn(page);
    await page.getByRole('button', { name: 'Upcoming' }).waitFor({ state: 'visible', timeout: 10000 });

    // Enable dark mode
    const darkToggle = page.getByLabel(/Switch to dark mode/i);
    await darkToggle.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Refresh and verify it persists
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Upcoming' }).waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Toggle back to light mode
    const lightToggle = page.getByLabel(/Switch to light mode/i);
    await lightToggle.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // Refresh and verify light mode persists
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Upcoming' }).waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});
