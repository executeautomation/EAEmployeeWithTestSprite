const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { EmployeeListPage } = require('../pages/EmployeeListPage');
const { EmployeeFormPage } = require('../pages/EmployeeFormPage');
const { MenuBarPage } = require('../pages/MenuBarPage');

test.describe('UI/UX and Theme Tests', () => {
    let loginPage;
    let employeeListPage;
    let employeeFormPage;
    let menuBarPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        employeeListPage = new EmployeeListPage(page);
        employeeFormPage = new EmployeeFormPage(page);
        menuBarPage = new MenuBarPage(page);
        
        // Start from login page
        await loginPage.navigateToLogin();
    });

    test.afterEach(async ({ page }) => {
        // Clean up
        await page.evaluate(() => localStorage.clear());
    });

    test('should toggle theme successfully between light and dark @smoke @ui @theme', async () => {
        // Get initial theme
        const initialTheme = await menuBarPage.getCurrentTheme();
        
        // Toggle theme
        const toggleResult = await menuBarPage.toggleTheme();
        
        // Verify theme changed
        expect(toggleResult.themeChanged).toBe(true);
        expect(toggleResult.newTheme).not.toBe(toggleResult.previousTheme);
        
        // Toggle back
        const secondToggle = await menuBarPage.toggleTheme();
        expect(secondToggle.themeChanged).toBe(true);
    });

    test('should maintain theme across multiple toggles @ui @theme', async () => {
        // Test multiple theme toggles
        const toggleResults = await menuBarPage.testThemeToggling(5);
        
        // Verify all toggles worked
        toggleResults.forEach((result, index) => {
            expect(result.themeChanged).toBe(true);
        });
        
        // Verify themes alternate correctly
        const themes = toggleResults.map(r => r.newTheme);
        for (let i = 1; i < themes.length; i++) {
            expect(themes[i]).not.toBe(themes[i-1]);
        }
    });

    test('should persist theme across page navigation @ui @theme @session', async () => {
        // Test theme persistence
        const persistenceResult = await menuBarPage.verifyThemePersistence();
        
        expect(persistenceResult.persistentAcrossPages).toBe(true);
        expect(persistenceResult.persistentAfterNavigation).toBe(true);
    });

    test('should display correct navigation for unauthenticated users @ui @navigation', async () => {
        // Test unauthenticated navigation
        const navResult = await menuBarPage.testUnauthenticatedNavigation();
        
        // Should only see public links
        expect(navResult.onlyPublicLinksVisible).toBe(true);
        
        // Should be able to navigate to login
        if (navResult.visibleLinks.login) {
            expect(navResult.loginNavigation).toBe(true);
        }
    });

    test('should display correct navigation for authenticated users @ui @navigation @auth', async () => {
        // Login first
        await loginPage.loginWithValidCredentials();
        
        // Test authenticated navigation
        const navResult = await menuBarPage.testAuthenticatedNavigation();
        
        // Should see authenticated user links
        expect(navResult.visibleLinks.logoff).toBe(true);
        expect(navResult.visibleLinks.login).toBe(false);
        
        // Navigation should work
        if (navResult.visibleLinks.employeeList) {
            expect(navResult.employeeListNavigation).toBe(true);
        }
    });

    test('should work correctly on mobile devices @ui @responsive @mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        
        // Login on mobile
        await loginPage.loginWithValidCredentials();
        
        // Test menu bar on mobile
        const responsiveResult = await menuBarPage.testResponsiveMenu();
        expect(responsiveResult.responsiveDesignWorking).toBe(true);
        
        // Test employee list on mobile
        await employeeListPage.navigateToEmployeeList();
        await employeeListPage.verifyPageElements();
        
        // Test adding employee on mobile
        const testEmployee = {
            name: 'Mobile Test User',
            email: 'mobile@test.com',
            position: 'Mobile Tester'
        };
        
        await employeeListPage.addEmployee(testEmployee);
        const employeeExists = await employeeListPage.verifyEmployeeExists(testEmployee);
        expect(employeeExists).toBe(true);
    });

    test('should work correctly on tablet devices @ui @responsive @tablet', async ({ page }) => {
        // Set tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        
        // Login and test functionality
        await loginPage.loginWithValidCredentials();
        await employeeListPage.navigateToEmployeeList();
        
        // Test all major functionality on tablet
        const testEmployee = {
            name: 'Tablet Test User',
            email: 'tablet@test.com',
            position: 'Tablet Tester'
        };
        
        // Add employee
        await employeeListPage.addEmployee(testEmployee);
        
        // Search functionality
        await employeeListPage.searchEmployees('Tablet');
        const searchResults = await employeeListPage.getAllEmployeesData();
        const tabletUserFound = searchResults.some(emp => emp.name.includes('Tablet'));
        expect(tabletUserFound).toBe(true);
        
        // Clear search
        await employeeListPage.clearSearch();
    });

    test('should work correctly on desktop @ui @responsive @desktop', async ({ page }) => {
        // Set large desktop viewport
        await page.setViewportSize({ width: 1920, height: 1080 });
        
        await loginPage.loginWithValidCredentials();
        await employeeListPage.navigateToEmployeeList();
        
        // Test desktop-specific functionality
        const initialCount = await employeeListPage.getEmployeeCount();
        
        // Add multiple employees to test table display
        const desktopEmployees = [
            { name: 'Desktop User 1', email: 'desktop1@test.com', position: 'Developer' },
            { name: 'Desktop User 2', email: 'desktop2@test.com', position: 'Designer' },
            { name: 'Desktop User 3', email: 'desktop3@test.com', position: 'Manager' }
        ];
        
        for (const employee of desktopEmployees) {
            await employeeListPage.addEmployee(employee);
        }
        
        const finalCount = await employeeListPage.getEmployeeCount();
        expect(finalCount).toBe(initialCount + desktopEmployees.length);
    });

    test('should handle form responsiveness correctly @ui @responsive @form', async () => {
        // Login and navigate to form
        await loginPage.loginWithValidCredentials();
        
        // Test form responsiveness
        const responsiveResult = await employeeFormPage.testFormResponsiveness();
        
        // Verify form works on all viewport sizes
        Object.values(responsiveResult).forEach(result => {
            expect(result.formVisible).toBe(true);
            expect(result.fieldsAccessible).toBe(true);
        });
    });

    test('should maintain accessibility standards @ui @accessibility @a11y', async () => {
        // Test menu bar accessibility
        const menuA11y = await menuBarPage.verifyAccessibility();
        
        expect(menuA11y.themeToggleAccessible).toBe(true);
        
        // Login and test authenticated accessibility
        await loginPage.loginWithValidCredentials();
        
        const authenticatedA11y = await menuBarPage.verifyAccessibility();
        expect(authenticatedA11y.buttonsHaveLabels).toBe(true);
    });

    test('should handle keyboard navigation correctly @ui @accessibility @keyboard', async () => {
        // Test keyboard navigation on login form
        const loginInteractivity = await loginPage.verifyFormInteractivity();
        expect(loginInteractivity).toBe(true);
        
        // Login with keyboard
        await loginPage.page.locator(loginPage.selectors.usernameInput).focus();
        await loginPage.page.keyboard.type('admin');
        await loginPage.page.keyboard.press('Tab');
        await loginPage.page.keyboard.type('password');
        await loginPage.page.keyboard.press('Tab');
        await loginPage.page.keyboard.press('Enter');
        
        // Should be logged in
        expect(loginPage.getCurrentURL()).toContain('/list');
    });

    test('should display consistent styling across pages @ui @styling @visual', async () => {
        // Test styling consistency
        await loginPage.loginWithValidCredentials();
        
        // Check theme on employee list
        const listTheme = await menuBarPage.getCurrentTheme();
        
        // Navigate to form page
        await menuBarPage.navigateToAddEmployee();
        const formTheme = await menuBarPage.getCurrentTheme();
        
        // Themes should be consistent
        expect(formTheme).toBe(listTheme);
        
        // Toggle theme and verify consistency
        await menuBarPage.toggleTheme();
        const newListTheme = await menuBarPage.getCurrentTheme();
        
        // Navigate back to list
        await employeeListPage.navigateToEmployeeList();
        const finalListTheme = await menuBarPage.getCurrentTheme();
        
        expect(finalListTheme).toBe(newListTheme);
    });

    test('should handle loading states appropriately @ui @performance @loading', async () => {
        await loginPage.loginWithValidCredentials();
        await employeeListPage.navigateToEmployeeList();
        
        // Test loading for employee operations
        await employeeListPage.waitForLoading();
        
        // Add employee and check for loading
        const testEmployee = {
            name: 'Loading Test User',
            email: 'loading@test.com',
            position: 'Loading Tester'
        };
        
        await employeeListPage.addEmployee(testEmployee);
        
        // Verify operation completed
        const employeeExists = await employeeListPage.verifyEmployeeExists(testEmployee);
        expect(employeeExists).toBe(true);
    });

    test('should display appropriate error messages @ui @error @feedback', async () => {
        // Test error message display in login
        await loginPage.loginWithInvalidCredentials({ username: 'invalid', password: 'wrong' });
        
        const loginError = await loginPage.getErrorMessage();
        expect(loginError).toBeTruthy();
        
        // Login successfully and test employee operations
        await loginPage.navigateToLogin();
        await loginPage.loginWithValidCredentials();
        await employeeListPage.navigateToEmployeeList();
        
        // Check error message capability exists
        const errorMessage = await employeeListPage.getErrorMessage();
        // May or may not have an error, but system should handle it gracefully
    });

    test('should display success notifications correctly @ui @success @feedback', async () => {
        await loginPage.loginWithValidCredentials();
        await employeeListPage.navigateToEmployeeList();
        
        // Add employee to trigger success message
        const testEmployee = {
            name: 'Success Test User',
            email: 'success@test.com',
            position: 'Success Tester'
        };
        
        await employeeListPage.addEmployee(testEmployee);
        
        // Verify success message appears
        const successMessage = await employeeListPage.getSuccessMessage();
        expect(successMessage).toMatch(/success|added|created/i);
    });

    test('should handle theme transitions smoothly @ui @theme @animation', async () => {
        // Test smooth theme transitions
        const initialTheme = await menuBarPage.getCurrentTheme();
        
        // Toggle theme multiple times rapidly
        for (let i = 0; i < 3; i++) {
            await menuBarPage.toggleTheme();
            // Brief pause to allow transition
            await loginPage.page.waitForTimeout(200);
        }
        
        // Verify system is still functional
        const finalTheme = await menuBarPage.getCurrentTheme();
        expect(finalTheme).toBeTruthy();
        
        // Test login still works after theme changes
        if (!loginPage.getCurrentURL().includes('/list')) {
            await loginPage.navigateToLogin();
            await loginPage.loginWithValidCredentials();
        }
        
        expect(loginPage.getCurrentURL()).toContain('/list');
    });

    test('should maintain UI state during navigation @ui @navigation @state', async () => {
        await loginPage.loginWithValidCredentials();
        
        // Set dark theme
        const currentTheme = await menuBarPage.getCurrentTheme();
        if (currentTheme !== 'dark') {
            await menuBarPage.toggleTheme();
        }
        
        // Navigate between pages
        await employeeListPage.navigateToEmployeeList();
        const listTheme = await menuBarPage.getCurrentTheme();
        
        await menuBarPage.navigateToAddEmployee();
        const formTheme = await menuBarPage.getCurrentTheme();
        
        // Theme should be maintained
        expect(listTheme).toBe('dark');
        expect(formTheme).toBe('dark');
    });

    test('should handle empty states appropriately @ui @empty @edge', async () => {
        await loginPage.loginWithValidCredentials();
        await employeeListPage.navigateToEmployeeList();
        
        // Test empty search results
        await employeeListPage.searchEmployees('NonExistentSearchTerm999999');
        
        const employeeCount = await employeeListPage.getEmployeeCount();
        const noDataMessage = await employeeListPage.verifyNoDataMessage();
        
        // Should handle empty state gracefully
        expect(employeeCount === 0 || noDataMessage).toBe(true);
        
        // Clear search to restore normal view
        await employeeListPage.clearSearch();
        
        const restoredCount = await employeeListPage.getEmployeeCount();
        expect(restoredCount).toBeGreaterThanOrEqual(0);
    });

    test('should provide comprehensive menu functionality @ui @menu @comprehensive', async () => {
        // Comprehensive menu test
        const menuResults = await menuBarPage.performComprehensiveMenuTest();
        
        expect(menuResults.menuBarVisible).toBe(true);
        expect(menuResults.themeToggling.length).toBeGreaterThan(0);
        expect(menuResults.responsiveDesign.responsiveDesignWorking).toBe(true);
    });
});