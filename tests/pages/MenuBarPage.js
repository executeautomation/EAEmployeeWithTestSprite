const { BasePage } = require('./BasePage');

class MenuBarPage extends BasePage {
    constructor(page) {
        super(page);
        
        // Locators
        this.selectors = {
            // Main menu bar
            menuBar: '.MuiAppBar-root, .menu-bar, header',
            appTitle: ':has-text("Employee Manager"), .app-title',
            
            // Navigation links
            addEmployeeLink: 'a[href="/form"], button:has-text("Add Employee"), .nav-link:has-text("Add")',
            employeeListLink: 'a[href="/list"], button:has-text("Employee List"), .nav-link:has-text("List")',
            loginLink: 'a[href="/login"], button:has-text("Login"), .nav-link:has-text("Login")',
            
            // User actions
            logoffButton: 'button:has-text("Logoff"), button:has-text("Logout"), .logout-btn',
            userInfo: '.user-info, :has-text("Welcome"), .username-display',
            
            // Theme toggle
            themeToggleButton: 'button:has([data-testid="theme-toggle"]), .theme-toggle, button:has(.MuiSvgIcon-root)',
            lightModeIcon: '[data-testid="LightModeIcon"], .light-mode-icon',
            darkModeIcon: '[data-testid="DarkModeIcon"], .dark-mode-icon',
            
            // Menu items (responsive)
            mobileMenuButton: '.MuiIconButton-root:has(.MuiSvgIcon-root), .mobile-menu-toggle',
            mobileMenu: '.MuiDrawer-root, .mobile-menu',
            
            // Theme-related elements to verify theme changes
            appBar: '.MuiAppBar-root',
            body: 'body',
            mainContent: 'main, .main-content, .MuiContainer-root'
        };
    }

    /**
     * Verify menu bar is visible and functional
     */
    async verifyMenuBar() {
        await this.waitForElement(this.selectors.menuBar);
        await this.waitForElement(this.selectors.appTitle);
        
        const titleText = await this.getElementText(this.selectors.appTitle);
        return titleText.includes('Employee Manager');
    }

    /**
     * Check which navigation links are visible (depends on login state)
     */
    async getVisibleNavigationLinks() {
        const links = {};
        
        links.addEmployee = await this.isElementVisible(this.selectors.addEmployeeLink);
        links.employeeList = await this.isElementVisible(this.selectors.employeeListLink);
        links.login = await this.isElementVisible(this.selectors.loginLink);
        links.logoff = await this.isElementVisible(this.selectors.logoffButton);
        
        return links;
    }

    /**
     * Navigate using Add Employee link
     */
    async navigateToAddEmployee() {
        await this.clickElement(this.selectors.addEmployeeLink);
        await this.waitForNetworkIdle();
        
        // Verify navigation
        const currentUrl = this.getCurrentURL();
        return currentUrl.includes('/form') || currentUrl.includes('/list');
    }

    /**
     * Navigate using Employee List link
     */
    async navigateToEmployeeList() {
        await this.clickElement(this.selectors.employeeListLink);
        await this.waitForNetworkIdle();
        
        // Verify navigation
        const currentUrl = this.getCurrentURL();
        return currentUrl.includes('/list');
    }

    /**
     * Navigate using Login link
     */
    async navigateToLogin() {
        await this.clickElement(this.selectors.loginLink);
        await this.waitForNetworkIdle();
        
        // Verify navigation
        const currentUrl = this.getCurrentURL();
        return currentUrl.includes('/login');
    }

    /**
     * Click logoff button
     */
    async logoff() {
        await this.clickElement(this.selectors.logoffButton);
        await this.waitForNetworkIdle();
        
        // Verify logout - should redirect to login or show login link
        const currentUrl = this.getCurrentURL();
        const loginLinkVisible = await this.isElementVisible(this.selectors.loginLink);
        
        return currentUrl.includes('/login') || loginLinkVisible;
    }

