import { test, expect } from '@playwright/test';
import { loginViaStorage } from '../helpers';

test.describe('UI Behavior and Theming', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaStorage(page);
  });

  // ── DARK MODE ────────────────────────────────────────────────────────────────

  test('dark mode toggle switches the app to dark theme', async ({ page }) => {
    const body = page.locator('body');

    // Start in light mode
    await expect(body).not.toHaveCSS('background-color', 'rgb(18, 18, 18)');

    // The theme toggle is the last button in the AppBar header
    await page.locator('header').getByRole('button').last().click();

    // MUI CssBaseline applies rgb(18, 18, 18) as dark-mode background
    await expect(body).toHaveCSS('background-color', 'rgb(18, 18, 18)');
  });

  test('clicking dark mode toggle twice returns to light theme', async ({ page }) => {
    const body = page.locator('body');
    const themeToggle = page.locator('header').getByRole('button').last();

    await themeToggle.click();
    await expect(body).toHaveCSS('background-color', 'rgb(18, 18, 18)');

    await themeToggle.click();
    await expect(body).not.toHaveCSS('background-color', 'rgb(18, 18, 18)');
  });

  // ── NAVIGATION ───────────────────────────────────────────────────────────────

  test('Employee List nav link navigates to /list', async ({ page }) => {
    await page.getByRole('link', { name: 'Employee List' }).click();
    await expect(page).toHaveURL(/\/list/);
  });

  test('Add Employee nav link navigates to /form', async ({ page }) => {
    await page.getByRole('link', { name: 'Add Employee' }).click();
    await expect(page).toHaveURL(/\/form/);
    await expect(page.getByRole('button', { name: 'Add Employee' })).toBeVisible();
  });

  // ── APP BAR ──────────────────────────────────────────────────────────────────

  test('app bar shows navigation links and logout when logged in', async ({ page }) => {
    const header = page.locator('header');
    await expect(header.getByRole('link', { name: 'Add Employee' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Employee List' })).toBeVisible();
    await expect(header.getByRole('button', { name: 'Logoff' })).toBeVisible();
  });

  test('app title "Employee Manager" is always visible', async ({ page }) => {
    await expect(page.getByText('Employee Manager')).toBeVisible();
  });

  // ── RESPONSIVE LAYOUT ────────────────────────────────────────────────────────

  test('no horizontal overflow on a 375 px mobile viewport (employee list)', async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const mobilePage = await context.newPage();

    try {
      await mobilePage.goto('/login');
      await mobilePage.evaluate(() => {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('username', 'admin');
      });
      await mobilePage.goto('/list');
      await mobilePage.waitForSelector('tbody', { state: 'visible' });

      const hasOverflow = await mobilePage.evaluate(
        () => document.body.scrollWidth > document.body.clientWidth
      );
      expect(hasOverflow).toBe(false);
    } finally {
      await context.close();
    }
  });

  test('login page is usable on a 375 px mobile viewport', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const mobilePage = await context.newPage();

    try {
      await mobilePage.goto('/login');

      await expect(mobilePage.getByLabel('Username')).toBeVisible();
      await expect(mobilePage.getByLabel('Password')).toBeVisible();
      await expect(mobilePage.getByRole('button', { name: 'Login' })).toBeVisible();

      const hasOverflow = await mobilePage.evaluate(
        () => document.body.scrollWidth > document.body.clientWidth
      );
      expect(hasOverflow).toBe(false);
    } finally {
      await context.close();
    }
  });
});
