import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importMaterials() {
  try {
    console.log('Starting materials import...');

    // Load materials metadata
    const metadataPath = path.join(__dirname, '..', 'public', 'data', 'materials-metadata.json');
    const metadataRaw = fs.readFileSync(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataRaw);

    // Load pricing data
    const pricingPath = path.join(__dirname, '..', 'public', 'data', 'pricing-data.json');
    const pricingRaw = fs.readFileSync(pricingPath, 'utf-8');
    const pricing = JSON.parse(pricingRaw);

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Clear existing data
      console.log('Clearing existing materials data...');
      await client.query('DELETE FROM material_options');
      await client.query('DELETE FROM materials');
      await client.query('ALTER SEQUENCE materials_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE material_options_id_seq RESTART WITH 1');

      // Import materials
      console.log('Importing materials...');
      let materialCount = 0;
      let optionCount = 0;

      for (const [name, mat] of Object.entries(metadata.materials)) {
        // Only import CARCASS materials for now
        if (mat.type !== 'CARCASS') continue;

        // Insert material
        const materialResult = await client.query(
          `INSERT INTO materials (name, category, type, recommended, description, usage, image)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [name, mat.category, mat.type, mat.recommended || false, mat.description, mat.usage, mat.image]
        );

        const materialId = materialResult.rows[0].id;
        materialCount++;

        // Find and insert pricing options
        const pricingEntries = pricing.filter(p =>
          p['Product Name'] === name && mat.commonThicknesses?.includes(p.Thickness)
        );

        for (const p of pricingEntries) {
          const thicknessNum = parseInt(p.Thickness.replace('mm', ''));
          const price = parseFloat(p['Price Ex VAT (£)']);

          // Calculate price per square meter
          const sizeParts = p.Size.split(' x ');
          const widthM = parseFloat(sizeParts[0]) / 1000;
          const heightM = parseFloat(sizeParts[1].replace('mm', '')) / 1000;
          const pricePerSqM = (price / (widthM * heightM)).toFixed(2);

          await client.query(
            `INSERT INTO material_options (material_id, thickness, thickness_num, size, price, sku, price_per_sqm)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [materialId, p.Thickness, thicknessNum, p.Size, price, p.SKU, pricePerSqM]
          );

          optionCount++;
        }
      }

      await client.query('COMMIT');

      console.log(`✅ Import complete!`);
      console.log(`   Materials imported: ${materialCount}`);
      console.log(`   Options imported: ${optionCount}`);

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the import
importMaterials()
  .then(() => {
    console.log('Materials import finished successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Materials import failed:', err);
    process.exit(1);
  });
