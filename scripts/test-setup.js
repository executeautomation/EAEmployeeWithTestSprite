#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Simple Test Report Verification
 * Quick script to test if Playwright can generate reports properly
 */

console.log('🔍 Testing Playwright Report Generation...\n');

// Check if Playwright is installed
console.log('1. Checking Playwright installation...');
exec('npx playwright --version', (error, stdout, stderr) => {
    if (error) {
        console.error('❌ Playwright not found:', error.message);
        console.log('💡 Run: npm install @playwright/test');
        return;
    }
    console.log('✅ Playwright version:', stdout.trim());

    // Check if browsers are installed
    console.log('\n2. Checking browser installation...');
    exec('npx playwright install --dry-run', (error, stdout, stderr) => {
        if (stdout.includes('is up to date')) {
            console.log('✅ Browsers are installed');
        } else {
            console.log('⚠️  Some browsers may need installation');
            console.log('💡 Run: npx playwright install');
        }

        // Test basic report generation
        console.log('\n3. Testing basic report generation...');
        
        // Create a simple test file
        const testContent = `
const { test, expect } = require('@playwright/test');

test('basic report test', async ({ page }) => {
  await page.goto('https://playwright.dev');
  expect(await page.title()).toContain('Playwright');
});
`;

        const testDir = path.join(process.cwd(), 'test-temp');
        const testFile = path.join(testDir, 'basic.spec.js');
        
        // Ensure directory exists
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
        
        // Write test file
        fs.writeFileSync(testFile, testContent);
        
        // Run test with HTML report
        const testCommand = `npx playwright test ${testFile} --reporter=html --output=test-temp-results`;
        
        console.log('   Running basic test with HTML reporter...');
        exec(testCommand, (error, stdout, stderr) => {
            // Clean up test file
            try {
                fs.unlinkSync(testFile);
                fs.rmdirSync(testDir);
            } catch {}
            
            if (error) {
                console.error('❌ Test execution failed:', error.message);
                return;
            }
            
            console.log('✅ Basic test completed');
            
            // Check if report was generated
            const reportPath = path.join(process.cwd(), 'test-temp-results', 'index.html');
            if (fs.existsSync(reportPath)) {
                console.log('✅ HTML report generated successfully');
                
                // Clean up temp results
                try {
                    const rimraf = require.resolve('rimraf');
                    require(rimraf).sync(path.join(process.cwd(), 'test-temp-results'));
                } catch {
                    console.log('📁 Temp results folder created (manual cleanup needed)');
                }
                
                console.log('\n🎉 Report generation is working!');
                console.log('💡 Your Playwright setup is ready for the Employee Manager tests.');
                console.log('\n▶️  Next steps:');
                console.log('   1. Make sure your Employee Manager app is running on http://localhost:5173');
                console.log('   2. Run: npm test');
                
            } else {
                console.log('❌ HTML report not found');
                console.log('💡 There may be an issue with report generation');
            }
        });
    });
});