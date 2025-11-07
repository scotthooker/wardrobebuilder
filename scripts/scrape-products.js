/**
 * Script to scrape product data from SL Hardwoods WordPress shop
 * Uses Playwright to navigate pages and extract product IDs,
 * then fetches detailed product data via WordPress REST API
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'https://www.slhardwoods.co.uk';
const SHOP_URL = `${BASE_URL}/shop`;
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'scraped-pricing-data.json');

// Configuration
const CONFIG = {
  perPage: 36,
  orderBy: 'price-desc',
  startPage: 1,
  maxPages: process.argv.includes('--max-pages')
    ? parseInt(process.argv[process.argv.indexOf('--max-pages') + 1])
    : null, // null = scrape all pages
  delayBetweenRequests: 500, // ms
  headless: process.argv.includes('--headless'), // Run in headless mode
};

/**
 * Extract product IDs from a shop page
 */
async function extractProductIdsFromPage(page) {
  console.log(`  Extracting product IDs from: ${page.url()}`);

  // Wait for products to load
  await page.waitForSelector('.products .product, .woocommerce-loop-product', { timeout: 10000 });

  // Extract product IDs from data attributes or links
  const productIds = await page.evaluate(() => {
    const products = document.querySelectorAll('.products .product, .woocommerce-loop-product');
    const ids = [];

    products.forEach(product => {
      // Try multiple methods to get product ID
      let id = null;

      // Method 1: data-product-id attribute
      if (product.dataset.productId) {
        id = product.dataset.productId;
      }
      // Method 2: post-ID class
      else if (product.classList) {
        for (let className of product.classList) {
          if (className.startsWith('post-')) {
            const match = className.match(/post-(\d+)/);
            if (match) {
              id = match[1];
            }
          }
        }
      }
      // Method 3: Extract from permalink
      else {
        const link = product.querySelector('a');
        if (link && link.href) {
          const match = link.href.match(/product\/([^\/]+)/);
          if (match) {
            // Store slug instead, will resolve to ID later
            id = `slug:${match[1]}`;
          }
        }
      }

      if (id) {
        ids.push(id);
      }
    });

    return ids;
  });

  console.log(`    Found ${productIds.length} products`);
  return productIds;
}

/**
 * Fetch product data from WordPress REST API
 */
async function fetchProductData(productId, page) {
  try {
    let apiUrl;

    if (typeof productId === 'string' && productId.startsWith('slug:')) {
      const slug = productId.replace('slug:', '');
      apiUrl = `${BASE_URL}/wp-json/wc/v3/products?slug=${slug}`;
    } else {
      apiUrl = `${BASE_URL}/wp-json/wc/v3/products/${productId}`;
    }

    console.log(`    Fetching: ${apiUrl}`);

    // Navigate to API endpoint
    const response = await page.goto(apiUrl, { waitUntil: 'networkidle' });

    if (!response.ok()) {
      console.log(`    ⚠️  Failed to fetch product ${productId}: ${response.status()}`);
      return null;
    }

    const data = await response.json();

    // If we got an array (from slug search), take first item
    const product = Array.isArray(data) ? data[0] : data;

    if (!product) {
      console.log(`    ⚠️  No product data for ${productId}`);
      return null;
    }

    return product;
  } catch (error) {
    console.error(`    ❌ Error fetching product ${productId}:`, error.message);
    return null;
  }
}

/**
 * Parse product data into our pricing format
 */
function parseProductData(product) {
  if (!product) return null;

  const items = [];

  // Extract base product info
  const name = product.name;
  const sku = product.sku || '';
  const price = parseFloat(product.price) || 0;

  // Check if it's a variable product (has variations like thickness)
  if (product.type === 'variable' && product.variations && product.variations.length > 0) {
    // This is a variable product - we'll need to fetch variations separately
    console.log(`      Variable product with ${product.variations.length} variations`);
    return { type: 'variable', product, variationIds: product.variations };
  }

  // Simple product
  if (product.type === 'simple') {
    // Try to extract thickness from attributes or name
    let thickness = '';

    if (product.attributes && product.attributes.length > 0) {
      const thicknessAttr = product.attributes.find(attr =>
        attr.name.toLowerCase().includes('thickness') ||
        attr.name.toLowerCase().includes('size')
      );
      if (thicknessAttr && thicknessAttr.options && thicknessAttr.options.length > 0) {
        thickness = thicknessAttr.options[0];
      }
    }

    // If no attribute, try to extract from product name
    if (!thickness) {
      const thicknessMatch = name.match(/(\d+mm)/i);
      if (thicknessMatch) {
        thickness = thicknessMatch[1];
      }
    }

    items.push({
      'Product Name': name,
      'SKU': sku,
      'Thickness': thickness,
      'Price Ex VAT (£)': price.toFixed(2),
      'Source': 'scraped',
      'ID': product.id,
      'Permalink': product.permalink
    });
  }

  return items.length > 0 ? items : null;
}

/**
 * Fetch variation data for variable products
 */
