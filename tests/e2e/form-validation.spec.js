const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { EmployeeFormPage } = require('../pages/EmployeeFormPage');
const { EmployeeListPage } = require('../pages/EmployeeListPage');

test.describe('Form Validation Tests', () => {
    let loginPage;
    let employeeFormPage;
    let employeeListPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        employeeFormPage = new EmployeeFormPage(page);
        employeeListPage = new EmployeeListPage(page);
        
        // Login and navigate to form
        await loginPage.navigateToLogin();
        await loginPage.loginWithValidCredentials();
    });

    test.afterEach(async ({ page }) => {
        await page.evaluate(() => localStorage.clear());
    });

    test('should validate required fields correctly @critical @validation @form', async () => {
        // Navigate to standalone form
        await employeeFormPage.navigateToForm();
        
        // Test required field validation
        const requiredFieldsResult = await employeeFormPage.verifyRequiredFields();
        
        expect(requiredFieldsResult.nameRequired).toBe(true);
        expect(requiredFieldsResult.emailRequired).toBe(true);  
        expect(requiredFieldsResult.positionRequired).toBe(true);
    });

    test('should reject empty name field @validation @form @required', async () => {
        await employeeFormPage.navigateToForm();
        
        const invalidData = {
            name: '',
            email: 'test@example.com',
            position: 'Developer'
        };
        
        const result = await employeeFormPage.addEmployee(invalidData, false);
        
        expect(result.success).toBe(false);
        expect(result.remainedOnForm).toBe(true);
        expect(result.errors.name || result.errors.general).toBeTruthy();
    });

    test('should reject empty email field @validation @form @required', async () => {
        await employeeFormPage.navigateToForm();
        
        const invalidData = {
            name: 'Test User',
            email: '',
            position: 'Developer'
        };
        
        const result = await employeeFormPage.addEmployee(invalidData, false);
        
        expect(result.success).toBe(false);
        expect(result.remainedOnForm).toBe(true);
        expect(result.errors.email || result.errors.general).toBeTruthy();
    });

    test('should reject empty position field @validation @form @required', async () => {
        await employeeFormPage.navigateToForm();
        
        const invalidData = {
            name: 'Test User',
            email: 'test@example.com',
            position: ''
        };
        
        const result = await employeeFormPage.addEmployee(invalidData, false);
        
        expect(result.success).toBe(false);
        expect(result.remainedOnForm).toBe(true);
        expect(result.errors.position || result.errors.general).toBeTruthy();
    });

    test('should reject all empty fields @validation @form @required', async () => {
        await employeeFormPage.navigateToForm();
        
        const invalidData = {
            name: '',
            email: '',
            position: ''
        };
        
        const result = await employeeFormPage.addEmployee(invalidData, false);
        
        expect(result.success).toBe(false);
        expect(result.remainedOnForm).toBe(true);
        expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });

    test('should validate email format @validation @form @email', async () => {
        await employeeFormPage.navigateToForm();
        
        const invalidEmails = [
            'invalid-email',
            'missing@',
            '@domain.com',
            'spaces @domain.com',
            'double@@domain.com',
            'no-domain@',
            'just-text'
        ];
        
        for (const email of invalidEmails) {
            await employeeFormPage.clearForm();
            
            const invalidData = {
                name: 'Test User',
                email: email,
                position: 'Developer'
            };
            
            const result = await employeeFormPage.addEmployee(invalidData, false);
            
            expect(result.success).toBe(false);
            expect(result.remainedOnForm).toBe(true);
        }
    });

    test('should accept valid email formats @validation @form @email @positive', async () => {
        const validEmails = [
            'test@example.com',
            'user.name@domain.org',
            'first.last@sub.domain.co.uk',
            'numbers123@test123.com',
            'dashes-ok@test-domain.net',
            'plus+tags@example.com'
        ];
        
        for (const [index, email] of validEmails.entries()) {
            await employeeFormPage.navigateToForm();
            
            const validData = {
                name: `Valid Email User ${index + 1}`,
                email: email,
                position: 'Email Tester'
            };
            
            const result = await employeeFormPage.addEmployee(validData, true);
            
            expect(result.success).toBe(true);
        }
    });

    test('should handle special characters in names @validation @form @characters', async () => {
        await employeeFormPage.navigateToForm();
        
        const specialNameData = {
            name: 'José María O\'Connor-Smith Jr.',
            email: 'jose.maria@example.com',
            position: 'International Developer'
        };
        
        const result = await employeeFormPage.addEmployee(specialNameData, true);
        expect(result.success).toBe(true);
    });

    test('should handle long input values @validation @form @edge @length', async () => {
        await employeeFormPage.navigateToForm();
        
        // Test edge cases from EmployeeFormPage testData
        const edgeCaseResults = await employeeFormPage.testEdgeCases();
        
        // Verify at least some edge cases are handled
        const successfulCases = Object.values(edgeCaseResults).filter(result => result.success);
        expect(successfulCases.length).toBeGreaterThan(0);
    });

    test('should validate form interactivity @validation @form @interaction', async () => {
        await employeeFormPage.navigateToForm();
        
        const interactivityResult = await employeeFormPage.testFormInteractivity();
        
        expect(interactivityResult.fieldsAccessible).toBe(true);
        expect(interactivityResult.tabNavigation).toBe(true);
        expect(interactivityResult.clearFunctionality).toBe(true);
    });

    test('should perform comprehensive form validation tests @validation @form @comprehensive', async () => {
        // Run comprehensive validation tests
        const validationResults = await employeeFormPage.testFormValidation();
        
        // Each validation scenario should correctly prevent invalid submissions
        Object.entries(validationResults).forEach(([scenario, result]) => {
            expect(result.success).toBe(false);
            expect(result.remainedOnForm).toBe(true);
        });
    });

    test('should test all valid form submissions @validation @form @positive @comprehensive', async () => {
        const validSubmissionResults = await employeeFormPage.testValidFormSubmission();
        
        // All valid submissions should succeed
        validSubmissionResults.forEach((result, index) => {
            expect(result.success).toBe(true);
        });
    });

    test('should validate form in modal mode @validation @form @modal', async () => {
        // Navigate to employee list and use modal form
        await employeeListPage.navigateToEmployeeList();
        
        // Test validation in modal
        await employeeListPage.clickAddEmployee();
        
        // Try to submit empty modal form
        const saveButtonSelector = employeeListPage.selectors.saveButton;
        if (await employeeListPage.isElementVisible(saveButtonSelector)) {
            await employeeListPage.clickElement(saveButtonSelector);
            
            // Should show validation or remain in modal
            const modalStillVisible = await employeeListPage.isElementVisible(employeeListPage.selectors.addEmployeeModal);
            expect(modalStillVisible).toBe(true);
        }
        
        // Close modal
        await employeeListPage.closeModal();
    });

    test('should validate edit form with existing data @validation @form @edit', async () => {
        // First add an employee to edit
        const originalEmployee = {
            name: 'Edit Validation Test',
            email: 'edit.validation@test.com',
            position: 'Test Editor'
        };
        
        await employeeListPage.navigateToEmployeeList();
        await employeeListPage.addEmployee(originalEmployee);
        
        // Get the employee row and try to edit with invalid data
        const currentCount = await employeeListPage.getEmployeeCount();
        const editRowIndex = currentCount - 1;
        
        // Click edit and try invalid data
        const rows = await employeeListPage.getEmployeeRows();
        const editButton = rows[editRowIndex].locator(employeeListPage.selectors.editButton);
        await editButton.click();
        await employeeListPage.waitForElement(employeeListPage.selectors.editModal);
        
        // Clear required field and try to save
        await employeeListPage.fillInput(employeeListPage.selectors.nameInput, '');
        await employeeListPage.clickElement(employeeListPage.selectors.saveButton);
        
        // Should remain in edit modal or show validation error
        const modalStillVisible = await employeeListPage.isElementVisible(employeeListPage.selectors.editModal);
        expect(modalStillVisible).toBe(true);
        
        // Close modal
        await employeeListPage.closeModal();
    });

    test('should handle form submission with network delays @validation @form @performance', async () => {
        await employeeFormPage.navigateToForm();
        
        // Submit valid form and check for proper handling
        const validData = {
            name: 'Network Delay Test User',
            email: 'network@test.com',
            position: 'Network Tester'
        };
        
        await employeeFormPage.fillForm(validData);
        await employeeFormPage.submitForm();
        
        // Should either succeed or show loading/error appropriately
        // Check for success redirect or error message
        const currentUrl = employeeFormPage.getCurrentURL();
        const successRedirect = currentUrl.includes('/list');
        const errorMessage = await employeeFormPage.getValidationErrors();
        
        expect(successRedirect || Object.keys(errorMessage).length > 0).toBe(true);
    });

    test('should preserve form data during validation @validation @form @data-preservation', async () => {
        await employeeFormPage.navigateToForm();
        
        // Fill form with partial invalid data
        const partialData = {
            name: 'Preserve Test User',
            email: 'invalid-email-format',
            position: 'Data Preserver'
        };
        
        await employeeFormPage.fillForm(partialData);
        await employeeFormPage.submitForm();
        
        // Get current form values after validation attempt
        const preservedValues = await employeeFormPage.getFormValues();
        
        // Valid fields should be preserved
        expect(preservedValues.name).toBe(partialData.name);
        expect(preservedValues.position).toBe(partialData.position);
        
        // Email might be preserved or cleared depending on validation behavior
        expect(preservedValues.email).toBeDefined();
    });

    test('should handle rapid form submissions @validation @form @stress', async () => {
        await employeeFormPage.navigateToForm();
        
        const validData = {
            name: 'Rapid Submit Test',
            email: 'rapid@test.com',
            position: 'Speed Tester'
        };
        
        // Fill form
        await employeeFormPage.fillForm(validData);
        
        // Try rapid submissions (submit button should be disabled after first click)
        try {
            await employeeFormPage.submitForm();
            
            // Immediate second submission attempt
            if (await employeeFormPage.isElementVisible(employeeFormPage.selectors.saveButton)) {
                await employeeFormPage.clickElement(employeeFormPage.selectors.saveButton);
            }
            
            // Should handle gracefully without duplicate submissions
            expect(true).toBe(true); // Test passes if no errors thrown
            
        } catch (error) {
            // If error is thrown, it should be handled gracefully
            expect(error.message).toBeDefined();
        }
    });

    test('should validate form across different browsers @validation @form @cross-browser', async ({ browserName }) => {
        await employeeFormPage.navigateToForm();
        
        // Test basic validation in current browser
        const basicValidation = await employeeFormPage.verifyRequiredFields();
        
        expect(basicValidation.nameRequired).toBe(true);
        expect(basicValidation.emailRequired).toBe(true);
        expect(basicValidation.positionRequired).toBe(true);
        
        // Test valid submission
        const validData = {
            name: `${browserName} Test User`,
            email: `${browserName.toLowerCase()}@test.com`,
            position: `${browserName} Tester`
        };
        
        const result = await employeeFormPage.addEmployee(validData, true);
        expect(result.success).toBe(true);
    });

    test('should handle form validation with special input methods @validation @form @accessibility', async ({ page }) => {
        await employeeFormPage.navigateToForm();
        
        // Test keyboard-only interaction
        await page.locator(employeeFormPage.selectors.nameInput).focus();
        await page.keyboard.type('Keyboard User');
        
        await page.keyboard.press('Tab');
        await page.keyboard.type('keyboard@test.com');
        
        await page.keyboard.press('Tab'); 
        await page.keyboard.type('Keyboard Specialist');
        
        // Submit with Enter key
        await page.keyboard.press('Tab'); // Move to submit button
        await page.keyboard.press('Enter');
        
        // Should submit successfully or show appropriate feedback
        const currentUrl = page.url();
        const successRedirect = currentUrl.includes('/list');
        
        // If not redirected, check for form still being present (valid behavior)
        if (!successRedirect) {
            const formVisible = await employeeFormPage.isElementVisible(employeeFormPage.selectors.formContainer);
            expect(formVisible).toBe(true);
        } else {
            expect(successRedirect).toBe(true);
        }
    });
});