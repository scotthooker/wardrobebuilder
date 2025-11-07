/**
 * Quick test to verify WordPress API access
 */

import fetch from 'node-fetch';

const BASE_URL = 'https://www.slhardwoods.co.uk';

async function testAPI() {
  console.log('Testing WordPress API access...\n');

  try {
    // Test 1: Fetch products list
    console.log('Test 1: Fetching products list...');
    const productsUrl = `${BASE_URL}/wp-json/wc/v3/products?per_page=5`;
    console.log(`URL: ${productsUrl}\n`);

    const response = await fetch(productsUrl);
    console.log(`Status: ${response.status}`);
    console.log(`Headers:`, response.headers.raw());

    if (response.ok) {
      const products = await response.json();
      console.log(`\n✅ Success! Found ${products.length} products`);
      console.log('\nSample product:');
      console.log(JSON.stringify(products[0], null, 2));
    } else {
      const text = await response.text();
      console.log(`\n❌ Failed: ${response.statusText}`);
      console.log('Response:', text);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testAPI();
