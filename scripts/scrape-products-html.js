/**
 * Script to scrape product data from SL Hardwoods shop pages (HTML scraping)
 * Since the WordPress API requires authentication, we extract data directly from HTML
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
  delayBetweenRequests: 1000, // ms
  delayBetweenPages: 2000, // ms
  headless: process.argv.includes('--headless'),
};

/**
 * Extract product data from shop listing page
 */
async function extractProductsFromListingPage(page) {
  console.log(`  Extracting products from: ${page.url()}`);

  await page.waitForSelector('.products .product, .woocommerce-loop-product', { timeout: 15000 });

  const products = await page.evaluate(() => {
    const productElements = document.querySelectorAll('.products .product, .woocommerce-loop-product');
    const results = [];

    productElements.forEach(product => {
      const nameEl = product.querySelector('.woocommerce-loop-product__title, h2, h3');
      const priceEl = product.querySelector('.price .amount, .price');
      const linkEl = product.querySelector('a');

      const name = nameEl ? nameEl.textContent.trim() : '';
      let price = '';

      if (priceEl) {
        // Extract just the number from price
        const priceText = priceEl.textContent.trim();
        const match = priceText.match(/£?([\d,.]+)/);
        if (match) {
          price = match[1].replace(',', '');
        }
      }

      const url = linkEl ? linkEl.href : '';

      if (name && url) {
        results.push({ name, price, url });
      }
    });

    return results;
  });

  console.log(`    Found ${products.length} products on page`);
  return products;
}

/**
 * Extract detailed product data from individual product page
 */
