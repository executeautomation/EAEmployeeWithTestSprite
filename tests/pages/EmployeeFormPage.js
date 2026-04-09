const { BasePage } = require('./BasePage');

class EmployeeFormPage extends BasePage {
    constructor(page) {
        super(page);
        
        // Locators
        this.selectors = {
            // Form container
            formContainer: '.MuiCard-root, .form-container, [data-testid="employee-form"]',
            formTitle: 'h4:has-text("Employee"), h1:has-text("Employee"), .form-title',
            
            // Form fields
            nameInput: 'input[name="name"], input[placeholder*="Name"], #name',
            emailInput: 'input[name="email"], input[placeholder*="Email"], input[type="email"], #email',
            positionInput: 'input[name="position"], input[placeholder*="Position"], #position',
            
            // Form labels
            nameLabel: 'label[for="name"], label:has-text("Name")',
            emailLabel: 'label[for="email"], label:has-text("Email")',
            positionLabel: 'label[for="position"], label:has-text("Position")',
            
            // Form buttons
            saveButton: 'button[type="submit"], button:has-text("Save"), button:has-text("Add")',
            cancelButton: 'button:has-text("Cancel"), button:has-text("Back")',
            resetButton: 'button[type="reset"], button:has-text("Reset"), button:has-text("Clear")',
            
            // Validation messages
            nameError: '.error-message:near(input[name="name"]), .MuiFormHelperText-error:near(input[name="name"])',
            emailError: '.error-message:near(input[name="email"]), .MuiFormHelperText-error:near(input[name="email"])',
            positionError: '.error-message:near(input[name="position"]), .MuiFormHelperText-error:near(input[name="position"])',
            generalError: '.MuiAlert-message, .error-message, [role="alert"]',
            
            // Success messages
            successMessage: '.MuiAlert-message:has-text("success"), .success-message, .MuiSnackbar-root:has-text("success")',
            
            // Loading states
            loadingSpinner: '.MuiCircularProgress-root, .loading',
            disabledSaveButton: 'button[type="submit"]:disabled, button:has-text("Save"):disabled',
            
            // Required field indicators
            requiredIndicator: '.required, .MuiFormLabel-asterisk, :has-text("*")',
            
            // Form validation states
            validField: 'input:valid, .MuiOutlinedInput-root:not(.Mui-error)',
            invalidField: 'input:invalid, .MuiOutlinedInput-root.Mui-error'
        };

        // Test data for various scenarios
        this.testData = {
            valid: [
                { name: 'John Doe', email: 'john.doe@example.com', position: 'Software Engineer' },
                { name: 'Jane Smith', email: 'jane.smith@company.org', position: 'Product Manager' },
                { name: 'Bob Johnson', email: 'bob@test.com', position: 'Designer' },
                { name: 'Alice Brown', email: 'alice.brown@domain.net', position: 'Data Analyst' }
            ],
            invalid: {
                emptyName: { name: '', email: 'test@example.com', position: 'Developer' },
                emptyEmail: { name: 'Test User', email: '', position: 'Developer' },
                emptyPosition: { name: 'Test User', email: 'test@example.com', position: '' },
                invalidEmail: { name: 'Test User', email: 'invalid-email', position: 'Developer' },
                allEmpty: { name: '', email: '', position: '' }
            },
            edgeCases: {
                longName: { 
                    name: 'A'.repeat(100), 
                    email: 'test@example.com', 
                    position: 'Developer' 
                },
                longEmail: { 
                    name: 'Test User', 
                    email: 'verylongemailaddress' + 'a'.repeat(50) + '@example.com', 
                    position: 'Developer' 
                },
                longPosition: { 
                    name: 'Test User', 
                    email: 'test@example.com', 
                    position: 'Very Long Position Title That Exceeds Normal Length' 
                },
                specialCharacters: {
                    name: 'José María O\'Connor-Smith',
                    email: 'jose.maria@example-domain.co.uk',
                    position: 'Senior Software Engineer & Team Lead'
                }
            }
        };
    }

    /**
     * Navigate to employee form page
     */
    async navigateToForm() {
        await this.navigate('/form');
        await this.waitForElement(this.selectors.formContainer);
    }

