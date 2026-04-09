import { Page, Locator } from '@playwright/test';

export class EmployeeListPage {
  readonly page: Page;
  readonly addButton: Locator;
  readonly searchInput: Locator;
  readonly tableBody: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addButton = page.getByRole('button', { name: /\+ Add Employee/i });
    this.searchInput = page.getByLabel('Search employees');
    this.tableBody = page.locator('tbody');
  }

  async goto() {
    await this.page.goto('/list');
    await this.waitForList();
  }

  /**
   * Wait for the employee table to be present in the DOM.
   */
  async waitForList() {
    await this.page.waitForSelector('tbody', { state: 'visible' });
  }

  async clickAddEmployee() {
    await this.addButton.click();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async clearSearch() {
    await this.searchInput.clear();
  }

  /**
   * Returns a locator for a cell in the table matching the employee's name.
   * Usage: await expect(listPage.isEmployeeVisible('Jane Doe')).toBeVisible()
   */
  isEmployeeVisible(name: string): Locator {
    return this.tableBody.getByText(name, { exact: true });
  }

  /**
   * Count the number of data rows (excludes the "No employees found." empty row).
   */
  async getEmployeeCount(): Promise<number> {
    const emptyMsg = this.page.getByText('No employees found.');
    if (await emptyMsg.isVisible()) return 0;
    return this.page.locator('tbody tr').count();
  }

  /**
   * Click the Edit button in the row containing the given employee name.
   */
  async clickEditFor(name: string) {
    const row = this.page.locator('tbody tr').filter({ hasText: name });
    await row.getByRole('button', { name: 'Edit' }).click();
  }

  /**
   * Click the Delete button in the row containing the given employee name.
   */
  async clickDeleteFor(name: string) {
    const row = this.page.locator('tbody tr').filter({ hasText: name });
    await row.getByRole('button', { name: 'Delete' }).click();
  }

  /**
   * Click the "Delete" confirm button inside the delete confirmation dialog.
   */
  async confirmDelete() {
    const dialog = this.page.getByRole('dialog');
    // The dialog contains a "Cancel" button and a "Delete" button (variant="contained").
    // We pick the one scoped inside the dialog.
    await dialog.getByRole('button', { name: 'Delete' }).click();
  }

  /**
   * Click the View button for the given employee.
   */
  async clickViewFor(name: string) {
    const row = this.page.locator('tbody tr').filter({ hasText: name });
    await row.getByRole('button', { name: 'View' }).click();
  }
}
