const { BasePage } = require('./BasePage');

class EmployeeListPage extends BasePage {
    constructor(page) {
        super(page);
        
        // Locators
        this.selectors = {
            // Main page elements
            pageTitle: 'h4:has-text("Employee List"), h1:has-text("Employee"), [data-testid="page-title"]',
            employeeTable: 'table, [data-testid="employee-table"], .MuiTable-root',
            tableHeader: 'thead, .MuiTableHead-root',
            tableBody: 'tbody, .MuiTableBody-root',
            tableRows: 'tbody tr, .MuiTableBody-root tr',
            
            // Search functionality
            searchInput: 'input[placeholder*="Search"], input[type="text"]:first-of-type',
            searchButton: 'button:has-text("Search"), [data-testid="search-button"]',
            clearSearchButton: 'button:has-text("Clear"), [data-testid="clear-search"]',
            
            // Add employee
            addEmployeeButton: 'button:has-text("Add Employee"), button:has-text("Add"), [data-testid="add-employee"]',
            addEmployeeModal: '[role="dialog"], .MuiDialog-root',
            
            // Employee actions
            viewButton: 'button:has-text("View"), [data-testid="view-button"]',
            editButton: 'button:has-text("Edit"), [data-testid="edit-button"]',
            deleteButton: 'button:has-text("Delete"), [data-testid="delete-button"]',
            
            // Modals and dialogs
            viewModal: '[role="dialog"]:has-text("Employee Details"), .view-employee-modal',
            editModal: '[role="dialog"]:has-text("Edit Employee"), .edit-employee-modal',
            deleteModal: '[role="dialog"]:has-text("Delete Employee"), .delete-confirmation-modal',
            
            // Form elements in modals
            nameInput: 'input[name="name"], input[placeholder*="Name"]',
            emailInput: 'input[name="email"], input[placeholder*="Email"], input[type="email"]',
            positionInput: 'input[name="position"], input[placeholder*="Position"]',
            
            // Modal buttons
            saveButton: 'button:has-text("Save"), button[type="submit"]',
            cancelButton: 'button:has-text("Cancel"), button:has-text("Close")',
            confirmDeleteButton: 'button:has-text("Delete"), button:has-text("Confirm")',
            closeModalButton: '.MuiDialog-root button:has-text("×"), [data-testid="close-modal"]',
            
            // Messages and notifications
            successMessage: '.MuiAlert-message:has-text("success"), .success-message, .MuiSnackbar-root:has-text("success")',
            errorMessage: '.MuiAlert-message:has-text("error"), .error-message, .MuiSnackbar-root:has-text("error")',
            noDataMessage: ':has-text("No employees found"), :has-text("No data available")',
            
            // Loading states
            loadingSpinner: '.MuiCircularProgress-root, .loading, [data-testid="loading"]',
            
            // Table columns
            idColumn: 'th:has-text("ID"), td:nth-child(1)',
            nameColumn: 'th:has-text("Name"), td:nth-child(2)',
            emailColumn: 'th:has-text("Email"), td:nth-child(3)',
            positionColumn: 'th:has-text("Position"), td:nth-child(4)',
            actionsColumn: 'th:has-text("Actions"), td:nth-child(5)'
        };
    }

    /**
     * Navigate to employee list page
     */
    async navigateToEmployeeList() {
        await this.navigate('/list');
        await this.waitForElement(this.selectors.employeeTable);
        await this.waitForNetworkIdle();
    }

    /**
     * Verify page elements are visible
     */
    async verifyPageElements() {
        const elements = [
            this.selectors.employeeTable,
            this.selectors.addEmployeeButton,
            this.selectors.searchInput
        ];

        for (const element of elements) {
            await this.waitForElement(element);
        }
    }

    /**
     * Get all employee rows from the table
     */
    async getEmployeeRows() {
        await this.waitForElement(this.selectors.tableBody);
        return await this.getAllElements(this.selectors.tableRows);
    }

    /**
     * Get employee count
     */
    async getEmployeeCount() {
        const rows = await this.getEmployeeRows();
        return rows.length;
    }

    /**
     * Get employee data from a specific row
     * @param {number} rowIndex - Row index (0-based)
     */
    async getEmployeeDataFromRow(rowIndex) {
        const rows = await this.getEmployeeRows();
        if (rowIndex >= rows.length) {
            throw new Error(`Row index ${rowIndex} out of bounds. Only ${rows.length} rows available.`);
        }

        const row = rows[rowIndex];
        const cells = await row.locator('td').all();
        
        return {
            id: await cells[0].textContent(),
            name: await cells[1].textContent(),
            email: await cells[2].textContent(),
            position: await cells[3].textContent()
        };
    }

