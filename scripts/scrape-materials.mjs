#!/usr/bin/env node

/**
 * Scrape SL Hardwoods products from WooCommerce Store API
 * Focuses on sheet materials and edging products
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://www.slhardwoods.co.uk';
const API_BASE = `${BASE_URL}/wp-json/wc/store/v1`;

// Categories we're interested in (based on your requirements)
const MATERIAL_KEYWORDS = [
  'mdf', 'plywood', 'ply', 'veneer', 'melamine', 'birch',
  'oak', 'ash', 'walnut', 'maple', 'cherry', 'beech',
  'moisture resistant', 'mr mdf', 'wbp', 'edge', 'edging'
];

const EDGING_KEYWORDS = [
  'edge', 'edging', 'iron on', 'iron-on', 'lipping'
];

// Helper to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to check if product is relevant
function isRelevantProduct(product) {
  const nameLC = product.name.toLowerCase();
  const descLC = (product.description || '').toLowerCase();
  const shortDescLC = (product.short_description || '').toLowerCase();

  // Check if it's a material or edging product
  for (const keyword of MATERIAL_KEYWORDS) {
    if (nameLC.includes(keyword) || descLC.includes(keyword) || shortDescLC.includes(keyword)) {
      return true;
    }
  }

  // Check categories
  if (product.categories && product.categories.length > 0) {
    for (const cat of product.categories) {
      const catName = cat.name.toLowerCase();
      if (catName.includes('sheet') || catName.includes('material') ||
          catName.includes('mdf') || catName.includes('plywood') ||
          catName.includes('edging') || catName.includes('veneered')) {
        return true;
      }
    }
  }

  return false;
}

// Determine material type
function getMaterialType(product) {
  const nameLC = product.name.toLowerCase();

  // Check for edging
  for (const keyword of EDGING_KEYWORDS) {
    if (nameLC.includes(keyword)) {
      return 'EDGING';
    }
  }

  // Check for specific material types
  if (nameLC.includes('birch') && nameLC.includes('ply')) {
    return 'CARCASS'; // Birch plywood is good for carcasses
  }

  if (nameLC.includes('moisture resistant') || nameLC.includes('mr mdf')) {
    return 'CARCASS'; // MR MDF is good for carcasses
  }

  if (nameLC.includes('veneered')) {
    return 'LINING'; // Veneered panels are typically for visible surfaces
  }

  if (nameLC.includes('drawer')) {
    return 'DRAWER';
  }

  // Default to general material
  return 'MATERIAL';
}

// Fetch all products with pagination
async function fetchAllProducts() {
  console.log('🔍 Fetching products from WooCommerce Store API...\n');

  let allProducts = [];
  let page = 1;
  let hasMore = true;
  const perPage = 100; // API default max

  while (hasMore) {
    try {
      const url = `${API_BASE}/products?per_page=${perPage}&page=${page}`;
      console.log(`📄 Fetching page ${page}...`);
      console.log(`   URL: ${url}`);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
        }
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);

      if (!response.ok) {
        if (response.status === 400 || response.status === 404) {
          // No more pages
          console.log('✅ Reached end of products\n');
          hasMore = false;
          break;
        }
        const text = await response.text();
        console.log(`   Response body preview: ${text.substring(0, 500)}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.log(`   Not JSON response. Content-Type: ${contentType}`);
        console.log(`   Response preview: ${text.substring(0, 500)}`);
        hasMore = false;
        break;
      }

      const products = await response.json();

      if (!products || products.length === 0) {
        console.log('✅ No more products found\n');
        hasMore = false;
        break;
      }

      console.log(`   Found ${products.length} products`);
      allProducts.push(...products);

      page++;
      await delay(1000); // Rate limiting - 1 second between requests

    } catch (error) {
      console.error(`❌ Error fetching page ${page}:`, error.message);
      hasMore = false;
    }
  }

  console.log(`\n📊 Total products fetched: ${allProducts.length}\n`);
  return allProducts;
}

// Process product data
function processProduct(product) {
  const processed = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    type: product.type, // simple, variable, variation
    sku: product.sku || '',
    description: product.description || '',
    short_description: product.short_description || '',
    material_type: getMaterialType(product),
    categories: [],
    images: [],
    price: null,
    variations: []
  };

  // Extract categories
  if (product.categories && Array.isArray(product.categories)) {
    processed.categories = product.categories.map(cat => cat.name);
  }

  // Extract images
  if (product.images && Array.isArray(product.images)) {
    processed.images = product.images.map(img => ({
      src: img.src,
      name: img.name || '',
      alt: img.alt || product.name
    }));
  }

  // Extract pricing
  if (product.prices) {
    const prices = product.prices;
    processed.price = {
      regular: prices.regular_price || '',
      sale: prices.price || '',
      currency: prices.currency_code || 'GBP',
      formatted: prices.price_range ? {
        min: prices.price_range.min_amount || '',
        max: prices.price_range.max_amount || ''
      } : null
    };
  }

  // Extract attributes (e.g., thickness)
  if (product.attributes && Array.isArray(product.attributes)) {
    processed.attributes = product.attributes.map(attr => ({
      name: attr.name,
      terms: attr.terms || []
    }));
  }

  return processed;
}

// Main scraping function
async function main() {
  console.log('🌲 SL Hardwoods Material Scraper (Node.js)\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // Fetch all products
    const allProducts = await fetchAllProducts();

    // Filter for relevant products (sheet materials and edging)
    console.log('🔍 Filtering for sheet materials and edging...\n');
    const relevantProducts = allProducts.filter(isRelevantProduct);
    console.log(`✅ Found ${relevantProducts.length} relevant products\n`);

    // Process products
    console.log('⚙️  Processing product data...\n');
    const processedProducts = relevantProducts.map((product, index) => {
      if ((index + 1) % 50 === 0) {
        console.log(`   Processed ${index + 1}/${relevantProducts.length} products...`);
      }
      return processProduct(product);
    });

    // Categorize by material type
    const categorized = {
      carcass: processedProducts.filter(p => p.material_type === 'CARCASS'),
      lining: processedProducts.filter(p => p.material_type === 'LINING'),
      drawer: processedProducts.filter(p => p.material_type === 'DRAWER'),
      edging: processedProducts.filter(p => p.material_type === 'EDGING'),
      general: processedProducts.filter(p => p.material_type === 'MATERIAL')
    };

    console.log('\n📊 Material Type Breakdown:');
    console.log(`   Carcass materials: ${categorized.carcass.length}`);
    console.log(`   Lining materials: ${categorized.lining.length}`);
    console.log(`   Drawer materials: ${categorized.drawer.length}`);
    console.log(`   Edging products: ${categorized.edging.length}`);
    console.log(`   General materials: ${categorized.general.length}`);

    // Save to JSON
    const outputDir = path.join(__dirname, '..', 'public', 'data');
    await fs.mkdir(outputDir, { recursive: true });

    const outputFile = path.join(outputDir, 'scraped-materials.json');
    await fs.writeFile(
      outputFile,
      JSON.stringify(processedProducts, null, 2),
      'utf8'
    );

    const categorizedFile = path.join(outputDir, 'materials-by-type.json');
    await fs.writeFile(
      categorizedFile,
      JSON.stringify(categorized, null, 2),
      'utf8'
    );

    console.log(`\n✅ Scraped ${processedProducts.length} materials`);
    console.log(`💾 Saved to:`);
    console.log(`   - ${outputFile}`);
    console.log(`   - ${categorizedFile}`);

    // Show some examples
    if (processedProducts.length > 0) {
      console.log(`\n📝 Sample products:\n`);
      processedProducts.slice(0, 5).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Type: ${p.material_type}`);
        console.log(`   Price: ${p.price?.formatted ?
          `£${p.price.formatted.min} - £${p.price.formatted.max}` :
          p.price?.sale || 'N/A'}`);
        console.log(`   Images: ${p.images.length}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the scraper
main().catch(console.error);
