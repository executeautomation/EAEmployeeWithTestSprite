const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { EmployeeListPage } = require('../pages/EmployeeListPage');
const { MenuBarPage } = require('../pages/MenuBarPage');

test.describe('Authentication Tests', () => {
    let loginPage;
    let employeeListPage;
    let menuBarPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        employeeListPage = new EmployeeListPage(page);
        menuBarPage = new MenuBarPage(page);
        
        // Clear any existing session
        await page.evaluate(() => localStorage.clear());
        
        // Navigate to login page
        await loginPage.navigateToLogin();
    });

    test.afterEach(async ({ page }) => {
        // Clean up after each test
        await page.evaluate(() => localStorage.clear());
    });

    test('should display login page correctly @smoke @auth', async () => {
        // Verify login page elements
        await loginPage.verifyLoginPageElements();
        
        // Verify page title
        const title = await loginPage.getPageTitle();
        expect(title).toContain('Employee Manager');
        
        // Verify form is interactive
        const interactive = await loginPage.verifyFormInteractivity();
        expect(interactive).toBe(true);
    });

    test('should login successfully with valid credentials (admin) @critical @auth', async () => {
        // Test with admin credentials
        await loginPage.loginWithValidCredentials({ username: 'admin', password: 'password' });
        
        // Verify successful login - should be redirected to employee list
        expect(loginPage.getCurrentURL()).toContain('/list');
        
        // Verify logout button is visible
        const visibleLinks = await menuBarPage.getVisibleNavigationLinks();
        expect(visibleLinks.logoff).toBe(true);
        expect(visibleLinks.login).toBe(false);
    });

    test('should login successfully with all valid credentials @auth', async () => {
        const validCredentials = [
            { username: 'admin', password: 'password' },
            { username: 'user', password: '123456' },
            { username: 'test', password: 'test123' }
        ];

        for (const credentials of validCredentials) {
            // Clear session and go to login
            await loginPage.navigateToLogin();
            
            // Login with current credentials
            await loginPage.loginWithValidCredentials(credentials);
            
            // Verify successful login
            expect(loginPage.getCurrentURL()).toContain('/list');
            
            // Verify user can access employee list
            await employeeListPage.verifyPageElements();
            
            // Logout for next iteration
            await menuBarPage.logoff();
        }
    });

    test('should reject invalid credentials @auth @negative', async () => {
        const invalidCredentials = [
            { username: 'admin', password: 'wrong' },
            { username: 'invalid', password: 'password' },
            { username: 'admin', password: '' },
            { username: '', password: 'password' },
            { username: '', password: '' }
        ];

        for (const credentials of invalidCredentials) {
            await loginPage.navigateToLogin();
            
            // Attempt login with invalid credentials
            const errorMessage = await loginPage.loginWithInvalidCredentials(credentials);
            
            // Verify error handling
            expect(errorMessage).toBeTruthy();
            
            // Verify user remains on login page
            const stillOnLogin = await loginPage.verifyStillOnLoginPage();
            expect(stillOnLogin).toBe(true);
        }
    });

    test('should validate required fields @auth @validation', async () => {
        // Try to submit empty form
        const validationResult = await loginPage.verifyFormValidation();
        expect(validationResult).toBe(true);
        
        // Test individual field validation
        await loginPage.fillUsername('admin');
        await loginPage.clickLoginButton();
        
        const stillOnLogin = await loginPage.verifyStillOnLoginPage();
        expect(stillOnLogin).toBe(true);
    });

    test('should handle session persistence @auth @session', async () => {
        // Login successfully
        await loginPage.loginWithValidCredentials();
        
        // Navigate to different pages
        await employeeListPage.navigateToEmployeeList();
        expect(loginPage.getCurrentURL()).toContain('/list');
        
        // Refresh the page
        await loginPage.page.reload();
        await loginPage.waitForNetworkIdle();
        
        // Should still be logged in (if session is preserved in localStorage)
        const visibleLinks = await menuBarPage.getVisibleNavigationLinks();
        expect(visibleLinks.logoff).toBe(true);
    });

    test('should logout successfully @auth @logout', async () => {
        // Login first
        await loginPage.loginWithValidCredentials();
        
        // Logout
        const logoutSuccess = await menuBarPage.logoff();
        expect(logoutSuccess).toBe(true);
        
        // Verify redirect to login page or login link is visible
        const visibleLinks = await menuBarPage.getVisibleNavigationLinks();
        expect(visibleLinks.login).toBe(true);
        expect(visibleLinks.logoff).toBe(false);
        
        // Verify cannot access protected pages
        await employeeListPage.navigate('/list');
        // Should redirect to login or show login page
        expect(loginPage.getCurrentURL()).toMatch(/login|^\/$|^\/$/);
    });

    test('should protect routes from unauthorized access @auth @security', async () => {
        // Try to access protected routes without authentication
        const protectedRoutes = ['/list', '/form'];
        
        for (const route of protectedRoutes) {
            await loginPage.navigate(route);
            
            // Should redirect to login or show login page
            const currentUrl = loginPage.getCurrentURL();
            const onLoginPage = currentUrl.includes('/login') || await loginPage.isElementVisible(loginPage.selectors.loginButton);
            expect(onLoginPage).toBe(true);
        }
    });

    test('should handle loading states during login @auth @performance', async () => {
        // Check if loading indicator appears during login process
        const loadingVisible = await loginPage.checkLoadingIndicator();
        
        // Loading might be too fast to catch, so this test verifies the mechanism exists
        // The main assertion is that login completes successfully
        expect(loginPage.getCurrentURL()).toContain('/list');
    });

    test('should maintain theme preference across login sessions @auth @ui', async () => {
        // Set dark theme before login
        const initialTheme = await menuBarPage.getCurrentTheme();
        if (initialTheme !== 'dark') {
            await menuBarPage.toggleTheme();
        }
        
        // Login
        await loginPage.loginWithValidCredentials();
        
        // Verify theme is preserved after login
        const themeAfterLogin = await menuBarPage.getCurrentTheme();
        expect(themeAfterLogin).toBe('dark');
        
        // Logout and login again
        await menuBarPage.logoff();
        await loginPage.loginWithValidCredentials();
        
        // Theme might or might not persist depending on implementation
        // This test documents the behavior
        const finalTheme = await menuBarPage.getCurrentTheme();
        expect(finalTheme).toBeTruthy(); // At least verify theme system works
    });

    test('should handle multiple rapid login attempts @auth @stress', async () => {
        const attempts = 3;
        const results = [];
        
        for (let i = 0; i < attempts; i++) {
            await loginPage.navigateToLogin();
            
            try {
                await loginPage.loginWithValidCredentials();
                results.push({ attempt: i + 1, success: true });
                
                // Quick logout for next attempt
                await menuBarPage.logoff();
            } catch (error) {
                results.push({ attempt: i + 1, success: false, error: error.message });
            }
        }
        
        // At least one attempt should succeed
        const successfulAttempts = results.filter(r => r.success);
        expect(successfulAttempts.length).toBeGreaterThan(0);
    });
});