    /**
     * Get all employees data from the table
     */
    async getAllEmployeesData() {
        const rows = await this.getEmployeeRows();
        const employees = [];

        for (let i = 0; i < rows.length; i++) {
            const employee = await this.getEmployeeDataFromRow(i);
            employees.push(employee);
        }

        return employees;
    }

    /**
     * Search for employees
     * @param {string} searchTerm - Search term
     */
    async searchEmployees(searchTerm) {
        await this.fillInput(this.selectors.searchInput, searchTerm);
        await this.waitForNetworkIdle();
        // Search is typically real-time, but if there's a search button:
        if (await this.isElementVisible(this.selectors.searchButton)) {
            await this.clickElement(this.selectors.searchButton);
            await this.waitForNetworkIdle();
        }
    }

    /**
     * Clear search
     */
    async clearSearch() {
        await this.fillInput(this.selectors.searchInput, '');
        if (await this.isElementVisible(this.selectors.clearSearchButton)) {
            await this.clickElement(this.selectors.clearSearchButton);
        }
        await this.waitForNetworkIdle();
    }

    /**
     * Click Add Employee button
     */
    async clickAddEmployee() {
        await this.clickElement(this.selectors.addEmployeeButton);
        await this.waitForElement(this.selectors.addEmployeeModal);
    }

    /**
     * Add a new employee through the modal
     * @param {Object} employeeData - Employee data {name, email, position}
     */
    async addEmployee(employeeData) {
        await this.clickAddEmployee();
        
        // Fill the form
        await this.fillInput(this.selectors.nameInput, employeeData.name);
        await this.fillInput(this.selectors.emailInput, employeeData.email);
        await this.fillInput(this.selectors.positionInput, employeeData.position);
        
        // Submit the form
        await this.clickElement(this.selectors.saveButton);
        
        // Wait for success message or modal to close
        try {
            await this.waitForElement(this.selectors.successMessage, 3000);
        } catch {
            // If no success message, wait for modal to close
            await this.waitForElementToDisappear(this.selectors.addEmployeeModal);
        }
        
        await this.waitForNetworkIdle();
    }

    /**
     * View employee details
     * @param {number} rowIndex - Row index (0-based)
     */
    async viewEmployee(rowIndex) {
        const rows = await this.getEmployeeRows();
        const viewButton = rows[rowIndex].locator(this.selectors.viewButton);
        await viewButton.click();
        await this.waitForElement(this.selectors.viewModal);
    }

    /**
     * Edit employee
     * @param {number} rowIndex - Row index (0-based)
     * @param {Object} newData - New employee data
     */
    async editEmployee(rowIndex, newData) {
        const rows = await this.getEmployeeRows();
        const editButton = rows[rowIndex].locator(this.selectors.editButton);
        await editButton.click();
        await this.waitForElement(this.selectors.editModal);
        
        // Update the form fields
        if (newData.name) {
            await this.fillInput(this.selectors.nameInput, newData.name);
        }
        if (newData.email) {
            await this.fillInput(this.selectors.emailInput, newData.email);
        }
        if (newData.position) {
            await this.fillInput(this.selectors.positionInput, newData.position);
        }
        
        // Save changes
        await this.clickElement(this.selectors.saveButton);
        
        // Wait for success message or modal to close
        try {
            await this.waitForElement(this.selectors.successMessage, 3000);
        } catch {
            await this.waitForElementToDisappear(this.selectors.editModal);
        }
        
        await this.waitForNetworkIdle();
    }

    /**
     * Delete employee
     * @param {number} rowIndex - Row index (0-based)
     * @param {boolean} confirm - Whether to confirm deletion
     */
    async deleteEmployee(rowIndex, confirm = true) {
        const rows = await this.getEmployeeRows();
        const deleteButton = rows[rowIndex].locator(this.selectors.deleteButton);
        await deleteButton.click();
        await this.waitForElement(this.selectors.deleteModal);
        
        if (confirm) {
            await this.clickElement(this.selectors.confirmDeleteButton);
            
            // Wait for success message or modal to close
            try {
                await this.waitForElement(this.selectors.successMessage, 3000);
            } catch {
                await this.waitForElementToDisappear(this.selectors.deleteModal);
            }
            
            await this.waitForNetworkIdle();
        } else {
            await this.clickElement(this.selectors.cancelButton);
            await this.waitForElementToDisappear(this.selectors.deleteModal);
        }
    }

    /**
     * Close any open modal
     */
    async closeModal() {
        const modals = [
            this.selectors.addEmployeeModal,
            this.selectors.viewModal,
            this.selectors.editModal,
            this.selectors.deleteModal
        ];

        for (const modal of modals) {
            if (await this.isElementVisible(modal)) {
                await this.clickElement(this.selectors.cancelButton);
                await this.waitForElementToDisappear(modal);
                break;
            }
        }
    }

