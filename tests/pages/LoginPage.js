const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
    constructor(page) {
        super(page);
        
        // Locators
        this.selectors = {
            loginCard: '[data-testid="login-card"], .MuiCard-root h4:has-text("Login")',
            usernameInput: 'input[name="username"], input[placeholder*="Username"], input[type="text"]:first-of-type',
            passwordInput: 'input[name="password"], input[placeholder*="Password"], input[type="password"]',
            loginButton: 'button[type="submit"], button:has-text("Login")',
            errorMessage: '.MuiAlert-message, .error-message, [role="alert"]',
            successMessage: '.MuiAlert-message:has-text("success"), .success-message',
            loginForm: 'form, .login-form',
            pageTitle: 'h4:has-text("Login"), h1:has-text("Login"), h2:has-text("Login")',
            loadingSpinner: '.MuiCircularProgress-root, .loading'
        };

        // Valid credentials from backend analysis
        this.validCredentials = [
            { username: 'admin', password: 'password' },
            { username: 'user', password: '123456' },
            { username: 'test', password: 'test123' }
        ];

        this.invalidCredentials = [
            { username: 'admin', password: 'wrong', expectedError: 'Invalid password' },
            { username: 'invalid', password: 'password', expectedError: 'User not found' },
            { username: '', password: 'password', expectedError: 'Username is required' },
            { username: 'admin', password: '', expectedError: 'Password is required' },
            { username: '', password: '', expectedError: 'Both username and password are required' }
        ];
    }

    /**
     * Navigate to login page
     */
    async navigateToLogin() {
        await this.navigate('/login');
        await this.waitForElement(this.selectors.loginCard);
        await this.waitForTitle('Employee Manager');
    }

    /**
     * Verify login page elements are visible
     */
    async verifyLoginPageElements() {
        const elements = [
            this.selectors.loginCard,
            this.selectors.usernameInput,
            this.selectors.passwordInput,
            this.selectors.loginButton,
            this.selectors.pageTitle
        ];

        for (const element of elements) {
            await this.waitForElement(element);
        }
    }

    /**
     * Fill username field
     * @param {string} username - Username to enter
     */
    async fillUsername(username) {
        await this.fillInput(this.selectors.usernameInput, username);
    }

    /**
     * Fill password field
     * @param {string} password - Password to enter
     */
    async fillPassword(password) {
        await this.fillInput(this.selectors.passwordInput, password);
    }

    /**
     * Click login button
     */
    async clickLoginButton() {
        await this.clickElement(this.selectors.loginButton);
    }

    /**
     * Perform login with credentials
     * @param {string} username - Username
     * @param {string} password - Password
     */
    async login(username, password) {
        await this.fillUsername(username);
        await this.fillPassword(password);
        await this.clickLoginButton();
        await this.waitForNetworkIdle();
    }

    /**
     * Login with valid credentials (default: admin/password)
     * @param {Object} credentials - Optional credentials object
     */
    async loginWithValidCredentials(credentials = this.validCredentials[0]) {
        await this.login(credentials.username, credentials.password);
        
        // Wait for redirect to employee list
        await this.page.waitForURL(/.*\/list/, { timeout: 10000 });
        
        // Verify successful login by checking for logout button or employee list
        await this.page.waitForSelector('button:has-text("Logoff"), [data-testid="employee-list"]', {
            timeout: 5000
        });
    }

    /**
     * Login with invalid credentials and verify error
     * @param {Object} credentials - Invalid credentials object
     */
    async loginWithInvalidCredentials(credentials) {
        await this.login(credentials.username, credentials.password);
        
        // Wait for error message
        await this.waitForElement(this.selectors.errorMessage);
        
        const errorText = await this.getElementText(this.selectors.errorMessage);
        return errorText;
    }

    /**
     * Get current error message
     */
    async getErrorMessage() {
        try {
            await this.waitForElement(this.selectors.errorMessage, 3000);
            return await this.getElementText(this.selectors.errorMessage);
        } catch {
            return null;
        }
    }

    /**
     * Verify user remains on login page after failed login
     */
    async verifyStillOnLoginPage() {
        await this.waitForElement(this.selectors.loginButton);
        const currentUrl = this.getCurrentURL();
        return currentUrl.includes('/login') || !currentUrl.includes('/list');
    }

    /**
     * Clear form fields
     */
    async clearForm() {
        await this.fillUsername('');
        await this.fillPassword('');
    }

    /**
     * Verify form validation (empty fields)
     */
    async verifyFormValidation() {
        // Try submitting empty form
        await this.clearForm();
        await this.clickLoginButton();
        
        // Check for validation messages or that we remain on login page
        const stillOnLogin = await this.verifyStillOnLoginPage();
        return stillOnLogin;
    }

    /**
     * Get page title
     */
    async getPageTitle() {
        return await this.page.title();
    }

    /**
     * Verify login form is interactive
     */
    async verifyFormInteractivity() {
        // Check that inputs are enabled
        const usernameEnabled = await this.page.locator(this.selectors.usernameInput).isEnabled();
        const passwordEnabled = await this.page.locator(this.selectors.passwordInput).isEnabled();
        const buttonEnabled = await this.page.locator(this.selectors.loginButton).isEnabled();
        
        return usernameEnabled && passwordEnabled && buttonEnabled;
    }

    /**
     * Test all valid credentials
     */
    async testAllValidCredentials() {
        const results = [];
        
        for (const credentials of this.validCredentials) {
            await this.navigateToLogin();
            
            try {
                await this.loginWithValidCredentials(credentials);
                results.push({
                    ...credentials,
                    success: true,
                    error: null
                });
                
                // Logout for next test
                await this.page.goto('/login');
                await this.page.evaluate(() => localStorage.clear());
                
            } catch (error) {
                results.push({
                    ...credentials,
                    success: false,
                    error: error.message
                });
            }
        }
        
        return results;
    }

    /**
     * Test all invalid credentials
     */
    async testAllInvalidCredentials() {
        const results = [];
        
        for (const credentials of this.invalidCredentials) {
            await this.navigateToLogin();
            
            try {
                const errorMessage = await this.loginWithInvalidCredentials(credentials);
                const stillOnLogin = await this.verifyStillOnLoginPage();
                
                results.push({
                    ...credentials,
                    actualError: errorMessage,
                    remainedOnLogin: stillOnLogin,
                    testPassed: stillOnLogin && errorMessage && errorMessage.length > 0
                });
                
            } catch (error) {
                results.push({
                    ...credentials,
                    actualError: null,
                    remainedOnLogin: false,
                    testPassed: false,
                    error: error.message
                });
            }
        }
        
        return results;
    }

    /**
     * Check if loading indicator appears during login
     */
    async checkLoadingIndicator() {
        await this.fillUsername(this.validCredentials[0].username);
        await this.fillPassword(this.validCredentials[0].password);
        
        // Click login and immediately check for loading state
        await this.clickLoginButton();
        
        try {
            // Check if loading indicator appears (might be very brief)
            const loadingVisible = await this.isElementVisible(this.selectors.loadingSpinner);
            return loadingVisible;
        } catch {
            return false;
        }
    }
}

module.exports = { LoginPage };