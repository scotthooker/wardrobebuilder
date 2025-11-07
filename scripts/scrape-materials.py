#!/usr/bin/env python3
"""
Scrape SL Hardwoods products from WooCommerce API
Focuses on sheet materials and edging products
"""

import requests
import json
import xml.etree.ElementTree as ET
from urllib.parse import urlparse, parse_qs
import time
from pathlib import Path
import re

# Configuration
BASE_URL = "https://www.slhardwoods.co.uk"
API_BASE = f"{BASE_URL}/wp-json/wc/store/v1/products"
SITEMAP_URLS = [
    f"{BASE_URL}/product-sitemap.xml",
    f"{BASE_URL}/product-sitemap2.xml"
]

# Categories we're interested in
RELEVANT_CATEGORIES = [
    'sheet-material',
    'mdf',
    'plywood',
    'birch-and-hardwood-plywood',
    'melamine',
    'veneered',
    'edging',
    'edge-banding',
    'iron-on-edging'
]

def fetch_sitemap_urls(sitemap_url):
    """Fetch all product URLs from sitemap"""
    print(f"Fetching sitemap: {sitemap_url}")
    try:
        response = requests.get(sitemap_url, timeout=30)
        response.raise_for_status()

        root = ET.fromstring(response.content)
        # Handle namespace
        namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        urls = [loc.text for loc in root.findall('.//ns:loc', namespace)]

        print(f"Found {len(urls)} URLs in sitemap")
        return urls
    except Exception as e:
        print(f"Error fetching sitemap: {e}")
        return []

def is_relevant_product(product_url):
    """Check if product URL is for materials we want"""
    # Skip non-product URLs
    if '/product/' not in product_url:
        return False

    # Check if URL contains relevant categories
    for category in RELEVANT_CATEGORIES:
        if category in product_url.lower():
            return True

    # Also include products with these keywords
    keywords = ['mdf', 'plywood', 'ply', 'veneer', 'melamine', 'birch',
                'oak', 'ash', 'walnut', 'maple', 'cherry', 'edging', 'edge']
    product_slug = product_url.split('/product/')[-1].replace('/', '')

    for keyword in keywords:
        if keyword in product_slug.lower():
            return True

    return False

def extract_product_id_from_url(product_url):
    """Try to extract product ID from URL or fetch the page to get it"""
    # The API needs the product ID, which we can get from the HTML page
    try:
        response = requests.get(product_url, timeout=30)
        response.raise_for_status()

        # Look for product ID in the page source
        # WooCommerce typically includes it in data attributes or scripts
        content = response.text

        # Try to find post ID
        match = re.search(r'post-(\d+)', content)
        if match:
            return match.group(1)

        # Try to find in data-product_id
        match = re.search(r'data-product_id="(\d+)"', content)
        if match:
            return match.group(1)

        return None
    except Exception as e:
        print(f"Error extracting product ID from {product_url}: {e}")
        return None

def fetch_product_data(product_id):
    """Fetch product data from WooCommerce API"""
    try:
        url = f"{API_BASE}/{product_id}"
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching product {product_id}: {e}")
        return None

def process_product(product_data):
    """Extract relevant information from product data"""
    if not product_data:
        return None

    # Extract basic info
    product_info = {
        'id': product_data.get('id'),
        'name': product_data.get('name', ''),
        'description': product_data.get('description', ''),
        'short_description': product_data.get('short_description', ''),
        'sku': product_data.get('sku', ''),
        'type': product_data.get('type', ''),
        'categories': [],
        'images': [],
        'price': None,
        'price_range': {},
        'variations': [],
        'attributes': []
    }

    # Extract categories
    if 'categories' in product_data:
        product_info['categories'] = [cat.get('name', '') for cat in product_data.get('categories', [])]

    # Extract images
    if 'images' in product_data:
        for img in product_data.get('images', []):
            product_info['images'].append({
                'src': img.get('src', ''),
                'name': img.get('name', ''),
                'alt': img.get('alt', '')
            })

    # Extract pricing
    if 'prices' in product_data:
        prices = product_data['prices']
        product_info['price'] = {
            'regular': prices.get('regular_price', ''),
            'sale': prices.get('price', ''),
            'currency': prices.get('currency_code', 'GBP')
        }

        if 'price_range' in prices:
            product_info['price_range'] = prices['price_range']

    # Extract attributes (like thickness)
    if 'attributes' in product_data:
        for attr in product_data.get('attributes', []):
            product_info['attributes'].append({
                'name': attr.get('name', ''),
                'terms': attr.get('terms', [])
            })

    # Extract variation IDs
    if 'variations' in product_data:
        product_info['variation_ids'] = product_data['variations']

    return product_info

