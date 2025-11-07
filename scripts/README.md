# SL Hardwoods Product Scraper

This directory contains scripts to scrape product pricing and specifications from the SL Hardwoods website.

## Scripts

### scrape-products-html.js

Scrapes product data directly from the HTML of shop pages. This is the primary scraper since the WordPress REST API requires authentication.

**Features:**
- Scrapes all products from shop listing pages
- Visits individual product pages for detailed data
- Extracts product variations (thickness, sizes)
- Handles variable products with multiple SKUs
- Exports data to JSON format

## Usage

### Quick Test (2 pages only)
```bash
npm run scrape:quick
```

### Full Scrape (all pages)
```bash
npm run scrape
```

### Headless Mode (faster, no browser window)
```bash
npm run scrape:headless
```

### Custom Page Limit
```bash
node scripts/scrape-products-html.js --max-pages=5
```

### Headless + Custom Pages
```bash
node scripts/scrape-products-html.js --headless --max-pages=10
```

## Output

The scraper saves data to:
```
public/data/scraped-pricing-data.json
```

### Output Format

```json
[
  {
    "Product Name": "Moisture Resistant MDF",
    "SKU": "MDF-MR-18",
    "Thickness": "18mm",
    "Price Ex VAT (£)": "50.80",
    "Source": "scraped-detailed",
    "URL": "https://www.slhardwoods.co.uk/product/...",
    "Categories": "Sheet Materials, MDF"
  }
]
```

## Configuration

Edit the `CONFIG` object in `scrape-products-html.js`:

```javascript
const CONFIG = {
  perPage: 36,              // Products per page
  orderBy: 'price-desc',    // Sort order
  startPage: 1,             // Starting page number
  maxPages: null,           // null = all pages, or number to limit
  delayBetweenRequests: 1000,  // ms between product pages
  delayBetweenPages: 2000,     // ms between shop pages
  headless: false,          // Browser visibility
};
```

## How It Works

1. **Phase 1: Collect Product List**
   - Navigates shop pages
   - Extracts basic data (name, price, URL)
   - Follows pagination

2. **Phase 2: Detailed Scraping**
   - Visits each product page
   - Extracts SKU, variations, attributes
   - Processes variable products (different thicknesses/sizes)

3. **Phase 3: Export**
   - Saves to JSON file
   - Formats for pricing-data.json structure

## Troubleshooting

### Browser Not Installed
```bash
npx playwright install chromium
```

### Timeout Errors
Increase timeouts in the script:
```javascript
page.setDefaultTimeout(60000);  // 60 seconds
```

### CAPTCHA Challenges
The scraper uses realistic user agent and delays to avoid detection. If you encounter CAPTCHAs:
- Increase `delayBetweenRequests` to 2000-3000ms
- Run in non-headless mode and solve CAPTCHA manually if needed

### Memory Issues
For large scrapes, consider:
- Scraping in batches using `--max-pages`
- Increasing Node memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run scrape`

## Data Processing

After scraping, you may want to:

1. **Merge with existing data:**
   ```javascript
   const existing = require('../public/data/pricing-data.json');
   const scraped = require('../public/data/scraped-pricing-data.json');
   const merged = [...existing, ...scraped];
   ```

2. **De-duplicate:**
   ```javascript
   const unique = merged.filter((item, index, self) =>
     index === self.findIndex(t => t.SKU === item.SKU && t.Thickness === item.Thickness)
   );
   ```

3. **Update pricing-data.json:**
   ```bash
   cp public/data/scraped-pricing-data.json public/data/pricing-data.json
   ```

## Notes

- The scraper respects robots.txt
- Adds delays to avoid overwhelming the server
- Uses realistic browser fingerprinting
- Handles product variations (thickness, size)
- Extracts from HTML (doesn't require API keys)