async function extractDetailedProductData(page, productUrl, basicData) {
  try {
    console.log(`    → Visiting: ${productUrl}`);
    await page.goto(productUrl, { waitUntil: 'networkidle', timeout: 30000 });

    const productData = await page.evaluate(() => {
      const data = {
        sku: '',
        variations: [],
        attributes: {},
        description: '',
        categories: []
      };

      // Extract SKU
      const skuEl = document.querySelector('.sku, .product_meta .sku');
      if (skuEl) {
        data.sku = skuEl.textContent.trim();
      }

      // Extract product categories
      const categoryEls = document.querySelectorAll('.posted_in a, .product_meta a[rel="tag"]');
      categoryEls.forEach(cat => {
        data.categories.push(cat.textContent.trim());
      });

      // Check if it's a variable product (has thickness/size options)
      const variationForm = document.querySelector('form.variations_form');

      if (variationForm) {
        // Variable product - extract variations
        const variationSelects = document.querySelectorAll('.variations select');

        variationSelects.forEach(select => {
          const attributeName = select.name || select.id || '';
          const options = Array.from(select.options)
            .filter(opt => opt.value)
            .map(opt => ({
              value: opt.value,
              text: opt.textContent.trim()
            }));

          if (attributeName.toLowerCase().includes('thickness') ||
              attributeName.toLowerCase().includes('size')) {
            data.attributes.thickness = options;
          }
        });

        // Try to extract variation prices from JSON data
        const scriptTags = document.querySelectorAll('script');
        scriptTags.forEach(script => {
          const content = script.textContent;
          if (content.includes('variations') || content.includes('variation')) {
            // Try to find JSON data
            try {
              const jsonMatch = content.match(/variations["\']?\s*:\s*(\[[\s\S]*?\])/);
              if (jsonMatch) {
                const variations = JSON.parse(jsonMatch[1]);
                data.variations = variations.map(v => ({
                  attributes: v.attributes || {},
                  price: v.display_price || v.price || '',
                  sku: v.sku || '',
                  variation_id: v.variation_id || ''
                }));
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
        });

      } else {
        // Simple product - just one price
        const priceEl = document.querySelector('.price .amount, .price');
        if (priceEl) {
          data.simplePrice = priceEl.textContent.trim();
        }
      }

      // Extract description
      const descEl = document.querySelector('.woocommerce-product-details__short-description, .product-short-description');
      if (descEl) {
        data.description = descEl.textContent.trim().substring(0, 200);
      }

      return data;
    });

    return productData;
  } catch (error) {
    console.error(`    ❌ Error fetching product details: ${error.message}`);
    return null;
  }
}

/**
 * Process product data into pricing format
 */
function processProductData(basicData, detailedData) {
  const items = [];

  if (!detailedData) {
    // Fallback to basic data only
    const thickness = extractThicknessFromName(basicData.name);
    items.push({
      'Product Name': basicData.name,
      'SKU': '',
      'Thickness': thickness,
      'Price Ex VAT (£)': basicData.price || '0',
      'Source': 'scraped-basic',
      'URL': basicData.url
    });
    return items;
  }

  // Has detailed data
  if (detailedData.variations && detailedData.variations.length > 0) {
    // Variable product with variations
    detailedData.variations.forEach(variation => {
      let thickness = '';

      // Extract thickness from attributes
      if (variation.attributes) {
        const thicknessKey = Object.keys(variation.attributes).find(key =>
          key.toLowerCase().includes('thickness') || key.toLowerCase().includes('size')
        );
        if (thicknessKey) {
          thickness = variation.attributes[thicknessKey];
        }
      }

      if (!thickness) {
        thickness = extractThicknessFromName(basicData.name);
      }

      items.push({
        'Product Name': basicData.name,
        'SKU': variation.sku || detailedData.sku || '',
        'Thickness': thickness,
        'Price Ex VAT (£)': parseFloat(variation.price || '0').toFixed(2),
        'Source': 'scraped-detailed',
        'URL': basicData.url,
        'Variation ID': variation.variation_id
      });
    });
  } else {
    // Simple product
    const thickness = extractThicknessFromName(basicData.name);
    const price = detailedData.simplePrice
      ? detailedData.simplePrice.replace(/[£,]/g, '').trim()
      : basicData.price;

    items.push({
      'Product Name': basicData.name,
      'SKU': detailedData.sku || '',
      'Thickness': thickness,
      'Price Ex VAT (£)': parseFloat(price || '0').toFixed(2),
      'Source': 'scraped-detailed',
      'URL': basicData.url,
      'Categories': detailedData.categories.join(', ')
    });
  }

  return items;
}

/**
 * Extract thickness from product name
 */
function extractThicknessFromName(name) {
  const thicknessMatch = name.match(/(\d+\.?\d*\s*mm)/i);
  if (thicknessMatch) {
    return thicknessMatch[1].trim();
  }

  // Try other formats
  const sizeMatch = name.match(/(\d+\.?\d*)\s*x\s*(\d+\.?\d*)/i);
  if (sizeMatch) {
    return `${sizeMatch[1]}mm`;
  }

  return '';
}

/**
 * Check if there's a next page
 */
async function hasNextPage(page) {
  return await page.evaluate(() => {
    const nextLink = document.querySelector('.woocommerce-pagination .next, .pagination .next, a.next.page-numbers');
    return nextLink !== null;
  });
}

/**
 * Navigate to next page
 */
async function goToNextPage(page) {
  const nextButton = await page.$('.woocommerce-pagination .next, .pagination .next, a.next.page-numbers');
  if (nextButton) {
    await nextButton.click();
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Main scraping function
 */
async function scrapeProducts() {
  console.log('🚀 Starting SL Hardwoods product scraper (HTML mode)...\n');
  console.log(`Config: maxPages=${CONFIG.maxPages || 'all'}, headless=${CONFIG.headless}\n`);

  const browser = await chromium.launch({
    headless: CONFIG.headless,
    timeout: 60000
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  // Set longer timeouts
  page.setDefaultTimeout(30000);

  const allProducts = [];
  const allBasicProducts = [];

  try {
    // Navigate to shop page
    const startUrl = `${SHOP_URL}/?orderby=${CONFIG.orderBy}&per_page=${CONFIG.perPage}`;
    console.log(`📄 Navigating to: ${startUrl}\n`);
    await page.goto(startUrl, { waitUntil: 'networkidle', timeout: 30000 });

    let currentPage = CONFIG.startPage;
    let hasMore = true;

    // Phase 1: Collect basic product data from listing pages
    console.log('Phase 1: Collecting products from shop pages...\n');

    while (hasMore) {
      console.log(`Page ${currentPage}:`);

      // Extract products from current page
      const products = await extractProductsFromListingPage(page);
      allBasicProducts.push(...products);

      // Check if we should continue
      if (CONFIG.maxPages && currentPage >= CONFIG.maxPages) {
        console.log(`\n⏹️  Reached max pages (${CONFIG.maxPages})\n`);
        hasMore = false;
      } else {
        hasMore = await hasNextPage(page);

        if (hasMore) {
          console.log('  → Moving to next page...\n');
          await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenPages));
          await goToNextPage(page);
          currentPage++;
        } else {
          console.log('\n✅ Reached last page\n');
        }
      }
    }

    console.log(`\n📊 Total products found: ${allBasicProducts.length}\n`);

    // Phase 2: Fetch detailed data for each product
    console.log('Phase 2: Fetching detailed product data...\n');

    let processed = 0;
    for (const basicProduct of allBasicProducts) {
      processed++;
      console.log(`[${processed}/${allBasicProducts.length}] ${basicProduct.name}`);

      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests));

      const detailedData = await extractDetailedProductData(page, basicProduct.url, basicProduct);
      const items = processProductData(basicProduct, detailedData);

      allProducts.push(...items);
      console.log(`    ✓ Added ${items.length} item(s)`);
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

    // Print summary
    console.log('\n📊 Summary:');
    console.log(`   Total products scraped: ${allProducts.length}`);
    console.log(`   Products with variations: ${allProducts.filter(p => p['Variation ID']).length}`);
    console.log(`   Unique products: ${new Set(allProducts.map(p => p['Product Name'])).size}`);

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
