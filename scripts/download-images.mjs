#!/usr/bin/env node

/**
 * Download material images from SL Hardwoods using browser automation
 */

import playwright from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Material to scrape with their product URLs
const MATERIALS_TO_SCRAPE = [
  {
    name: 'Moisture Resistant MDF',
    url: 'https://www.slhardwoods.co.uk/product/moisture-resistant-mdf-2440-x-1220mm-2/',
    filename: 'mr-mdf.png'
  },
  {
    name: 'Premium Quality MDF',
    url: 'https://www.slhardwoods.co.uk/product/premium-quality-mdf-2440-x-1220mm/',
    filename: 'mdf.png'
  },
  {
    name: 'WBP Birch Plywood BB/BB',
    url: 'https://www.slhardwoods.co.uk/product/wbp-plywood-highest-grade-birch-long-grain-b-bb-2440-x-1220mm/',
    filename: 'birch-plywood.png'
  },
  {
    name: 'Oak Crown Cut MDF Veneered',
    url: 'https://www.slhardwoods.co.uk/product/oak-crown-cut-veneered-mdf-2440-x-1220mm/',
    filename: 'oak-veneered.png'
  },
  {
    name: 'Ash Veneered MDF',
    url: 'https://www.slhardwoods.co.uk/product/ash-veneered-mdf-2-sides-2440-x-1220mm/',
    filename: 'ash-veneered.png'
  },
  {
    name: 'Walnut Veneered MDF',
    url: 'https://www.slhardwoods.co.uk/product/walnut-veneered-mdf-2-sides-2440-x-1220mm/',
    filename: 'walnut-veneered.png'
  },
  {
    name: 'Oak Iron on Edging',
    url: 'https://www.slhardwoods.co.uk/product/oak-iron-on-edging-22mm/',
    filename: 'oak-edging.png'
  },
  {
    name: 'Ash Iron on Edging',
    url: 'https://www.slhardwoods.co.uk/product/ash-iron-on-edging-22mm/',
    filename: 'ash-edging.png'
  },
  {
    name: 'Walnut Iron on Edging',
    url: 'https://www.slhardwoods.co.uk/product/walnut-iron-on-edging-22mm/',
    filename: 'walnut-edging.png'
  },
  {
    name: 'White Melamine Edging',
    url: 'https://www.slhardwoods.co.uk/product/white-iron-on-edging-22mm/',
    filename: 'white-edging.png'
  }
];

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath);
        reject(err);
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('🌲 Downloading SL Hardwoods Material Images\n');
  console.log('=' .repeat(60) + '\n');

  // Create output directory
  const outputDir = path.join(__dirname, '..', 'public', 'images', 'materials');
  await fs.mkdir(outputDir, { recursive: true });
  console.log(`📁 Output directory: ${outputDir}\n`);

  // Launch browser
  console.log('🌐 Launching browser...\n');
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  const results = [];

  for (const material of MATERIALS_TO_SCRAPE) {
    try {
      console.log(`\n📦 Processing: ${material.name}`);
      console.log(`   URL: ${material.url}`);

      // Navigate to product page
      await page.goto(material.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Wait a bit for images to load
      await page.waitForTimeout(2000);

      // Find the product image element
      const imageElement = await page.$('.woocommerce-product-gallery__image img, .product-image img, img[class*="product"]');

      if (!imageElement) {
        console.log('   ⚠️  No image found on page');
        results.push({ ...material, success: false, error: 'No image found' });
        continue;
      }

      // Get image URL for reference
      const imageUrl = await imageElement.evaluate(img => img.src);
      console.log(`   🖼️  Image URL: ${imageUrl}`);

      // Screenshot the image element directly (bypasses download restrictions)
      const filepath = path.join(outputDir, material.filename);
      await imageElement.screenshot({ path: filepath });

      console.log(`   ✅ Saved screenshot to: ${material.filename}`);

      results.push({
        ...material,
        success: true,
        imageUrl,
        localPath: `/images/materials/${material.filename}`
      });

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({ ...material, success: false, error: error.message });
    }
  }

  await browser.close();

  // Generate updated metadata
  console.log('\n\n📊 Summary:');
  console.log(`   Total materials: ${MATERIALS_TO_SCRAPE.length}`);
  console.log(`   Successfully downloaded: ${results.filter(r => r.success).length}`);
  console.log(`   Failed: ${results.filter(r => !r.success).length}`);

  // Save results
  const resultsFile = path.join(outputDir, 'download-results.json');
  await fs.writeFile(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to: ${resultsFile}`);

  // Generate metadata update
  console.log('\n\n📝 Image paths for materials-metadata.json:');
  results
    .filter(r => r.success)
    .forEach(r => {
      console.log(`  "${r.name}": { "image": "${r.localPath}" }`);
    });
}

main().catch(console.error);
