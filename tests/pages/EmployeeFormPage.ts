import { Page, Locator } from '@playwright/test';

export class EmployeeFormPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly positionInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByLabel('Name');
    this.emailInput = page.getByLabel('Email');
    this.positionInput = page.getByLabel('Position');
  }

  /** Fill all three form fields. */
  async fill(name: string, email: string, position: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.positionInput.fill(position);
  }

  /** Click "Add Employee" submit button. */
  async submitAdd() {
    await this.page.getByRole('button', { name: 'Add Employee' }).click();
  }

  /** Click "Update Employee" submit button (edit mode). */
  async submitUpdate() {
    await this.page.getByRole('button', { name: 'Update Employee' }).click();
  }

  /** MUI Alert shown on API/validation failure. */
  getErrorAlert(): Locator {
    return this.page.locator('[role="alert"]').filter({ hasText: /required|failed|error/i });
  }

  /** MUI Alert shown after a successful add or update. */
  getSuccessAlert(): Locator {
    return this.page.locator('[role="alert"]').filter({ hasText: /successfully/i });
  }
}