def fetch_variation_data(variation_id):
    """Fetch variation-specific data"""
    try:
        url = f"{API_BASE}/{variation_id}"
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()

        variation_info = {
            'id': data.get('id'),
            'name': data.get('name', ''),
            'sku': data.get('sku', ''),
            'attributes': [],
            'price': None
        }

        # Extract attributes (thickness, etc.)
        if 'attributes' in data:
            for attr in data.get('attributes', []):
                variation_info['attributes'].append({
                    'name': attr.get('name', ''),
                    'value': attr.get('value', '')
                })

        # Extract pricing
        if 'prices' in data:
            prices = data['prices']
            variation_info['price'] = {
                'regular': prices.get('regular_price', ''),
                'sale': prices.get('price', ''),
                'currency': prices.get('currency_code', 'GBP')
            }

        return variation_info
    except Exception as e:
        print(f"Error fetching variation {variation_id}: {e}")
        return None

def main():
    """Main scraping function"""
    print("Starting SL Hardwoods material scraper...")

    # Collect all product URLs
    all_urls = []
    for sitemap_url in SITEMAP_URLS:
        urls = fetch_sitemap_urls(sitemap_url)
        all_urls.extend(urls)

    print(f"Total URLs found: {len(all_urls)}")

    # Filter for relevant products
    relevant_urls = [url for url in all_urls if is_relevant_product(url)]
    print(f"Relevant product URLs: {len(relevant_urls)}")

    # Process products
    all_products = []

    for i, product_url in enumerate(relevant_urls[:50], 1):  # Limit to 50 for testing
        print(f"\n[{i}/{min(50, len(relevant_urls))}] Processing: {product_url}")

        # Extract product ID
        product_id = extract_product_id_from_url(product_url)
        if not product_id:
            print(f"  Could not extract product ID")
            continue

        # Fetch product data
        product_data = fetch_product_data(product_id)
        if not product_data:
            continue

        # Process product
        product_info = process_product(product_data)
        if not product_info:
            continue

        print(f"  Product: {product_info['name']}")
        print(f"  Type: {product_info['type']}")

        # If variable product, fetch all variations
        if product_info['type'] == 'variation' and 'variation_ids' in product_info:
            print(f"  Fetching {len(product_info['variation_ids'])} variations...")
            variations = []

            for var_id in product_info['variation_ids']:
                var_data = fetch_variation_data(var_id)
                if var_data:
                    variations.append(var_data)
                time.sleep(0.5)  # Rate limiting

            product_info['variations'] = variations
            print(f"  Loaded {len(variations)} variations")

        all_products.append(product_info)
        time.sleep(1)  # Rate limiting

    # Save to JSON
    output_dir = Path(__file__).parent.parent / 'public' / 'data'
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / 'scraped-materials.json'

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_products, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Scraped {len(all_products)} products")
    print(f"💾 Saved to: {output_file}")

    # Print summary
    print("\n📊 Summary:")
    print(f"  Total products: {len(all_products)}")
    variable_count = sum(1 for p in all_products if p['type'] == 'variation')
    print(f"  Variable products: {variable_count}")
    simple_count = len(all_products) - variable_count
    print(f"  Simple products: {simple_count}")

if __name__ == '__main__':
    main()
