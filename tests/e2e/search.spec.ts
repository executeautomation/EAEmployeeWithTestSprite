import { test, expect } from '@playwright/test';
import { EmployeeListPage } from '../pages/EmployeeListPage';
import { loginViaStorage, clearAllEmployees, createEmployee } from '../helpers';

test.describe('Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllEmployees();
    await createEmployee('Alice Martin', 'alice@example.com', 'Developer');
    await createEmployee('Bob Taylor', 'bob@example.com', 'Designer');
    await createEmployee('Carol White', 'carol@example.com', 'Developer');

    await loginViaStorage(page);

    // Wait for all three employees to be visible before each test
    await expect(page.getByText('Alice Martin')).toBeVisible();
    await expect(page.getByText('Bob Taylor')).toBeVisible();
    await expect(page.getByText('Carol White')).toBeVisible();
  });

  test('search by name shows only the matching employee', async ({ page }) => {
    const listPage = new EmployeeListPage(page);
    await listPage.search('Alice');

    await expect(listPage.isEmployeeVisible('Alice Martin')).toBeVisible();
    await expect(listPage.isEmployeeVisible('Bob Taylor')).not.toBeVisible();
    await expect(listPage.isEmployeeVisible('Carol White')).not.toBeVisible();
  });

  test('search is case-insensitive', async ({ page }) => {
    const listPage = new EmployeeListPage(page);
    await listPage.search('alice');

    await expect(listPage.isEmployeeVisible('Alice Martin')).toBeVisible();
    await expect(listPage.isEmployeeVisible('Bob Taylor')).not.toBeVisible();
  });

  test('search by email shows only the matching employee', async ({ page }) => {
    const listPage = new EmployeeListPage(page);
    await listPage.search('bob@example.com');

    await expect(listPage.isEmployeeVisible('Bob Taylor')).toBeVisible();
    await expect(listPage.isEmployeeVisible('Alice Martin')).not.toBeVisible();
    await expect(listPage.isEmployeeVisible('Carol White')).not.toBeVisible();
  });

  test('search by position shows all employees with that position', async ({ page }) => {
    const listPage = new EmployeeListPage(page);
    await listPage.search('Developer');

    await expect(listPage.isEmployeeVisible('Alice Martin')).toBeVisible();
    await expect(listPage.isEmployeeVisible('Carol White')).toBeVisible();
    await expect(listPage.isEmployeeVisible('Bob Taylor')).not.toBeVisible();
  });

  test('search with no match shows "No employees found." message', async ({ page }) => {
    const listPage = new EmployeeListPage(page);
    await listPage.search('zzznomatch');

    await expect(page.getByText('No employees found.')).toBeVisible();
    expect(await listPage.getEmployeeCount()).toBe(0);
  });

  test('clearing the search restores all employees', async ({ page }) => {
    const listPage = new EmployeeListPage(page);

    await listPage.search('Alice');
    await expect(listPage.isEmployeeVisible('Bob Taylor')).not.toBeVisible();

    await listPage.clearSearch();

    await expect(listPage.isEmployeeVisible('Alice Martin')).toBeVisible();
    await expect(listPage.isEmployeeVisible('Bob Taylor')).toBeVisible();
    await expect(listPage.isEmployeeVisible('Carol White')).toBeVisible();
    expect(await listPage.getEmployeeCount()).toBe(3);
  });

  test('search by partial email filters correctly', async ({ page }) => {
    const listPage = new EmployeeListPage(page);
    await listPage.search('carol@');

    await expect(listPage.isEmployeeVisible('Carol White')).toBeVisible();
    await expect(listPage.isEmployeeVisible('Alice Martin')).not.toBeVisible();
    await expect(listPage.isEmployeeVisible('Bob Taylor')).not.toBeVisible();
  });
});
