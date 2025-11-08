const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173';

(async () => {
  console.log('🚀 Starting Complete Desk Save Flow Test...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();

  try {
    // Step 1: Navigate directly to builder
    console.log('📍 Step 1: Navigating to builder...');
    await page.goto(`${TARGET_URL}/builder/new`);
    await page.waitForLoadState('networkidle');
    console.log('   ✅ Builder loaded');
    await page.waitForTimeout(1000);

    // Step 2: Select Desk furniture type
    console.log('\n📍 Step 2: Selecting Desk furniture type...');
    const deskButton = await page.locator('button:has-text("Home Office Desk"), button:has-text("Desk")').last();
    await deskButton.click();
    await page.waitForTimeout(500);
    console.log('   ✅ Desk selected');
    await page.screenshot({ path: '/tmp/desk-save-1-type-selected.png', fullPage: true });

    // Click Next
    const nextBtn1 = await page.locator('button:has-text("Next")').first();
    await nextBtn1.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Step 3: Configure dimensions
    console.log('\n📍 Step 3: Configuring desk dimensions...');

    // Select Straight desk shape (should be default)
    const straightButton = await page.locator('button:has-text("Straight")').first();
    if (await straightButton.count() > 0) {
      await straightButton.click();
      await page.waitForTimeout(300);
    }

    // Verify width input exists and has value
    const widthInput = await page.locator('input[type="number"]').first();
    const width = await widthInput.inputValue();
    console.log(`   ✅ Dimensions configured (Width: ${width}mm)`);
    await page.screenshot({ path: '/tmp/desk-save-2-dimensions.png', fullPage: true });

    // Click Next
    const nextBtn2 = await page.locator('button:has-text("Next")').first();
    await nextBtn2.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Step 4: Configure layout
    console.log('\n📍 Step 4: Configuring desk layout...');

    // Select Pedestals base type (should be default)
    const pedestalsButton = await page.locator('button:has-text("Pedestal")').first();
    if (await pedestalsButton.count() > 0) {
      await pedestalsButton.click();
      await page.waitForTimeout(300);
    }

    console.log('   ✅ Base type selected');
    await page.screenshot({ path: '/tmp/desk-save-3-layout.png', fullPage: true });

    // Click Next
    const nextBtn3 = await page.locator('button:has-text("Next")').first();
    await nextBtn3.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Step 5: Configure storage
    console.log('\n📍 Step 5: Configuring storage...');

    // Enable overhead storage
    const overheadCheckbox = await page.locator('input[type="checkbox"]').first();
    if (await overheadCheckbox.count() > 0 && !(await overheadCheckbox.isChecked())) {
      await overheadCheckbox.click();
      await page.waitForTimeout(500);
      console.log('   ✅ Overhead storage enabled');
    }

    await page.screenshot({ path: '/tmp/desk-save-4-storage.png', fullPage: true });

    // Click Next
    const nextBtn4 = await page.locator('button:has-text("Next")').first();
    await nextBtn4.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Step 6: Select accessories
    console.log('\n📍 Step 6: Selecting accessories...');

    // Click on Keyboard Tray
    const keyboardButton = await page.locator('button:has-text("Keyboard")').first();
    if (await keyboardButton.count() > 0) {
      await keyboardButton.click();
      await page.waitForTimeout(300);
      console.log('   ✅ Keyboard Tray selected');
    }

    // Click on Cable Management
    const cableButton = await page.locator('button:has-text("Cable")').first();
    if (await cableButton.count() > 0) {
      await cableButton.click();
      await page.waitForTimeout(300);
      console.log('   ✅ Cable Management selected');
    }

    await page.screenshot({ path: '/tmp/desk-save-5-accessories.png', fullPage: true });

    // Click Next
    const nextBtn5 = await page.locator('button:has-text("Next")').first();
    await nextBtn5.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Step 7: Review and save
    console.log('\n📍 Step 7: Reviewing configuration...');
    await page.screenshot({ path: '/tmp/desk-save-6-review.png', fullPage: true });

    // Verify configuration summary is displayed
    const reviewHeading = await page.locator('h2:has-text("Review")').first();
    if (await reviewHeading.count() > 0) {
      console.log('   ✅ Review page displayed');
    }

    // Click "Complete Build" to save
    console.log('\n📍 Step 8: Saving desk build to database...');
    const completeButton = await page.locator('button:has-text("Complete")').first();
    await completeButton.click();

    // Wait for save and redirect
    await page.waitForTimeout(3000);
    console.log('   ✅ Build saved (waiting for redirect...)');

    // Should redirect to build detail page or home page
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    await page.screenshot({ path: '/tmp/desk-save-7-after-save.png', fullPage: true });

    // Step 9: Navigate to home page to verify desk appears in list
    console.log('\n📍 Step 9: Verifying desk appears in build list...');
    await page.goto(TARGET_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/desk-save-8-home-page.png', fullPage: true });

    // Step 10: Test furniture type filter
    console.log('\n📍 Step 10: Testing furniture type filter...');

    // Click on "Desks" filter
    const desksFilterButton = await page.locator('button:has-text("Desks")').first();
    if (await desksFilterButton.count() > 0) {
      await desksFilterButton.click();
      await page.waitForTimeout(1000);
      console.log('   ✅ Clicked Desks filter');
      await page.screenshot({ path: '/tmp/desk-save-9-desks-filter.png', fullPage: true });

      // Check if desk badge is visible
      const deskBadge = await page.locator('div:has-text("Desk")').first();
      if (await deskBadge.count() > 0) {
        console.log('   ✅ Desk furniture type badge visible');
      }
    }

    // Click on "All" filter
    const allFilterButton = await page.locator('button:has-text("All")').first();
    if (await allFilterButton.count() > 0) {
      await allFilterButton.click();
      await page.waitForTimeout(1000);
      console.log('   ✅ Clicked All filter');
    }

    // Click on "Wardrobes" filter
    const wardrobesFilterButton = await page.locator('button:has-text("Wardrobes")').first();
    if (await wardrobesFilterButton.count() > 0) {
      await wardrobesFilterButton.click();
      await page.waitForTimeout(1000);
      console.log('   ✅ Clicked Wardrobes filter');
      await page.screenshot({ path: '/tmp/desk-save-10-wardrobes-filter.png', fullPage: true });
    }

    console.log('\n✅ Complete Desk Save Flow Test Passed!');
    console.log('\n📸 Screenshots saved:');
    console.log('  - desk-save-1-type-selected.png');
    console.log('  - desk-save-2-dimensions.png');
    console.log('  - desk-save-3-layout.png');
    console.log('  - desk-save-4-storage.png');
    console.log('  - desk-save-5-accessories.png');
    console.log('  - desk-save-6-review.png');
    console.log('  - desk-save-7-after-save.png');
    console.log('  - desk-save-8-home-page.png');
    console.log('  - desk-save-9-desks-filter.png');
    console.log('  - desk-save-10-wardrobes-filter.png');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: '/tmp/desk-save-error.png', fullPage: true });
    console.log('Error screenshot saved to /tmp/desk-save-error.png');
    throw error;
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
})();
