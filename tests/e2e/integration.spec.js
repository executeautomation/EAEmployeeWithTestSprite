const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { EmployeeListPage } = require('../pages/EmployeeListPage');
const { EmployeeFormPage } = require('../pages/EmployeeFormPage');
const { MenuBarPage } = require('../pages/MenuBarPage');

test.describe('End-to-End Integration Tests', () => {
    let loginPage;
    let employeeListPage;
    let employeeFormPage;
    let menuBarPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        employeeListPage = new EmployeeListPage(page);
        employeeFormPage = new EmployeeFormPage(page);
        menuBarPage = new MenuBarPage(page);
    });

    test.afterEach(async ({ page }) => {
        await page.evaluate(() => localStorage.clear());
    });

    test('should complete full employee management workflow @critical @e2e @smoke', async () => {
        // 1. Navigate to application
        await loginPage.navigateToLogin();
        
        // 2. Login with valid credentials
        await loginPage.loginWithValidCredentials();
        expect(loginPage.getCurrentURL()).toContain('/list');
        
        // 3. Verify employee list page
        await employeeListPage.verifyPageElements();
        const initialCount = await employeeListPage.getEmployeeCount();
        
        // 4. Add a new employee
        const newEmployee = {
            name: 'E2E Test Employee',
            email: 'e2e.employee@test.com',
            position: 'Quality Assurance Engineer'
        };
        
        await employeeListPage.addEmployee(newEmployee);
        
        // 5. Verify employee was added
        const employeeExists = await employeeListPage.verifyEmployeeExists(newEmployee);
        expect(employeeExists).toBe(true);
        
        const newCount = await employeeListPage.getEmployeeCount();
        expect(newCount).toBe(initialCount + 1);
        
        // 6. Search for the new employee
        await employeeListPage.searchEmployees(newEmployee.name);
        const searchResults = await employeeListPage.getAllEmployeesData();
        const foundInSearch = searchResults.some(emp => emp.name.includes(newEmployee.name));
        expect(foundInSearch).toBe(true);
        
        // 7. Clear search
        await employeeListPage.clearSearch();
        
        // 8. Edit the employee
        const editedData = {
            name: 'Edited E2E Employee',
            position: 'Senior QA Engineer'
        };
        
        const editRowIndex = newCount - 1; // Last added employee
        await employeeListPage.editEmployee(editRowIndex, editedData);
        
        // 9. Verify edit was successful
        const updatedEmployee = await employeeListPage.getEmployeeDataFromRow(editRowIndex);
        expect(updatedEmployee.name).toContain(editedData.name);
        expect(updatedEmployee.position).toContain(editedData.position);
        
        // 10. View employee details
        await employeeListPage.viewEmployee(editRowIndex);
        const viewModalVisible = await employeeListPage.isElementVisible(employeeListPage.selectors.viewModal);
        expect(viewModalVisible).toBe(true);
        
        await employeeListPage.closeModal();
        
        // 11. Delete the employee
        await employeeListPage.deleteEmployee(editRowIndex, true);
        
        // 12. Verify deletion
        const finalCount = await employeeListPage.getEmployeeCount();
        expect(finalCount).toBe(initialCount);
        
        // 13. Logout
        const logoutSuccess = await menuBarPage.logoff();
        expect(logoutSuccess).toBe(true);
        
        // 14. Verify logout redirect
        const visibleLinks = await menuBarPage.getVisibleNavigationLinks();
        expect(visibleLinks.login).toBe(true);
        expect(visibleLinks.logoff).toBe(false);
    });

    test('should handle complete user journey with theme changes @e2e @theme @comprehensive', async () => {
        // Start with login
        await loginPage.navigateToLogin();
        
        // Change theme before login
        const initialTheme = await menuBarPage.getCurrentTheme();
        await menuBarPage.toggleTheme();
        const loginTheme = await menuBarPage.getCurrentTheme();
        expect(loginTheme).not.toBe(initialTheme);
        
        // Login with theme applied
        await loginPage.loginWithValidCredentials();
        
        // Verify theme persists after login
        const postLoginTheme = await menuBarPage.getCurrentTheme();
        expect(postLoginTheme).toBe(loginTheme);
        
        // Navigate to different pages with theme
        await employeeListPage.navigateToEmployeeList();
        const listTheme = await menuBarPage.getCurrentTheme();
        expect(listTheme).toBe(loginTheme);
        
        // Add employee with current theme
        const themeEmployee = {
            name: 'Theme Test User',
            email: 'theme@test.com',
            position: 'Theme Tester'
        };
        
        await employeeListPage.addEmployee(themeEmployee);
        
        // Toggle theme while on employee list
        await menuBarPage.toggleTheme();
        const newListTheme = await menuBarPage.getCurrentTheme();
        expect(newListTheme).not.toBe(listTheme);
        
        // Perform operations in new theme
        await employeeListPage.searchEmployees('Theme');
        const searchResults = await employeeListPage.getAllEmployeesData();
        const themeUserFound = searchResults.some(emp => emp.name.includes('Theme'));
        expect(themeUserFound).toBe(true);
        
        // Logout with theme preference
        await menuBarPage.logoff();
        
        // Verify theme handling during logout
        const logoutTheme = await menuBarPage.getCurrentTheme();
        expect(logoutTheme).toBeTruthy();
    });

    test('should handle multiple user sessions and data consistency @e2e @data @sessions', async () => {
        // Session 1: Add employees
        await loginPage.navigateToLogin();
        await loginPage.loginWithValidCredentials({ username: 'admin', password: 'password' });
        
        const session1Employees = [
            { name: 'Session 1 User A', email: 'session1a@test.com', position: 'Developer' },
            { name: 'Session 1 User B', email: 'session1b@test.com', position: 'Designer' }
        ];
        
        for (const employee of session1Employees) {
            await employeeListPage.addEmployee(employee);
        }
        
        const afterSession1Count = await employeeListPage.getEmployeeCount();
        
        // Logout from session 1
        await menuBarPage.logoff();
        
        // Session 2: Different user, verify data persistence
        await loginPage.loginWithValidCredentials({ username: 'user', password: '123456' });
        
        // Verify employees from session 1 are still there
        const session2Count = await employeeListPage.getEmployeeCount();
        expect(session2Count).toBe(afterSession1Count);
        
        // Search for session 1 employees
        await employeeListPage.searchEmployees('Session 1');
        const session1Results = await employeeListPage.getAllEmployeesData();
        expect(session1Results.length).toBeGreaterThan(0);
        
        // Add more employees in session 2
        await employeeListPage.clearSearch();
        
        const session2Employee = {
            name: 'Session 2 User',
            email: 'session2@test.com',
            position: 'Manager'
        };
        
        await employeeListPage.addEmployee(session2Employee);
        
        const finalCount = await employeeListPage.getEmployeeCount();
        expect(finalCount).toBe(afterSession1Count + 1);
        
        await menuBarPage.logoff();
    });

    test('should handle error recovery and graceful degradation @e2e @error @recovery', async () => {
        await loginPage.navigateToLogin();
        await loginPage.loginWithValidCredentials();
        
        // Test graceful handling of various error scenarios
        
        // 1. Invalid form submissions
        await employeeListPage.clickAddEmployee();
        
        // Try to submit empty form
        if (await employeeListPage.isElementVisible(employeeListPage.selectors.saveButton)) {
            await employeeListPage.clickElement(employeeListPage.selectors.saveButton);
            
            // Should remain in modal or show validation error
            const modalStillVisible = await employeeListPage.isElementVisible(employeeListPage.selectors.addEmployeeModal);
            expect(modalStillVisible).toBe(true);
            
            await employeeListPage.closeModal();
        }
        
        // 2. Test search with no results
        await employeeListPage.searchEmployees('NonExistentEmployee999999');
        const noResultsCount = await employeeListPage.getEmployeeCount();
        const noDataMessage = await employeeListPage.verifyNoDataMessage();
        expect(noResultsCount === 0 || noDataMessage).toBe(true);
        
        // 3. Recovery - clear search and verify normal operation
        await employeeListPage.clearSearch();
        
        // Should be able to continue normal operations
        const recoveredEmployee = {
            name: 'Recovery Test User',
            email: 'recovery@test.com',
            position: 'Error Recovery Specialist'
        };
        
        await employeeListPage.addEmployee(recoveredEmployee);
        const employeeAdded = await employeeListPage.verifyEmployeeExists(recoveredEmployee);
        expect(employeeAdded).toBe(true);
    });

    test('should perform comprehensive CRUD operations @e2e @crud @comprehensive', async () => {
        await loginPage.navigateToLogin();
        await loginPage.loginWithValidCredentials();
        
        const initialCount = await employeeListPage.getEmployeeCount();
        
        // CREATE: Add multiple employees with different data types
        const testEmployees = [
            { name: 'CRUD Test Alpha', email: 'alpha@crud.com', position: 'Alpha Tester' },
            { name: 'CRUD Test Beta', email: 'beta@crud.com', position: 'Beta Tester' },
            { name: 'CRUD Test Gamma', email: 'gamma@crud.com', position: 'Gamma Tester' }
        ];
        
        for (const employee of testEmployees) {
            await employeeListPage.addEmployee(employee);
        }
        
        const afterAddCount = await employeeListPage.getEmployeeCount();
        expect(afterAddCount).toBe(initialCount + testEmployees.length);
        
        // READ: Verify all employees can be found
        for (const employee of testEmployees) {
            const exists = await employeeListPage.verifyEmployeeExists(employee);
            expect(exists).toBe(true);
        }
        
        // READ: Test search functionality for each employee
        for (const employee of testEmployees) {
            await employeeListPage.searchEmployees(employee.name);
            const searchResults = await employeeListPage.getAllEmployeesData();
            const found = searchResults.some(emp => emp.name.includes(employee.name));
            expect(found).toBe(true);
            await employeeListPage.clearSearch();
        }
        
        // UPDATE: Edit each employee
        const editData = [
            { name: 'Updated Alpha', position: 'Senior Alpha' },
            { name: 'Updated Beta', position: 'Senior Beta' },
            { name: 'Updated Gamma', position: 'Senior Gamma' }
        ];
        
        for (let i = 0; i < testEmployees.length; i++) {
            // Find the employee row (they should be the last ones added)
            const rowIndex = initialCount + i;
            if (rowIndex < await employeeListPage.getEmployeeCount()) {
                await employeeListPage.editEmployee(rowIndex, editData[i]);
                
                // Verify update
                const updatedData = await employeeListPage.getEmployeeDataFromRow(rowIndex);
                expect(updatedData.name).toContain(editData[i].name);
                expect(updatedData.position).toContain(editData[i].position);
            }
        }
        
        // DELETE: Remove employees one by one
        let currentCount = await employeeListPage.getEmployeeCount();
        
        for (let i = 0; i < testEmployees.length; i++) {
            // Always delete the last employee (which should be our test employees)
            const deleteIndex = currentCount - 1;
            if (deleteIndex >= 0) {
                await employeeListPage.deleteEmployee(deleteIndex, true);
                currentCount = await employeeListPage.getEmployeeCount();
            }
        }
        
        // Verify final count
        const finalCount = await employeeListPage.getEmployeeCount();
        expect(finalCount).toBe(initialCount);
    });

    test('should handle navigation flows correctly @e2e @navigation @flow', async () => {
        // Test all navigation paths
        
        // 1. Start at login
        await loginPage.navigateToLogin();
        
        // 2. Login and verify redirect
        await loginPage.loginWithValidCredentials();
        expect(loginPage.getCurrentURL()).toContain('/list');
        
        // 3. Navigate to add employee via menu
        const addNavSuccess = await menuBarPage.navigateToAddEmployee();
        expect(addNavSuccess).toBe(true);
        
        // 4. Navigate back to list via menu
        const listNavSuccess = await menuBarPage.navigateToEmployeeList();
        expect(listNavSuccess).toBe(true);
        
        // 5. Test direct URL navigation while authenticated
        await employeeFormPage.navigate('/form');
        
        // Should be allowed to access form page or redirected to list with modal
        const currentUrl = employeeFormPage.getCurrentURL();
        const allowedUrls = ['/form', '/list'];
        const validNavigation = allowedUrls.some(url => currentUrl.includes(url));
        expect(validNavigation).toBe(true);
        
        // 6. Test logout navigation
        await employeeListPage.navigateToEmployeeList();
        const logoutSuccess = await menuBarPage.logoff();
        expect(logoutSuccess).toBe(true);
        
        // 7. Verify protection after logout
        await employeeListPage.navigate('/list');
        
        // Should redirect to login or show login page
        const finalUrl = employeeListPage.getCurrentURL();
        const protectedCorrectly = finalUrl.includes('/login') || 
                                 await loginPage.isElementVisible(loginPage.selectors.loginButton);
        expect(protectedCorrectly).toBe(true);
    });

    test('should handle responsive design across complete workflow @e2e @responsive @workflow', async ({ page }) => {
        const viewports = [
            { name: 'mobile', width: 375, height: 667 },
            { name: 'tablet', width: 768, height: 1024 },
            { name: 'desktop', width: 1200, height: 800 }
        ];
        
        for (const viewport of viewports) {
            // Set viewport
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            
            // Complete workflow on this viewport
            await loginPage.navigateToLogin();
            await loginPage.loginWithValidCredentials();
            
            // Add employee
            const responsiveEmployee = {
                name: `${viewport.name} User`,
                email: `${viewport.name}@responsive.com`,
                position: `${viewport.name} Tester`
            };
            
            await employeeListPage.addEmployee(responsiveEmployee);
            
            // Search
            await employeeListPage.searchEmployees(viewport.name);
            const searchResults = await employeeListPage.getAllEmployeesData();
            const found = searchResults.some(emp => emp.name.includes(viewport.name));
            expect(found).toBe(true);
            
            await employeeListPage.clearSearch();
            
            // Logout
            await menuBarPage.logoff();
        }
        
        // Restore normal viewport
        await page.setViewportSize({ width: 1280, height: 720 });
    });

    test('should maintain data consistency across browser refresh @e2e @persistence @refresh', async ({ page }) => {
        await loginPage.navigateToLogin();
        await loginPage.loginWithValidCredentials();
        
        // Add employee
        const persistentEmployee = {
            name: 'Persistence Test User',
            email: 'persist@test.com',
            position: 'Data Persistence Tester'
        };
        
        await employeeListPage.addEmployee(persistentEmployee);
        
        // Verify employee exists
        let employeeExists = await employeeListPage.verifyEmployeeExists(persistentEmployee);
        expect(employeeExists).toBe(true);
        
        // Refresh the page
        await page.reload();
        await loginPage.waitForNetworkIdle();
        
        // Check if still logged in (depends on session handling)
        const currentUrl = page.url();
        
        if (currentUrl.includes('/login')) {
            // If redirected to login, login again
            await loginPage.loginWithValidCredentials();
        }
        
        // Navigate to employee list if not already there
        if (!currentUrl.includes('/list')) {
            await employeeListPage.navigateToEmployeeList();
        }
        
        // Verify employee data persisted
        employeeExists = await employeeListPage.verifyEmployeeExists(persistentEmployee);
        expect(employeeExists).toBe(true);
    });

    test('should handle simultaneous operations gracefully @e2e @concurrent @stress', async () => {
        await loginPage.navigateToLogin();
        await loginPage.loginWithValidCredentials();
        
        // Perform multiple operations in sequence rapidly
        const rapidOperations = async () => {
            const employee1 = { name: 'Rapid 1', email: 'rapid1@concurrent.com', position: 'Speed 1' };
            const employee2 = { name: 'Rapid 2', email: 'rapid2@concurrent.com', position: 'Speed 2' };
            const employee3 = { name: 'Rapid 3', email: 'rapid3@concurrent.com', position: 'Speed 3' };
            
            // Add employees rapidly
            await employeeListPage.addEmployee(employee1);
            await employeeListPage.addEmployee(employee2);
            await employeeListPage.addEmployee(employee3);
            
            // Rapid search operations
            await employeeListPage.searchEmployees('Rapid');
            await employeeListPage.clearSearch();
            
            // Verify all operations completed successfully
            const allEmployees = await employeeListPage.getAllEmployeesData();
            const rapidEmployees = allEmployees.filter(emp => emp.name.includes('Rapid'));
            
            return rapidEmployees.length >= 3;
        };
        
        const operationsSuccessful = await rapidOperations();
        expect(operationsSuccessful).toBe(true);
    });

    test('should complete full application tour for new user @e2e @tour @comprehensive', async () => {
        // Simulate a new user discovering all application features
        
        // 1. Arrive at application (might redirect to login)
        await loginPage.navigate('/');
        
        // 2. Discover login requirement and login
        if (loginPage.getCurrentURL().includes('/login') || 
            await loginPage.isElementVisible(loginPage.selectors.loginButton)) {
            await loginPage.loginWithValidCredentials();
        }
        
        // 3. Explore main dashboard
        await employeeListPage.verifyPageElements();
        const initialEmployeeCount = await employeeListPage.getEmployeeCount();
        
        // 4. Discover theme toggle
        const initialTheme = await menuBarPage.getCurrentTheme();
        await menuBarPage.toggleTheme();
        const newTheme = await menuBarPage.getCurrentTheme();
        expect(newTheme).not.toBe(initialTheme);
        
        // 5. Discover search functionality
        if (initialEmployeeCount > 0) {
            const firstEmployee = await employeeListPage.getEmployeeDataFromRow(0);
            await employeeListPage.searchEmployees(firstEmployee.name);
            const searchResults = await employeeListPage.getAllEmployeesData();
            expect(searchResults.length).toBeGreaterThan(0);
            await employeeListPage.clearSearch();
        }
        
        // 6. Discover add employee functionality
        const tourEmployee = {
            name: 'Application Tour User',
            email: 'tour@newuser.com',
            position: 'Feature Explorer'
        };
        
        await employeeListPage.addEmployee(tourEmployee);
        
        // 7. Discover view functionality
        const newCount = await employeeListPage.getEmployeeCount();
        if (newCount > 0) {
            await employeeListPage.viewEmployee(newCount - 1);
            await employeeListPage.closeModal();
        }
        
        // 8. Discover edit functionality
        if (newCount > 0) {
            await employeeListPage.editEmployee(newCount - 1, { 
                name: 'Experienced Tour User',
                position: 'Application Expert'
            });
        }
        
        // 9. Discover navigation
        await menuBarPage.navigateToAddEmployee();
        await menuBarPage.navigateToEmployeeList();
        
        // 10. Complete tour by logging out
        await menuBarPage.logoff();
        
        // Verify successful tour completion
        const visibleLinks = await menuBarPage.getVisibleNavigationLinks();
        expect(visibleLinks.login).toBe(true);
    });
});