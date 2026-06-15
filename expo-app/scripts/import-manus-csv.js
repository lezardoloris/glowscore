/**
 * Import Manus / market-research product CSV into products.ts JSON snippet.
 * Usage: node scripts/import-manus-csv.js path/to/products.csv
 */
const fs = require('fs');
const path = require('path');

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node scripts/import-manus-csv.js <products.csv>');
  process.exit(1);
}

const raw = fs.readFileSync(path.resolve(csvPath), 'utf8');
const lines = raw.split(/\r?\n/).filter(Boolean);
const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
const idx = (name) => header.indexOf(name);

const products = lines.slice(1).map((line) => {
  const cols = line.split(',').map((c) => c.trim());
  return {
    id: cols[idx('id')] || cols[0],
    name: cols[idx('name')] || cols[1],
    brand: cols[idx('brand')] || cols[2],
    category: cols[idx('category')] || 'serum',
    budgetTier: cols[idx('budget_tier')] || 'mid',
    markets: (cols[idx('markets')] || 'us,uk').split(';'),
    affiliateUrls: {
      us: cols[idx('url_us')] || cols[idx('affiliate_url')] || '',
      uk: cols[idx('url_uk')] || '',
      fr: cols[idx('url_fr')] || '',
    },
  };
}).filter((p) => p.id && p.name);

const out = path.join(__dirname, '..', 'src', 'data', 'manus-import.json');
fs.writeFileSync(out, JSON.stringify(products, null, 2));
console.log(`Wrote ${products.length} products to ${out}`);
