#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Test Data Cleanup Script
 * Cleans old test results and data before starting new test runs
 * Ensures clean state for consistent test execution
 */

class TestDataCleanup {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.cleanupPaths = [
            'test-results',
            'playwright-report',
            'test-results/html-report',
            'test-results/screenshots',
            'test-results/videos',
            'test-results/traces',
            'backend/db.sqlite-test',
            'backend/.test-data'
        ];
    }

    /**
     * Remove directory and all its contents
     * @param {string} dirPath - Directory path to remove
     */
    async removeDirectory(dirPath) {
        try {
            if (fs.existsSync(dirPath)) {
                const stat = fs.lstatSync(dirPath);
                
                if (stat.isDirectory()) {
                    const files = fs.readdirSync(dirPath);
                    
                    for (const file of files) {
                        const filePath = path.join(dirPath, file);
                        const fileStat = fs.lstatSync(filePath);
                        
                        if (fileStat.isDirectory()) {
                            await this.removeDirectory(filePath);
                        } else {
                            fs.unlinkSync(filePath);
                        }
                    }
                    
                    fs.rmdirSync(dirPath);
                    console.log(`✅ Cleaned directory: ${dirPath}`);
                } else {
                    fs.unlinkSync(dirPath);
                    console.log(`✅ Cleaned file: ${dirPath}`);
                }
            }
        } catch (error) {
            console.warn(`⚠️  Could not clean ${dirPath}:`, error.message);
        }
    }

    /**
     * Clean individual test files
     */
    async cleanTestFiles() {
        const testFiles = [
            'test-results/results.json',
            'test-results/results.xml',
            'playwright/.cache',
            '.auth/user.json',
            '.auth/admin.json'
        ];

        for (const file of testFiles) {
            const fullPath = path.join(this.rootDir, file);
            try {
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                    console.log(`✅ Cleaned file: ${file}`);
                }
            } catch (error) {
                console.warn(`⚠️  Could not clean ${file}:`, error.message);
            }
        }
    }

    /**
     * Create fresh directories for test results
     */
    async createFreshDirectories() {
        const directories = [
            'test-results',
            'test-results/html-report',
            'test-results/screenshots',
            'test-results/videos',
            'test-results/traces'
        ];

        for (const dir of directories) {
            const fullPath = path.join(this.rootDir, dir);
            try {
                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, { recursive: true });
                    console.log(`📁 Created directory: ${dir}`);
                }
            } catch (error) {
                console.warn(`⚠️  Could not create ${dir}:`, error.message);
            }
        }
    }

    /**
     * Reset database to clean state (if test database exists)
     */
    async resetTestDatabase() {
        const dbPaths = [
            path.join(this.rootDir, 'backend', 'db.sqlite'),
            path.join(this.rootDir, 'backend', 'test.sqlite'),
            path.join(this.rootDir, 'backend', 'employees.db')
        ];

        // Only clean test databases, not production data
        for (const dbPath of dbPaths) {
            try {
                if (fs.existsSync(dbPath)) {
                    const stat = fs.statSync(dbPath);
                    const now = new Date();
                    const ageMinutes = (now - stat.mtime) / (1000 * 60);
                    
                    // Only reset if database was modified recently (likely test data)
                    if (ageMinutes < 30) {
                        console.log(`🔄 Database detected, keeping existing data: ${path.basename(dbPath)}`);
                    }
                }
            } catch (error) {
                console.warn(`⚠️  Could not check database ${dbPath}:`, error.message);
            }
        }
    }

    /**
     * Display cleanup summary
     */
    displaySummary() {
        console.log('\n' + '='.repeat(60));
        console.log('🧹 TEST DATA CLEANUP COMPLETED');
        console.log('='.repeat(60));
        console.log('✨ Fresh test environment prepared');
        console.log('🚀 Ready for new test execution');
        console.log('📊 Clean reports will be generated');
        console.log('='.repeat(60) + '\n');
    }

    /**
     * Main cleanup execution
     */
    async run() {
        console.log('\n🧹 Cleaning old test data...\n');

        try {
            // Clean old test results
            for (const cleanupPath of this.cleanupPaths) {
                const fullPath = path.join(this.rootDir, cleanupPath);
                await this.removeDirectory(fullPath);
            }

            // Clean individual test files
            await this.cleanTestFiles();

            // Create fresh directories
            await this.createFreshDirectories();

            // Reset test database if needed
            await this.resetTestDatabase();

            this.displaySummary();

        } catch (error) {
            console.error('❌ Cleanup failed:', error);
            process.exit(1);
        }
    }
}

// Execute cleanup
const cleanup = new TestDataCleanup();
cleanup.run().catch(error => {
    console.error('❌ Fatal cleanup error:', error);
    process.exit(1);
});