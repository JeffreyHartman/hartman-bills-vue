// Shared login helper for E2E tests
export const TEST_EMAIL = 'e2e-test@example.com';
export const TEST_PASSWORD = 'e2eTestPass123';

export async function ensureLoggedIn(page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Fill credentials and try sign-in
  await page.fill('#email', TEST_EMAIL);
  await page.fill('#password', TEST_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for either: navigation away from login, or error message
  const errorLocator = page.locator('.text-status-overdue');
  const navigated = page.waitForURL(/.*(?<!login)$/, { timeout: 8000 }).then(() => true).catch(() => false);
  const errored = errorLocator.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);

  const didNavigate = await navigated;
  if (didNavigate) return;

  const hasError = await errored;
  if (!hasError) {
    // Neither navigated nor errored — wait a bit more
    await page.waitForTimeout(2000);
    if (!page.url().includes('/login')) return;
  }

  // Sign-in failed — account doesn't exist. Create it.
  await page.getByText('Need an account? Sign up').click();
  await page.waitForTimeout(300);
  await page.fill('#email', TEST_EMAIL);
  await page.fill('#password', TEST_PASSWORD);
  await page.getByRole('button', { name: 'Create Account' }).click();

  // After sign-up, either we get redirected or we need to sign in manually
  try {
    await page.waitForURL(/.*(?<!login)$/, { timeout: 8000 });
    return;
  } catch {
    // Sign-up may have required confirmation — try signing in now
  }

  // If we're still on login, the account was created but needs sign-in
  if (page.url().includes('/login')) {
    // Make sure we're in sign-in mode
    const signUpToggle = page.getByText('Already have an account? Sign in');
    if (await signUpToggle.isVisible().catch(() => false)) {
      await signUpToggle.click();
      await page.waitForTimeout(300);
    }
    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/.*(?<!login)$/, { timeout: 8000 });
  }
}

export async function ensureTestBillExists(page) {
  await ensureLoggedIn(page);

  // Check if there are any bills already
  await page.waitForLoadState('networkidle');
  const bills = page.locator('.card a');
  const count = await bills.count().catch(() => 0);
  if (count > 0) return;

  // No bills — create one via the UI
  const addButton = page.getByLabel('Add new bill');
  await addButton.waitFor({ state: 'visible', timeout: 5000 });
  await addButton.click();
  await page.fill('#name', 'E2E Test Bill');
  await page.fill('#amount', '42.50');
  await page.fill('#dueDate', '2026-12-15');
  await page.getByRole('button', { name: 'Add Bill' }).click();
  await page.waitForURL(/.*(?<!new)$/, { timeout: 8000 });
}