    /**
     * Verify employee exists in the table
     * @param {Object} employeeData - Employee data to verify
     */
    async verifyEmployeeExists(employeeData) {
        const allEmployees = await this.getAllEmployeesData();
        
        return allEmployees.some(employee => 
            employee.name.includes(employeeData.name) &&
            employee.email.includes(employeeData.email) &&
            employee.position.includes(employeeData.position)
        );
    }

    /**
     * Verify employee does not exist in the table
     * @param {Object} employeeData - Employee data to verify absence
     */
    async verifyEmployeeNotExists(employeeData) {
        return !(await this.verifyEmployeeExists(employeeData));
    }

    /**
     * Find employee by name
     * @param {string} name - Employee name
     */
    async findEmployeeByName(name) {
        const allEmployees = await this.getAllEmployeesData();
        return allEmployees.find(employee => 
            employee.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    /**
     * Get table headers
     */
    async getTableHeaders() {
        await this.waitForElement(this.selectors.tableHeader);
        const headers = await this.page.locator(`${this.selectors.tableHeader} th`).all();
        const headerTexts = [];
        
        for (const header of headers) {
            headerTexts.push(await header.textContent());
        }
        
        return headerTexts;
    }

    /**
     * Verify table structure
     */
    async verifyTableStructure() {
        const headers = await this.getTableHeaders();
        const expectedHeaders = ['ID', 'Name', 'Email', 'Position', 'Actions'];
        
        return expectedHeaders.every(expected => 
            headers.some(header => header.includes(expected))
        );
    }

    /**
     * Wait for loading to complete
     */
    async waitForLoading() {
        try {
            // Wait for loading spinner to appear and then disappear
            await this.waitForElement(this.selectors.loadingSpinner, 2000);
            await this.waitForElementToDisappear(this.selectors.loadingSpinner);
        } catch {
            // Loading might be too fast to catch
        }
    }

    /**
     * Get current success message
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
     * Verify no data message when table is empty
     */
    async verifyNoDataMessage() {
        return await this.isElementVisible(this.selectors.noDataMessage);
    }

    /**
     * Test search functionality with various terms
     * @param {Array} searchTerms - Array of search terms to test
     */
    async testSearchFunctionality(searchTerms) {
        const results = [];
        
        for (const term of searchTerms) {
            await this.clearSearch();
            const originalCount = await this.getEmployeeCount();
            
            await this.searchEmployees(term);
            const filteredCount = await this.getEmployeeCount();
            
            const filteredEmployees = await this.getAllEmployeesData();
            
            results.push({
                searchTerm: term,
                originalCount,
                filteredCount,
                employees: filteredEmployees,
                searchWorked: filteredCount <= originalCount
            });
        }
        
        await this.clearSearch();
        return results;
    }

    /**
     * Perform bulk operations test
     */
    async performBulkOperationsTest() {
        const results = {
            initialCount: await this.getEmployeeCount(),
            addedEmployees: [],
            editedEmployees: [],
            deletedEmployees: []
        };

        // Test data
        const testEmployees = [
            { name: 'Test Employee 1', email: 'test1@example.com', position: 'Test Position 1' },
            { name: 'Test Employee 2', email: 'test2@example.com', position: 'Test Position 2' },
            { name: 'Test Employee 3', email: 'test3@example.com', position: 'Test Position 3' }
        ];

        // Add employees
        for (const employee of testEmployees) {
            await this.addEmployee(employee);
            const exists = await this.verifyEmployeeExists(employee);
            results.addedEmployees.push({ ...employee, added: exists });
        }

        results.countAfterAdd = await this.getEmployeeCount();

        // Edit first added employee
        const editData = { name: 'Edited Name', position: 'Edited Position' };
        await this.editEmployee(results.initialCount, editData); // Edit first added employee
        
        const editedEmployee = await this.getEmployeeDataFromRow(results.initialCount);
        results.editedEmployees.push({ 
            original: testEmployees[0], 
            edited: editedEmployee,
            editSuccessful: editedEmployee.name.includes(editData.name)
        });

        // Delete last added employee
        const lastRowIndex = await this.getEmployeeCount() - 1;
        const employeeToDelete = await this.getEmployeeDataFromRow(lastRowIndex);
        
        await this.deleteEmployee(lastRowIndex, true);
        
        const stillExists = await this.verifyEmployeeExists(employeeToDelete);
        results.deletedEmployees.push({
            employee: employeeToDelete,
            deleted: !stillExists
        });

        results.finalCount = await this.getEmployeeCount();

        return results;
    }
}

module.exports = { EmployeeListPage };