    /**
     * Toggle theme (light/dark mode)
     */
    async toggleTheme() {
        // Get current theme state before toggle
        const currentTheme = await this.getCurrentTheme();
        
        // Click theme toggle button
        await this.clickElement(this.selectors.themeToggleButton);
        
        // Wait a moment for theme to change
        await this.page.waitForTimeout(500);
        
        // Get new theme state
        const newTheme = await this.getCurrentTheme();
        
        return {
            previousTheme: currentTheme,
            newTheme: newTheme,
            themeChanged: currentTheme !== newTheme
        };
    }

    /**
     * Determine current theme (light or dark)
     */
    async getCurrentTheme() {
        try {
            // Method 1: Check for theme-specific icons
            const lightIconVisible = await this.isElementVisible(this.selectors.lightModeIcon);
            const darkIconVisible = await this.isElementVisible(this.selectors.darkModeIcon);
            
            if (lightIconVisible) return 'light';
            if (darkIconVisible) return 'dark';
            
            // Method 2: Check computed styles or classes
            const bodyClasses = await this.page.evaluate(() => document.body.className);
            if (bodyClasses.includes('dark')) return 'dark';
            if (bodyClasses.includes('light')) return 'light';
            
            // Method 3: Check background color
            const backgroundColor = await this.page.evaluate(() => {
                const body = document.body;
                const styles = window.getComputedStyle(body);
                return styles.backgroundColor;
            });
            
            // Dark backgrounds typically have lower RGB values
            const rgbMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (rgbMatch) {
                const [, r, g, b] = rgbMatch.map(num => parseInt(num));
                const brightness = (r + g + b) / 3;
                return brightness < 128 ? 'dark' : 'light';
            }
            
            // Default assumption
            return 'light';
            
        } catch (error) {
            console.warn('Could not determine theme:', error);
            return 'unknown';
        }
    }

    /**
     * Test theme toggle functionality multiple times
     * @param {number} toggleCount - Number of times to toggle theme
     */
    async testThemeToggling(toggleCount = 3) {
        const results = [];
        
        for (let i = 0; i < toggleCount; i++) {
            const toggleResult = await this.toggleTheme();
            results.push({
                iteration: i + 1,
                ...toggleResult
            });
        }
        
        return results;
    }

    /**
     * Verify theme persistence within session
     */
    async verifyThemePersistence() {
        // Set to dark theme
        const initialTheme = await this.getCurrentTheme();
        
        if (initialTheme !== 'dark') {
            await this.toggleTheme();
        }
        
        const darkThemeSet = await this.getCurrentTheme();
        
        // Navigate to different page
        await this.navigateToEmployeeList();
        const themeOnListPage = await this.getCurrentTheme();
        
        // Navigate back
        await this.navigate('/');
        const themeAfterNavigation = await this.getCurrentTheme();
        
        return {
            initialTheme,
            darkThemeSet,
            themeOnListPage,
            themeAfterNavigation,
            persistentAcrossPages: themeOnListPage === darkThemeSet,
            persistentAfterNavigation: themeAfterNavigation === darkThemeSet
        };
    }

    /**
     * Test navigation flow for authenticated user
     */
    async testAuthenticatedNavigation() {
        const results = {
            visibleLinks: await this.getVisibleNavigationLinks()
        };
        
        // Test Add Employee navigation
        if (results.visibleLinks.addEmployee) {
            results.addEmployeeNavigation = await this.navigateToAddEmployee();
        }
        
        // Test Employee List navigation
        if (results.visibleLinks.employeeList) {
            results.employeeListNavigation = await this.navigateToEmployeeList();
        }
        
        // Test Logoff
        if (results.visibleLinks.logoff) {
            results.logoffSuccessful = await this.logoff();
        }
        
        return results;
    }

