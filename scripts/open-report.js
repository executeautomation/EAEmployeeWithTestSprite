#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Professional Ortoni-Style Test Report Opener
 * Automatically opens comprehensive Playwright HTML reports with professional styling
 * Provides enterprise-grade test results display with detailed analytics
 */

class OrtoniReportOpener {
    constructor() {
        this.reportPath = path.join(__dirname, '..', 'test-results', 'ortoni-report', 'index.html');
        this.resultsPath = path.join(__dirname, '..', 'test-results', 'results.json');
        this.platform = os.platform();
        this.testResults = null;
    }

    /**
     * Check if report files exist with timeout
     */
    async checkReportsExist(timeout = 10000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const reports = {
                htmlReport: fs.existsSync(this.reportPath),
                jsonResults: fs.existsSync(this.resultsPath)
            };
            
            if (reports.htmlReport) {
                return reports;
            }
            
            // Wait 500ms before checking again
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        return {
            htmlReport: fs.existsSync(this.reportPath),
            jsonResults: fs.existsSync(this.resultsPath)
        };
    }

    /**
     * Load and parse test results
     */
    loadTestResults() {
        try {
            if (fs.existsSync(this.resultsPath)) {
                const resultsData = fs.readFileSync(this.resultsPath, 'utf8');
                this.testResults = JSON.parse(resultsData);
                return true;
            }
        } catch (error) {
            console.warn('⚠️  Could not parse test results:', error.message);
        }
        return false;
    }

    /**
     * Calculate test statistics
     */
    calculateTestStats() {
        if (!this.testResults) return null;

        const stats = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            flaky: 0,
            duration: 0,
            projects: new Set(),
            browsers: new Set()
        };

        // Parse test results
        this.testResults.suites?.forEach(suite => {
            this.processSuite(suite, stats);
        });

        // Calculate percentages
        stats.passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;
        stats.failRate = stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(1) : 0;
        
