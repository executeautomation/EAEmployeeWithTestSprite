import { test, expect } from '@playwright/test';
import { EmployeeListPage } from '../pages/EmployeeListPage';
import { EmployeeFormPage } from '../pages/EmployeeFormPage';
import { loginViaStorage, clearAllEmployees, createEmployee } from '../helpers';

test.describe('Employee CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Start every test with an empty employee table and a logged-in session
    await clearAllEmployees();
    await loginViaStorage(page);
  });

  // ── ADD ──────────────────────────────────────────────────────────────────────

  test('add a new employee - appears in the list', async ({ page }) => {
    const listPage = new EmployeeListPage(page);
    const formPage = new EmployeeFormPage(page);

    const initialCount = await listPage.getEmployeeCount();

    await listPage.clickAddEmployee();
    await formPage.fill('Jane Doe', 'jane@example.com', 'Engineer');
    await formPage.submitAdd();

    await expect(formPage.getSuccessAlert()).toBeVisible();

    // Dialog closes automatically after 1.5 s — wait for it
    await expect(page.getByRole('dialog', { name: 'Add Employee' })).not.toBeVisible({
      timeout: 5000,
    });

    await expect(listPage.isEmployeeVisible('Jane Doe')).toBeVisible();
    expect(await listPage.getEmployeeCount()).toBe(initialCount + 1);
  });

  test('add employee shows name, email and position in the table row', async ({ page }) => {
    const listPage = new EmployeeListPage(page);
    const formPage = new EmployeeFormPage(page);

    await listPage.clickAddEmployee();
    await formPage.fill('Alice Green', 'alice@company.com', 'Product Manager');
    await formPage.submitAdd();

    await expect(page.getByRole('dialog', { name: 'Add Employee' })).not.toBeVisible({
      timeout: 5000,
    });

    const row = page.locator('tbody tr').filter({ hasText: 'Alice Green' });
    await expect(row.getByText('alice@company.com')).toBeVisible();
    await expect(row.getByText('Product Manager')).toBeVisible();
  });

  // ── EDIT ─────────────────────────────────────────────────────────────────────

  test('edit an employee - updated position reflected in list', async ({ page }) => {
    await createEmployee('John Smith', 'john@example.com', 'Developer');

    const listPage = new EmployeeListPage(page);
    await page.reload();
    await listPage.waitForList();
    await expect(listPage.isEmployeeVisible('John Smith')).toBeVisible();

    await listPage.clickEditFor('John Smith');

    const formPage = new EmployeeFormPage(page);
    await formPage.positionInput.clear();
    await formPage.positionInput.fill('Senior Developer');
    await formPage.submitUpdate();

    await expect(formPage.getSuccessAlert()).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Edit Employee' })).not.toBeVisible({
      timeout: 5000,
    });

    await expect(listPage.isEmployeeVisible('Senior Developer')).toBeVisible();
  });

  test('edit dialog is pre-populated with the existing employee data', async ({ page }) => {
    await createEmployee('Bob Builder', 'bob@example.com', 'Architect');

    const listPage = new EmployeeListPage(page);
    await page.reload();
    await listPage.waitForList();

    await listPage.clickEditFor('Bob Builder');

    const formPage = new EmployeeFormPage(page);
    await expect(formPage.nameInput).toHaveValue('Bob Builder');
    await expect(formPage.emailInput).toHaveValue('bob@example.com');
    await expect(formPage.positionInput).toHaveValue('Architect');
  });

  // ── DELETE ───────────────────────────────────────────────────────────────────

  test('delete an employee - removed from list', async ({ page }) => {
    await createEmployee('Bob Jones', 'bobjones@example.com', 'Manager');

    const listPage = new EmployeeListPage(page);
    await page.reload();
    await listPage.waitForList();
    await expect(listPage.isEmployeeVisible('Bob Jones')).toBeVisible();

    await listPage.clickDeleteFor('Bob Jones');
    await listPage.confirmDelete();

    await expect(listPage.isEmployeeVisible('Bob Jones')).not.toBeVisible({ timeout: 5000 });
  });

  test('delete confirmation dialog shows the employee name', async ({ page }) => {
    await createEmployee('Carol White', 'carol@example.com', 'Designer');

    const listPage = new EmployeeListPage(page);
    await page.reload();
    await listPage.waitForList();

    await listPage.clickDeleteFor('Carol White');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Carol White')).toBeVisible();
  });

  test('cancel delete keeps employee in list', async ({ page }) => {
    await createEmployee('Dave Clark', 'dave@example.com', 'QA');

    const listPage = new EmployeeListPage(page);
    await page.reload();
    await listPage.waitForList();

    await listPage.clickDeleteFor('Dave Clark');

    // Click Cancel instead of Delete
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await expect(listPage.isEmployeeVisible('Dave Clark')).toBeVisible();
  });

  // ── VALIDATION ───────────────────────────────────────────────────────────────

  test('submitting add form with empty fields does not add employee (HTML5 validation)', async ({
    page,
  }) => {
    const listPage = new EmployeeListPage(page);
    await listPage.clickAddEmployee();

    // Click submit without filling fields — HTML5 `required` prevents submission
    await page.getByRole('button', { name: 'Add Employee' }).click();

    // Dialog must still be open
    await expect(page.getByRole('dialog', { name: 'Add Employee' })).toBeVisible();

    // No employee was added
    expect(await listPage.getEmployeeCount()).toBe(0);
  });

  // ── VIEW ─────────────────────────────────────────────────────────────────────

  test('view dialog shows employee details', async ({ page }) => {
    await createEmployee('Eve Adams', 'eve@example.com', 'DevOps');

    const listPage = new EmployeeListPage(page);
    await page.reload();
    await listPage.waitForList();

    await listPage.clickViewFor('Eve Adams');

    const dialog = page.getByRole('dialog', { name: 'Employee Details' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Eve Adams')).toBeVisible();
    await expect(dialog.getByText('eve@example.com')).toBeVisible();
    await expect(dialog.getByText('DevOps')).toBeVisible();
  });
});