    /**
     * Verify form elements are visible and accessible
     */
    async verifyFormElements() {
        const elements = [
            this.selectors.formContainer,
            this.selectors.nameInput,
            this.selectors.emailInput,
            this.selectors.positionInput,
            this.selectors.saveButton
        ];

        for (const element of elements) {
            await this.waitForElement(element);
        }

        // Verify form is interactive
        const nameEnabled = await this.page.locator(this.selectors.nameInput).isEnabled();
        const emailEnabled = await this.page.locator(this.selectors.emailInput).isEnabled();
        const positionEnabled = await this.page.locator(this.selectors.positionInput).isEnabled();
        const saveEnabled = await this.page.locator(this.selectors.saveButton).isEnabled();

        return {
            elementsVisible: true,
            formInteractive: nameEnabled && emailEnabled && positionEnabled && saveEnabled
        };
    }

    /**
     * Fill employee form
     * @param {Object} employeeData - Employee data {name, email, position}
     */
    async fillForm(employeeData) {
        if (employeeData.name !== undefined) {
            await this.fillInput(this.selectors.nameInput, employeeData.name);
        }
        if (employeeData.email !== undefined) {
            await this.fillInput(this.selectors.emailInput, employeeData.email);
        }
        if (employeeData.position !== undefined) {
            await this.fillInput(this.selectors.positionInput, employeeData.position);
        }
    }

    /**
     * Clear form fields
     */
    async clearForm() {
        await this.fillForm({ name: '', email: '', position: '' });
    }

    /**
     * Submit form
     */
    async submitForm() {
        await this.clickElement(this.selectors.saveButton);
        await this.waitForNetworkIdle();
    }

    /**
     * Cancel form
     */
    async cancelForm() {
        if (await this.isElementVisible(this.selectors.cancelButton)) {
            await this.clickElement(this.selectors.cancelButton);
            await this.waitForNetworkIdle();
        }
    }

    /**
     * Add employee with form validation
     * @param {Object} employeeData - Employee data
     * @param {boolean} expectSuccess - Whether to expect success or failure
     */
    async addEmployee(employeeData, expectSuccess = true) {
        await this.fillForm(employeeData);
        await this.submitForm();

        if (expectSuccess) {
            // Wait for success message or redirect
            try {
                const successMessage = await this.getSuccessMessage();
                return {
                    success: true,
                    message: successMessage,
                    redirected: this.getCurrentURL().includes('/list')
                };
            } catch {
                // Check if redirected to list page (alternative success indicator)
                const redirected = this.getCurrentURL().includes('/list');
                return {
                    success: redirected,
                    message: null,
                    redirected
                };
            }
        } else {
            // Expect validation errors or to remain on form
            const errors = await this.getValidationErrors();
            const stillOnForm = await this.isElementVisible(this.selectors.formContainer);
            
            return {
                success: false,
                errors,
                remainedOnForm: stillOnForm
            };
        }
    }

    /**
     * Get current form values
     */
    async getFormValues() {
        return {
            name: await this.page.locator(this.selectors.nameInput).inputValue(),
            email: await this.page.locator(this.selectors.emailInput).inputValue(),
            position: await this.page.locator(this.selectors.positionInput).inputValue()
        };
    }

    /**
     * Get validation errors
     */
    async getValidationErrors() {
        const errors = {};

        try {
            if (await this.isElementVisible(this.selectors.nameError)) {
                errors.name = await this.getElementText(this.selectors.nameError);
            }
        } catch {}

        try {
            if (await this.isElementVisible(this.selectors.emailError)) {
                errors.email = await this.getElementText(this.selectors.emailError);
            }
        } catch {}

        try {
            if (await this.isElementVisible(this.selectors.positionError)) {
                errors.position = await this.getElementText(this.selectors.positionError);
            }
        } catch {}

        try {
            if (await this.isElementVisible(this.selectors.generalError)) {
                errors.general = await this.getElementText(this.selectors.generalError);
            }
        } catch {}

        return errors;
    }

    /**
     * Get success message
     */
    async getSuccessMessage() {
        try {
            await this.waitForElement(this.selectors.successMessage, 3000);
            return await this.getElementText(this.selectors.successMessage);
        } catch {
            return null;
        }
    }

    /**
     * Test form validation with invalid data
     */
    async testFormValidation() {
        const results = {};

        // Test each invalid scenario
        for (const [scenarioName, data] of Object.entries(this.testData.invalid)) {
            await this.clearForm();
            const result = await this.addEmployee(data, false);
            results[scenarioName] = result;
        }

        return results;
    }

    /**
     * Test form with valid data
     */
    async testValidFormSubmission() {
        const results = [];

        for (const [index, data] of this.testData.valid.entries()) {
            await this.navigateToForm();
            const result = await this.addEmployee(data, true);
            results.push({
                testCase: index + 1,
                data,
                ...result
            });

            // Navigate back to form for next test if needed
            if (result.redirected && index < this.testData.valid.length - 1) {
                // Brief pause between tests
                await this.page.waitForTimeout(500);
            }
        }

        return results;
    }