    /**
     * Test navigation flow for unauthenticated user
     */
    async testUnauthenticatedNavigation() {
        const results = {
            visibleLinks: await this.getVisibleNavigationLinks()
        };
        
        // Should only see login link and theme toggle
        results.onlyPublicLinksVisible = !results.visibleLinks.addEmployee && 
                                        !results.visibleLinks.employeeList && 
                                        !results.visibleLinks.logoff;
        
        // Test Login navigation if visible
        if (results.visibleLinks.login) {
            results.loginNavigation = await this.navigateToLogin();
        }
        
        return results;
    }

    /**
     * Verify responsive design - check if mobile menu appears on small screens
     */
    async testResponsiveMenu() {
        // Get initial viewport
        const originalViewport = this.page.viewportSize();
        
        // Test mobile viewport
        await this.page.setViewportSize({ width: 375, height: 667 });
        await this.page.waitForTimeout(500);
        
        const mobileMenuVisible = await this.isElementVisible(this.selectors.mobileMenuButton);
        
        // Test desktop viewport
        await this.page.setViewportSize({ width: 1200, height: 800 });
        await this.page.waitForTimeout(500);
        
        const desktopLinksVisible = await this.getVisibleNavigationLinks();
        
        // Restore original viewport
        if (originalViewport) {
            await this.page.setViewportSize(originalViewport);
        }
        
        return {
            mobileMenuVisible,
            desktopLinksVisible,
            responsiveDesignWorking: mobileMenuVisible || Object.values(desktopLinksVisible).some(visible => visible)
        };
    }

    /**
     * Get user information if displayed
     */
    async getUserInfo() {
        try {
            await this.waitForElement(this.selectors.userInfo, 2000);
            return await this.getElementText(this.selectors.userInfo);
        } catch {
            return null;
        }
    }

    /**
     * Verify menu bar accessibility
     */
    async verifyAccessibility() {
        const results = {
            menuBarHasRole: false,
            linksHaveText: false,
            buttonsHaveLabels: false,
            themeToggleAccessible: false
        };
        
        try {
            // Check if menu bar has proper ARIA roles
            const menuBarRole = await this.page.locator(this.selectors.menuBar).getAttribute('role');
            results.menuBarHasRole = menuBarRole === 'banner' || menuBarRole === 'navigation';
            
            // Check if navigation links have text content
            const links = await this.page.locator(`${this.selectors.menuBar} a`).all();
            if (links.length > 0) {
                const linkTexts = await Promise.all(links.map(link => link.textContent()));
                results.linksHaveText = linkTexts.every(text => text && text.trim().length > 0);
            }
            
            // Check if buttons have labels or text
            const buttons = await this.page.locator(`${this.selectors.menuBar} button`).all();
            if (buttons.length > 0) {
                const buttonLabels = await Promise.all(buttons.map(async button => {
                    const text = await button.textContent();
                    const ariaLabel = await button.getAttribute('aria-label');
                    return text || ariaLabel;
                }));
                results.buttonsHaveLabels = buttonLabels.every(label => label && label.trim().length > 0);
            }
            
            // Check theme toggle accessibility
            const themeToggle = this.page.locator(this.selectors.themeToggleButton);
            const themeToggleLabel = await themeToggle.getAttribute('aria-label');
            const themeToggleText = await themeToggle.textContent();
            results.themeToggleAccessible = !!(themeToggleLabel || themeToggleText);
            
        } catch (error) {
            console.warn('Accessibility check failed:', error);
        }
        
        return results;
    }

    /**
     * Test all menu functionality comprehensively
     */
    async performComprehensiveMenuTest() {
        const results = {
            menuBarVisible: await this.verifyMenuBar(),
            themeToggling: await this.testThemeToggling(2),
            themePersistence: await this.verifyThemePersistence(),
            responsiveDesign: await this.testResponsiveMenu(),
            accessibility: await this.verifyAccessibility()
        };
        
        return results;
    }
}

module.exports = { MenuBarPage };