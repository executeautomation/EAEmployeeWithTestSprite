import { Page, Locator } from '@playwright/test';

export class EmployeeFormPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly positionInput: Locator;

  constructor(page: Page) {
    this.page = page;
    // MUI TextField renders a label + input — getByLabel matches via aria-label / htmlFor
    this.nameInput = page.getByLabel('Name');
    this.emailInput = page.getByLabel('Email');
    this.positionInput = page.getByLabel('Position');
  }

  /**
   * Fill all three form fields at once.
   */
  async fill(name: string, email: string, position: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.positionInput.fill(position);
  }

  /**
   * Click the "Add Employee" submit button (used when adding a new employee).
   */
  async submitAdd() {
    await this.page.getByRole('button', { name: 'Add Employee' }).click();
  }

  /**
   * Click the "Update Employee" submit button (used when editing an existing employee).
   */
  async submitUpdate() {
    await this.page.getByRole('button', { name: 'Update Employee' }).click();
  }

  /**
   * Returns the MUI Alert with severity="error" shown on validation/API failure.
   */
  getErrorAlert(): Locator {
    return this.page.locator('[role="alert"]').filter({ hasText: /required|failed|error/i });
  }

  /**
   * Returns the MUI Alert with severity="success" shown after a successful operation.
   */
  getSuccessAlert(): Locator {
    return this.page.locator('[role="alert"]').filter({ hasText: /successfully/i });
  }
}
