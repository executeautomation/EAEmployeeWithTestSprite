class BasePage {
    constructor(page) {
        this.page = page;
        this.baseURL = 'http://localhost:5173';
    }

    /**
     * Navigate to a specific path
     * @param {string} path - The path to navigate to
     */
    async navigate(path = '') {
        await this.page.goto(`${this.baseURL}${path}`);
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Wait for element to be visible
     * @param {string} selector - Element selector
     * @param {number} timeout - Optional timeout in ms
     */
    async waitForElement(selector, timeout = 5000) {
        return await this.page.waitForSelector(selector, { 
            state: 'visible', 
            timeout 
        });
    }

    /**
     * Click element with retry mechanism
     * @param {string} selector - Element selector
     */
    async clickElement(selector) {
        await this.page.locator(selector).click();
    }

    /**
     * Fill input field
     * @param {string} selector - Input selector
     * @param {string} value - Value to fill
     */
    async fillInput(selector, value) {
        await this.page.locator(selector).clear();
        await this.page.locator(selector).fill(value);
    }

    /**
     * Get text content from element
     * @param {string} selector - Element selector
     */
    async getElementText(selector) {
        return await this.page.locator(selector).textContent();
    }

    /**
     * Check if element exists and is visible
     * @param {string} selector - Element selector
     */
    async isElementVisible(selector) {
        try {
            return await this.page.locator(selector).isVisible();
        } catch {
            return false;
        }
    }

    /**
     * Wait for page title
     * @param {string} expectedTitle - Expected page title
     */
    async waitForTitle(expectedTitle) {
        await this.page.waitForFunction(
            title => document.title.includes(title),
            expectedTitle
        );
    }

    /**
     * Take screenshot with timestamp
     * @param {string} name - Screenshot name
     */
    async takeScreenshot(name) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await this.page.screenshot({
            path: `test-results/screenshots/${name}-${timestamp}.png`,
            fullPage: true
        });
    }

    /**
     * Wait for network to be idle
     */
    async waitForNetworkIdle() {
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Get current URL
     */
    getCurrentURL() {
        return this.page.url();
    }

    /**
     * Wait for element to disappear
     * @param {string} selector - Element selector
     */
    async waitForElementToDisappear(selector) {
        await this.page.waitForSelector(selector, { 
            state: 'hidden',
            timeout: 5000
        });
    }

    /**
     * Get all elements matching selector
     * @param {string} selector - Element selector
     */
    async getAllElements(selector) {
        return await this.page.locator(selector).all();
    }

    /**
     * Scroll element into view
     * @param {string} selector - Element selector
     */
    async scrollToElement(selector) {
        await this.page.locator(selector).scrollIntoViewIfNeeded();
    }
}

module.exports = { BasePage };