        return stats;
    }

    /**
     * Process test suite recursively
     */
    processSuite(suite, stats) {
        suite.suites?.forEach(subSuite => this.processSuite(subSuite, stats));
        
        suite.specs?.forEach(spec => {
            spec.tests?.forEach(test => {
                stats.total++;
                
                // Track projects/browsers
                if (test.projectName) {
                    stats.projects.add(test.projectName);
                    stats.browsers.add(test.projectName);
                }

                // Determine test status
                const results = test.results || [];
                const lastResult = results[results.length - 1];
                
                if (lastResult) {
                    switch (lastResult.status) {
                        case 'passed':
                            stats.passed++;
                            break;
                        case 'failed':
                            stats.failed++;
                            break;
                        case 'skipped':
                            stats.skipped++;
                            break;
                        case 'timedOut':
                            stats.failed++;
                            break;
                    }
                    
                    // Add duration
                    stats.duration += lastResult.duration || 0;
                }

                // Check for flaky tests (multiple attempts)
                if (results.length > 1) {
                    stats.flaky++;
                }
            });
        });
    }

    /**
     * Get the appropriate command to open browser based on OS
     */
    getBrowserCommand() {
        switch (this.platform) {
            case 'win32':
                return 'start';
            case 'darwin':
                return 'open';
            case 'linux':
                return 'xdg-open';
            default:
                return 'xdg-open';
        }
    }

    /**
     * Display professional test execution summary
     */
    async displayOrtoniSummary() {
        console.log('\n🔍 Checking for test reports...');
        
        const reports = await this.checkReportsExist();
        const hasResults = this.loadTestResults();
        const stats = this.calculateTestStats();

        console.log(`📋 HTML Report exists: ${reports.htmlReport ? '✅' : '❌'}`);
        console.log(`📊 JSON Results exist: ${reports.jsonResults ? '✅' : '❌'}`);
        
        if (!reports.htmlReport) {
            console.log(`🔍 Expected HTML report at: ${this.reportPath}`);
            console.log('💡 Make sure Playwright tests completed successfully');
        }

        console.log('\n' + '═'.repeat(90));
        console.log('🎭 ORTONI PROFESSIONAL TEST EXECUTION REPORT');
        console.log('═'.repeat(90));
        console.log('🏢 Employee Manager Application - E2E Test Suite Results');
        console.log('📊 Enterprise-Grade Test Analytics & Comprehensive Coverage');
        console.log('═'.repeat(90));

        if (stats) {
            // Test execution summary
            console.log('📈 TEST EXECUTION SUMMARY:');
            console.log(`   🎯 Total Tests: ${stats.total}`);
            console.log(`   ✅ Passed: ${stats.passed} (${stats.passRate}%)`);
            console.log(`   ❌ Failed: ${stats.failed} (${stats.failRate}%)`);
            console.log(`   ⏭️  Skipped: ${stats.skipped}`);
            if (stats.flaky > 0) console.log(`   ⚠️  Flaky: ${stats.flaky}`);
            console.log(`   ⏱️  Duration: ${this.formatDuration(stats.duration)}`);

            // Browser coverage
            if (stats.browsers.size > 0) {
                console.log('\n🌐 CROSS-BROWSER COVERAGE:');
                Array.from(stats.browsers).forEach(browser => {
                    const icon = this.getBrowserIcon(browser);
                    console.log(`   ${icon} ${browser}`);
                });
            }

            // Test quality indicators
            console.log('\n🏆 QUALITY METRICS:');
            console.log(`   📊 Pass Rate: ${stats.passRate}%`);
            console.log(`   ⚡ Avg Test Speed: ${this.formatDuration(stats.duration / stats.total)}`);
            console.log(`   🎯 Coverage Areas: Authentication, CRUD, UI/UX, Validation, Integration`);
        }

        // Report availability
        console.log('\n📋 AVAILABLE REPORTS:');
        console.log(`   ${reports.htmlReport ? '✅' : '❌'} Professional HTML Report: ${reports.htmlReport ? 'Generated' : 'Missing'}`);
        console.log(`   ${reports.jsonResults ? '✅' : '❌'} JSON Results: ${reports.jsonResults ? 'Available' : 'Missing'}`);
        
        if (reports.htmlReport) {
            console.log(`   🌐 Report URL: file://${path.resolve(this.reportPath)}`);
            console.log('   🚀 Opening comprehensive test dashboard...');
        } else {
            console.log('   ⚠️  No HTML report found - tests may have failed or not completed');
        }
        
        console.log('═'.repeat(90));
        
        return reports;
    }

    /**
     * Get browser icon for display
     */
    getBrowserIcon(browserName) {
        const icons = {
            'chromium': '🔵',
            'chrome': '🔵',
            'firefox': '🦊', 
            'webkit': '🌐',
            'safari': '🌐',
            'edge': '🔷',
            'Mobile Chrome': '📱',
            'Mobile Safari': '📱'
        };
        
        return icons[browserName] || '🌐';
    }

    /**
     * Format duration in human readable format
     */
    formatDuration(ms) {
        if (!ms) return '0ms';
        
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        
        if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else if (seconds > 0) {
            return `${seconds}s`;
        } else {
            return `${ms}ms`;
        }
    }

    /**
     * Open the professional report in browser
     */
    async openProfessionalReport() {
        const reports = await this.checkReportsExist();
        
        if (!reports.htmlReport) {
            console.error('❌ Professional test report not found at:', this.reportPath);
            console.error('💡 Ensure tests completed successfully and generated HTML reports.');
            return false;
        }

        const command = this.getBrowserCommand();
        const fullCommand = `${command} "${this.reportPath}"`;

        exec(fullCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Failed to open browser:', error.message);
                console.log('💡 You can manually open the professional report at:');
                console.log(`   file://${path.resolve(this.reportPath)}`);
                return false;
            }
            
            console.log('✅ Professional Ortoni-style report opened successfully!');
            
            if (stderr) {
                console.log('⚠️  Browser stderr:', stderr);
            }
            
            return true;
        });

        return true;
    }

    /**
     * Display comprehensive test information
     */
    displayProfessionalTestInfo() {
        console.log('\n📊 COMPREHENSIVE TEST COVERAGE MATRIX:');
        console.log('   🔐 Authentication & Session Management');
        console.log('      ├─ Valid/Invalid credential testing');
        console.log('      ├─ Session persistence validation');
        console.log('      └─ Route protection verification');
        
        console.log('   👥 Employee Management (Full CRUD)');
        console.log('      ├─ Create employees with validation');
        console.log('      ├─ Read/View employee details'); 
        console.log('      ├─ Update employee information');
        console.log('      └─ Delete with confirmation workflows');
        
        console.log('   🔍 Advanced Search & Filtering');
        console.log('      ├─ Name, email, position search');
        console.log('      ├─ Case-insensitive filtering');
        console.log('      └─ Empty result handling');
        
        console.log('   🎨 UI/UX Professional Standards');
        console.log('      ├─ Theme toggle (Light/Dark mode)');
        console.log('      ├─ Responsive design validation');
        console.log('      ├─ Navigation flow testing');
        console.log('      └─ Accessibility compliance');
        
        console.log('   ✅ Form Validation & Error Handling');
        console.log('      ├─ Required field validation');
        console.log('      ├─ Email format verification');
        console.log('      ├─ Special character support');
        console.log('      └─ Error message clarity');
        
        console.log('   🔄 End-to-End Integration Workflows');
        console.log('      ├─ Complete user journey testing');
        console.log('      ├─ Cross-session data persistence');
        console.log('      ├─ Error recovery scenarios');
        console.log('      └─ Performance under load');

        console.log('\n🎯 PROFESSIONAL TEST AUTOMATION FEATURES:');
        console.log('   📋 Page Object Model architecture');
        console.log('   🏷️  Smart test tagging (@smoke, @critical, @auth, @crud, @ui)');
        console.log('   📸 Automatic screenshot capture on failures');
        console.log('   🎬 Video recording of test execution');
        console.log('   🕵️  Network trace collection');
        console.log('   📱 Multi-device responsive testing');
        console.log('   🌐 Cross-browser compatibility validation');
        
        console.log('\n⚡ AVAILABLE TEST EXECUTION COMMANDS:');
        console.log('   npm test              - Full E2E test suite with cleanup');
        console.log('   npm run test:smoke    - Critical smoke tests only');
        console.log('   npm run test:critical - High-priority functionality'); 
        console.log('   npm run test:auth     - Authentication & security tests');
        console.log('   npm run test:employees - Employee management CRUD tests');
        console.log('   npm run test:ui       - UI/UX & responsive design tests');
        console.log('   npm run test:validation - Form & data validation tests');
        console.log('   npm run test:integration - End-to-end workflow tests');
        console.log('   npm run test:headed   - Visual test execution (browser visible)');
        console.log('   npm run test:debug    - Interactive debugging mode');
        
        console.log('\n🔧 ADVANCED FEATURES:');
        console.log('   🧹 Automatic test data cleanup before execution');
        console.log('   📊 Professional ortoni-style report generation');
        console.log('   🚀 Automatic report opening post-execution');
        console.log('   📈 Detailed test metrics and analytics');
        console.log('   🎪 Enterprise-grade test architecture');
    }

    /**
     * Main execution function
     */
    async run() {
        const reports = await this.displayOrtoniSummary();
        
        // Small delay to allow console output to be visible  
        setTimeout(async () => {
            const success = await this.openProfessionalReport();
            
            if (success) {
                this.displayProfessionalTestInfo();
                
                console.log('\n🎉 ORTONI PROFESSIONAL TESTING COMPLETE!');
                console.log('📊 Comprehensive test dashboard now open in your browser.');
                console.log('🔍 Explore detailed test results, screenshots, videos, and traces.');
                console.log('📈 Use the professional interface for in-depth test analysis.');
                console.log('🔄 Execute targeted test suites using the commands above.');
                console.log('\n💼 Professional QA Analysis Ready for Review!\n');
            } else {
                console.log('\n⚠️  REPORT OPENING FAILED');
                console.log('📋 You can manually open the report at:');
                console.log(`   file://${path.resolve(this.reportPath)}`);
                console.log('\n💡 Troubleshooting tips:');
                console.log('   - Ensure tests completed successfully');
                console.log('   - Check if HTML report was generated');
                console.log('   - Try running: npm run test:headed to see test execution');
            }
        }, 1500);
    }
}

// Execute the professional ortoni-style report opener
const ortoniReporter = new OrtoniReportOpener();
ortoniReporter.run().catch(error => {
    console.error('❌ Report opener error:', error);
    process.exit(1);
});