async function fetchVariationData(productId, variationIds, page) {
  const variations = [];

  for (const varId of variationIds) {
    try {
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests));

      const apiUrl = `${BASE_URL}/wp-json/wc/v3/products/${productId}/variations/${varId}`;
      console.log(`      Fetching variation: ${varId}`);

      const response = await page.goto(apiUrl, { waitUntil: 'networkidle' });

      if (response.ok()) {
        const variation = await response.json();
        variations.push(variation);
      }
    } catch (error) {
      console.error(`      ❌ Error fetching variation ${varId}:`, error.message);
    }
  }

  return variations;
}

/**
 * Parse variation data into pricing format
 */
function parseVariations(baseProduct, variations) {
  const items = [];

  for (const variation of variations) {
    let thickness = '';

    // Extract thickness from variation attributes
    if (variation.attributes && variation.attributes.length > 0) {
      const thicknessAttr = variation.attributes.find(attr =>
        attr.name.toLowerCase().includes('thickness') ||
        attr.name.toLowerCase().includes('size')
      );
      if (thicknessAttr) {
        thickness = thicknessAttr.option;
      }
    }

    const price = parseFloat(variation.price) || 0;

    items.push({
      'Product Name': baseProduct.name,
      'SKU': variation.sku || baseProduct.sku,
      'Thickness': thickness,
      'Price Ex VAT (£)': price.toFixed(2),
      'Source': 'scraped',
      'ID': baseProduct.id,
      'Variation ID': variation.id,
      'Permalink': variation.permalink || baseProduct.permalink
    });
  }

  return items;
}

/**
 * Check if there's a next page
 */
async function hasNextPage(page) {
  return await page.evaluate(() => {
    const nextLink = document.querySelector('.woocommerce-pagination .next, .pagination .next');
    return nextLink !== null;
  });
}

/**
 * Navigate to next page
 */
async function goToNextPage(page) {
  await page.click('.woocommerce-pagination .next, .pagination .next');
  await page.waitForLoadState('networkidle');
}

/**
 * Main scraping function
 */
async function scrapeProducts() {
  console.log('🚀 Starting SL Hardwoods product scraper...\n');

  const browser = await chromium.launch({ headless: CONFIG.headless });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  const allProducts = [];
  const allProductIds = new Set();

  try {
    // Navigate to shop page
    const startUrl = `${SHOP_URL}/?orderby=${CONFIG.orderBy}&per_page=${CONFIG.perPage}`;
    console.log(`📄 Navigating to: ${startUrl}\n`);
    await page.goto(startUrl, { waitUntil: 'networkidle' });

    let currentPage = CONFIG.startPage;
    let hasMore = true;

    // Phase 1: Collect all product IDs
    console.log('Phase 1: Collecting product IDs from shop pages...\n');

    while (hasMore) {
      console.log(`Page ${currentPage}:`);

      // Extract product IDs from current page
      const productIds = await extractProductIdsFromPage(page);
      productIds.forEach(id => allProductIds.add(id));

      // Check if we should continue
      if (CONFIG.maxPages && currentPage >= CONFIG.maxPages) {
        console.log(`\n⏹️  Reached max pages (${CONFIG.maxPages})\n`);
        hasMore = false;
      } else {
        hasMore = await hasNextPage(page);

        if (hasMore) {
          console.log('  → Moving to next page...\n');
          await goToNextPage(page);
          currentPage++;
          await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests));
        } else {
          console.log('\n✅ Reached last page\n');
        }
      }
    }

    console.log(`\n📊 Total unique products found: ${allProductIds.size}\n`);

    // Phase 2: Fetch detailed product data
    console.log('Phase 2: Fetching product details from API...\n');

    let processed = 0;
    for (const productId of allProductIds) {
      processed++;
      console.log(`[${processed}/${allProductIds.size}] Processing product: ${productId}`);

      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests));

      const productData = await fetchProductData(productId, page);

      if (!productData) continue;

      const parsed = parseProductData(productData);

      if (parsed) {
        if (parsed.type === 'variable') {
          // Fetch variations
          console.log(`    Fetching ${parsed.variationIds.length} variations...`);
          const variations = await fetchVariationData(
            parsed.product.id,
            parsed.variationIds,
            page
          );
          const variationItems = parseVariations(parsed.product, variations);
          allProducts.push(...variationItems);
          console.log(`    ✓ Added ${variationItems.length} variations`);
        } else {
          allProducts.push(...parsed);
          console.log(`    ✓ Added product`);
        }
      }

      console.log('');
    }

    // Phase 3: Save results
    console.log('\n💾 Saving results...\n');

    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Save as JSON
    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify(allProducts, null, 2),
      'utf-8'
    );

    console.log(`✅ Saved ${allProducts.length} product entries to: ${OUTPUT_FILE}`);

    // Print sample
    console.log('\n📋 Sample of scraped data:\n');
    console.log(JSON.stringify(allProducts.slice(0, 3), null, 2));

  } catch (error) {
    console.error('\n❌ Scraping error:', error);
    throw error;
  } finally {
    await browser.close();
  }

  return allProducts;
}

// Run the scraper
scrapeProducts()
  .then(() => {
    console.log('\n✨ Scraping complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