    /**
     * Test edge cases and special characters
     */
    async testEdgeCases() {
        const results = {};

        for (const [caseName, data] of Object.entries(this.testData.edgeCases)) {
            await this.navigateToForm();
            const result = await this.addEmployee(data, true);
            results[caseName] = result;
        }

        return results;
    }

    /**
     * Test form interactivity and user experience
     */
    async testFormInteractivity() {
        await this.navigateToForm();
        
        const results = {
            fieldsAccessible: false,
            tabNavigation: false,
            keyboardSubmission: false,
            clearFunctionality: false
        };

        // Test field accessibility
        const formCheck = await this.verifyFormElements();
        results.fieldsAccessible = formCheck.formInteractive;

        // Test tab navigation
        try {
            await this.page.locator(this.selectors.nameInput).focus();
            await this.page.keyboard.press('Tab');
            
            const emailFocused = await this.page.locator(this.selectors.emailInput).evaluate(el => 
                document.activeElement === el
            );
            
            await this.page.keyboard.press('Tab');
            
            const positionFocused = await this.page.locator(this.selectors.positionInput).evaluate(el => 
                document.activeElement === el
            );
            
            results.tabNavigation = emailFocused && positionFocused;
        } catch {
            results.tabNavigation = false;
        }

        // Test clear functionality
        try {
            await this.fillForm(this.testData.valid[0]);
            await this.clearForm();
            
            const clearedValues = await this.getFormValues();
            results.clearFunctionality = !clearedValues.name && !clearedValues.email && !clearedValues.position;
        } catch {
            results.clearFunctionality = false;
        }

        // Test keyboard form submission
        try {
            await this.fillForm(this.testData.valid[1]);
            await this.page.locator(this.selectors.saveButton).focus();
            await this.page.keyboard.press('Enter');
            
            results.keyboardSubmission = true;
        } catch {
            results.keyboardSubmission = false;
        }

        return results;
    }

    /**
     * Test form in different scenarios (add vs edit mode)
     */
    async testFormModes() {
        const results = {
            standaloneAddMode: null,
            modalAddMode: null,
            editMode: null
        };

        // Test standalone add mode
        await this.navigateToForm();
        results.standaloneAddMode = await this.addEmployee(this.testData.valid[0]);

        // For modal and edit modes, we'd need to integrate with EmployeeListPage
        // This would be done in the integration tests

        return results;
    }

    /**
     * Verify required field indicators
     */
    async verifyRequiredFields() {
        await this.navigateToForm();
        
        const results = {
            nameRequired: false,
            emailRequired: false,
            positionRequired: false,
            visualIndicators: false
        };

        // Test by trying to submit empty form
        await this.clearForm();
        await this.submitForm();
        
        const errors = await this.getValidationErrors();
        
        results.nameRequired = !!(errors.name || errors.general);
        results.emailRequired = !!(errors.email || errors.general);
        results.positionRequired = !!(errors.position || errors.general);

        // Check for visual required indicators
        results.visualIndicators = await this.isElementVisible(this.selectors.requiredIndicator);

        return results;
    }

    /**
     * Test form responsiveness across different screen sizes
     */
    async testFormResponsiveness() {
        const viewports = [
            { name: 'mobile', width: 375, height: 667 },
            { name: 'tablet', width: 768, height: 1024 },
            { name: 'desktop', width: 1200, height: 800 },
            { name: 'wide', width: 1920, height: 1080 }
        ];

        const results = {};
        const originalViewport = this.page.viewportSize();

        for (const viewport of viewports) {
            await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
            await this.navigateToForm();
            
            const formVisible = await this.isElementVisible(this.selectors.formContainer);
            const fieldsAccessible = await this.verifyFormElements();
            
            results[viewport.name] = {
                viewport,
                formVisible,
                fieldsAccessible: fieldsAccessible.formInteractive
            };
        }

        // Restore original viewport
        if (originalViewport) {
            await this.page.setViewportSize(originalViewport);
        }

        return results;
    }

    /**
     * Perform comprehensive form testing
     */
    async performComprehensiveFormTest() {
        const results = {
            validSubmissions: await this.testValidFormSubmission(),
            validationTests: await this.testFormValidation(),
            edgeCases: await this.testEdgeCases(),
            interactivity: await this.testFormInteractivity(),
            requiredFields: await this.verifyRequiredFields(),
            responsiveness: await this.testFormResponsiveness()
        };

        return results;
    }
}

module.exports = { EmployeeFormPage };