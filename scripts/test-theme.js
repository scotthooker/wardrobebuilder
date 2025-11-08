/**
 * Theme Verification Script
 *
 * Takes screenshots of the app in light and dark modes
 * Tests readability, contrast, and color palette implementation
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots/theme-verification');
const APP_URL = 'http://localhost:5173';

async function ensureScreenshotDir() {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  console.log(`📁 Screenshot directory: ${SCREENSHOT_DIR}`);
}

async function testTheme() {
  console.log('🎨 Starting Nordic Timber Theme Verification\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // Navigate to app
    console.log(`🌐 Navigating to ${APP_URL}...`);
    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Wait for initial render

    // Test Light Mode
    console.log('\n☀️  Testing Light Mode (Nordic Day)\n');

    // Ensure light mode is active
    const htmlClass = await page.getAttribute('html', 'class');
    if (htmlClass?.includes('dark')) {
      console.log('   Switching to light mode...');
      await page.click('button:has-text("Dark"), button:has-text("Light")').catch(() => {
        console.log('   Theme toggle not found, using default mode');
      });
      await page.waitForTimeout(500);
    }

    // Screenshot 1: Home page - light mode
    console.log('   📸 Capturing home page...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-home-light.png'),
      fullPage: true
    });

    // Screenshot 2: Hover state on button
    console.log('   📸 Capturing button hover states...');
    const primaryButton = page.locator('button, a').filter({ hasText: /Create|Build|New|Start/i }).first();
    if (await primaryButton.count() > 0) {
      await primaryButton.hover();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '02-button-hover-light.png'),
        fullPage: false
      });
    }

    // Screenshot 3: Navigate to build detail if available
    const buildCard = page.locator('[class*="card"], [class*="Card"]').first();
    if (await buildCard.count() > 0) {
      console.log('   📸 Capturing build card detail...');
      await buildCard.click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '03-detail-light.png'),
        fullPage: true
      });

      // Go back to home
      await page.goBack();
      await page.waitForTimeout(500);
    }

    // Screenshot 4: Form elements if available
    const formInput = page.locator('input, select').first();
    if (await formInput.count() > 0) {
      console.log('   📸 Capturing form elements...');
      await formInput.focus();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '04-forms-light.png'),
        fullPage: false
      });
    }

    // Test Dark Mode
    console.log('\n🌙 Testing Dark Mode (Nordic Night)\n');

    // Toggle to dark mode
    const themeToggle = page.locator('button').filter({
      has: page.locator('svg')
    }).filter({
      hasText: /(Dark|Light|Moon|Sun)/i
    }).first();

    if (await themeToggle.count() > 0) {
      console.log('   Switching to dark mode...');
      await themeToggle.click();
      await page.waitForTimeout(500);
    } else {
      // Try to set dark mode via console
      console.log('   Setting dark mode via script...');
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      });
      await page.waitForTimeout(500);
    }

    // Screenshot 5: Home page - dark mode
    console.log('   📸 Capturing home page (dark)...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '05-home-dark.png'),
      fullPage: true
    });

    // Screenshot 6: Button hover - dark mode
    console.log('   📸 Capturing button hover states (dark)...');
    if (await primaryButton.count() > 0) {
      await primaryButton.hover();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '06-button-hover-dark.png'),
        fullPage: false
      });
    }

    // Screenshot 7: Detail page - dark mode
    if (await buildCard.count() > 0) {
      console.log('   📸 Capturing build card detail (dark)...');
      await buildCard.click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '07-detail-dark.png'),
        fullPage: true
      });
    }

    // Screenshot 8: Color palette swatches
    console.log('\n🎨 Testing Color Palette\n');

    // Navigate back to home
    await page.goto(APP_URL);
    await page.waitForTimeout(1000);

    // Take a focused screenshot of primary interactive elements
    console.log('   📸 Capturing UI components...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '08-components-overview.png'),
      fullPage: false
    });

    // Test Accessibility
    console.log('\n♿ Testing Accessibility\n');

    // Check focus states
    console.log('   ⌨️  Testing keyboard focus states...');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '09-focus-state.png'),
      fullPage: false
    });

    // Get color values from computed styles
    console.log('\n🎨 Extracting Color Values\n');

    const colors = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);

      return {
        mode: root.classList.contains('dark') ? 'dark' : 'light',
        primary: styles.getPropertyValue('--color-primary-500').trim(),
        secondary: styles.getPropertyValue('--color-secondary-500').trim(),
        accent: styles.getPropertyValue('--color-accent-500').trim(),
        background: styles.getPropertyValue('--color-background').trim(),
        textPrimary: styles.getPropertyValue('--color-text-primary').trim(),
        textSecondary: styles.getPropertyValue('--color-text-secondary').trim(),
      };
    });

    console.log(`   Mode: ${colors.mode}`);
    console.log(`   Primary: rgb(${colors.primary})`);
    console.log(`   Secondary: rgb(${colors.secondary})`);
    console.log(`   Accent: rgb(${colors.accent})`);
    console.log(`   Background: rgb(${colors.background})`);
    console.log(`   Text Primary: rgb(${colors.textPrimary})`);
    console.log(`   Text Secondary: rgb(${colors.textSecondary})`);

    // Check contrast ratios
    console.log('\n📊 Checking Contrast Ratios\n');

    const contrastResults = await page.evaluate(() => {
      function rgbToLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }

      function getContrast(rgb1, rgb2) {
        const [r1, g1, b1] = rgb1.split(' ').map(Number);
        const [r2, g2, b2] = rgb2.split(' ').map(Number);

        const l1 = rgbToLuminance(r1, g1, b1);
        const l2 = rgbToLuminance(r2, g2, b2);

        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);

        return (lighter + 0.05) / (darker + 0.05);
      }

      const root = document.documentElement;
      const styles = getComputedStyle(root);

      const primary = styles.getPropertyValue('--color-primary-500').trim();
      const background = styles.getPropertyValue('--color-background').trim();
      const textPrimary = styles.getPropertyValue('--color-text-primary').trim();
      const textSecondary = styles.getPropertyValue('--color-text-secondary').trim();
      const success = styles.getPropertyValue('--color-success-500').trim();
      const error = styles.getPropertyValue('--color-error-500').trim();
      const warning = styles.getPropertyValue('--color-warning-500').trim();

      return {
        primaryOnBg: getContrast(primary, background).toFixed(2),
        textPrimaryOnBg: getContrast(textPrimary, background).toFixed(2),
        textSecondaryOnBg: getContrast(textSecondary, background).toFixed(2),
        successOnBg: getContrast(success, background).toFixed(2),
        errorOnBg: getContrast(error, background).toFixed(2),
        warningOnBg: getContrast(warning, background).toFixed(2),
      };
    });

    function checkWCAG(ratio) {
      if (ratio >= 7) return '✅ AAA';
      if (ratio >= 4.5) return '✅ AA';
      return '❌ Fail';
    }

    console.log(`   Primary on Background: ${contrastResults.primaryOnBg}:1 ${checkWCAG(parseFloat(contrastResults.primaryOnBg))}`);
    console.log(`   Text Primary on Background: ${contrastResults.textPrimaryOnBg}:1 ${checkWCAG(parseFloat(contrastResults.textPrimaryOnBg))}`);
    console.log(`   Text Secondary on Background: ${contrastResults.textSecondaryOnBg}:1 ${checkWCAG(parseFloat(contrastResults.textSecondaryOnBg))}`);
    console.log(`   Success on Background: ${contrastResults.successOnBg}:1 ${checkWCAG(parseFloat(contrastResults.successOnBg))}`);
    console.log(`   Error on Background: ${contrastResults.errorOnBg}:1 ${checkWCAG(parseFloat(contrastResults.errorOnBg))}`);
    console.log(`   Warning on Background: ${contrastResults.warningOnBg}:1 ${checkWCAG(parseFloat(contrastResults.warningOnBg))}`);

    // Create summary report
    const report = {
      timestamp: new Date().toISOString(),
      theme: 'Nordic Timber',
      mode: colors.mode,
      colors,
      contrast: contrastResults,
      screenshots: [
        '01-home-light.png',
        '02-button-hover-light.png',
        '03-detail-light.png',
        '04-forms-light.png',
        '05-home-dark.png',
        '06-button-hover-dark.png',
        '07-detail-dark.png',
        '08-components-overview.png',
        '09-focus-state.png',
      ],
    };

    await fs.writeFile(
      path.join(SCREENSHOT_DIR, 'test-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n📄 Report Summary\n');
    console.log(`   Screenshots: ${report.screenshots.length} captured`);
    console.log(`   Location: ${SCREENSHOT_DIR}`);
    console.log(`   Report: test-report.json`);

    console.log('\n✅ Theme verification complete!\n');

  } catch (error) {
    console.error('\n❌ Error during theme verification:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
await ensureScreenshotDir();
await testTheme();
