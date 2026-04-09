import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
  });

  test('successful login with admin credentials redirects to employee list', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'password');

    await expect(page).toHaveURL(/\/list/);
    expect(await page.evaluate(() => localStorage.getItem('loggedIn'))).toBe('true');
    expect(await page.evaluate(() => localStorage.getItem('username'))).toBe('admin');
  });

  test('successful login with user credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('user', '123456');

    await expect(page).toHaveURL(/\/list/);
    expect(await page.evaluate(() => localStorage.getItem('username'))).toBe('user');
  });

  test('successful login with test credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('test', 'test123');

    await expect(page).toHaveURL(/\/list/);
  });

  test('failed login with wrong password shows error and stays on login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'wrongpassword');

    await expect(loginPage.getErrorMessage('Invalid username or password')).toBeVisible();
    expect(await loginPage.isOnLoginPage()).toBe(true);
    expect(await page.evaluate(() => localStorage.getItem('loggedIn'))).toBeNull();
  });

  test('failed login with unknown username shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('nobody', 'password');

    await expect(loginPage.getErrorMessage('Invalid username or password')).toBeVisible();
  });

  test('accessing /list without login redirects to /login', async ({ page }) => {
    await page.goto('/list');
    await expect(page).toHaveURL(/\/login/);
  });

  test('accessing /form without login redirects to /login', async ({ page }) => {
    await page.goto('/form');
    await expect(page).toHaveURL(/\/login/);
  });

  test('accessing / without login redirects to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('logout clears localStorage and redirects to login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'password');
    await expect(page).toHaveURL(/\/list/);

    await page.getByRole('button', { name: 'Logoff' }).click();

    await expect(page).toHaveURL(/\/login/);
    expect(await page.evaluate(() => localStorage.getItem('loggedIn'))).toBeNull();
  });
});
