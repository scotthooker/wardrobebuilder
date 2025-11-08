/**
 * Database Migration Script
 *
 * Imports backup data from JSON files into the PostgreSQL database
 * - Validates backup structure and compatibility
 * - Handles foreign key dependencies in correct order
 * - Transaction-based import with rollback on errors
 * - Provides detailed import statistics
 *
 * Usage:
 *   node scripts/db-migrate.js <backup-directory> [--skip-builds] [--upsert]
 *
 * Options:
 *   --skip-builds   Skip importing builds (only import reference data)
 *   --upsert        Update existing records instead of skipping them
 *   --dry-run       Show what would be imported without making changes
 *
 * Examples:
 *   node scripts/db-migrate.js ./backups/latest
 *   node scripts/db-migrate.js ./backups/backup-2025-11-08 --upsert
 *   node scripts/db-migrate.js ./backups/latest --skip-builds --dry-run
 */

import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const backupDir = args.find(arg => !arg.startsWith('--'));
const skipBuilds = args.includes('--skip-builds');
const upsertMode = args.includes('--upsert');
const dryRun = args.includes('--dry-run');

if (!backupDir) {
  console.error('❌ Error: Backup directory required');
  console.log('Usage: node scripts/db-migrate.js <backup-directory> [options]');
  console.log('Options:');
  console.log('  --skip-builds   Skip importing builds');
  console.log('  --upsert        Update existing records');
  console.log('  --dry-run       Preview changes without importing');
  process.exit(1);
}

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://wardrobe_user:wardrobe_password@localhost:5432/wardrobe_builder';

const pool = new Pool({
  connectionString: DATABASE_URL,
});

/**
 * Read and validate backup manifest
 */
async function readManifest(backupPath) {
  console.log('📋 Reading backup manifest...');

  const manifestPath = path.join(backupPath, 'manifest.json');
  const manifestData = await fs.readFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(manifestData);

  console.log(`   Backup created: ${manifest.timestamp}`);
  console.log(`   Database: ${manifest.database_url}`);
  console.log(`   Total builds: ${manifest.stats.total_builds}`);
  console.log(`   Materials: ${manifest.stats.materials}`);
  console.log(`   Suppliers: ${manifest.stats.suppliers}`);

  return manifest;
}

/**
 * Read JSON backup file
 */
async function readBackupFile(backupPath, filename) {
  const filePath = path.join(backupPath, filename);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Import suppliers (no dependencies)
 */
async function importSuppliers(client, suppliers) {
  console.log(`\n🏪 Importing ${suppliers.length} suppliers...`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const supplier of suppliers) {
    const existing = await client.query(
      'SELECT id FROM suppliers WHERE id = $1',
      [supplier.id]
    );

    if (existing.rows.length > 0) {
      if (upsertMode) {
        await client.query(`
          UPDATE suppliers SET
            name = $1, type = $2, website = $3,
            contact_email = $4, contact_phone = $5,
            notes = $6, is_active = $7, updated_at = $8
          WHERE id = $9
        `, [
          supplier.name, supplier.type, supplier.website,
          supplier.contact_email, supplier.contact_phone,
          supplier.notes, supplier.is_active, supplier.updated_at,
          supplier.id
        ]);
        updated++;
      } else {
        skipped++;
      }
    } else {
      await client.query(`
        INSERT INTO suppliers (
          id, name, type, website, contact_email, contact_phone,
          notes, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        supplier.id, supplier.name, supplier.type, supplier.website,
        supplier.contact_email, supplier.contact_phone,
        supplier.notes, supplier.is_active,
        supplier.created_at, supplier.updated_at
      ]);
      inserted++;
    }
  }

  console.log(`   ✓ Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`);
  return { inserted, updated, skipped };
}

/**
 * Import materials (no dependencies)
 */
async function importMaterials(client, materialsData) {
  console.log(`\n🪵 Importing ${materialsData.materials.length} materials...`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const material of materialsData.materials) {
    const existing = await client.query(
      'SELECT id FROM materials WHERE id = $1',
      [material.id]
    );

    if (existing.rows.length > 0) {
      if (upsertMode) {
        await client.query(`
          UPDATE materials SET
            name = $1, category = $2, type = $3, recommended = $4,
            description = $5, usage = $6, image = $7
          WHERE id = $8
        `, [
          material.name, material.category, material.type, material.recommended,
          material.description, material.usage, material.image,
          material.id
        ]);
        updated++;
      } else {
        skipped++;
      }
    } else {
      await client.query(`
        INSERT INTO materials (
          id, name, category, type, recommended,
          description, usage, image, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        material.id, material.name, material.category, material.type,
        material.recommended, material.description, material.usage,
        material.image, material.created_at
      ]);
      inserted++;
    }
  }

  console.log(`   ✓ Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`);

  // Import material options (depends on materials and suppliers)
  console.log(`\n📦 Importing ${materialsData.options.length} material options...`);

  inserted = 0;
  updated = 0;
  skipped = 0;

  for (const option of materialsData.options) {
    const existing = await client.query(
      'SELECT id FROM material_options WHERE id = $1',
      [option.id]
    );

    if (existing.rows.length > 0) {
      if (upsertMode) {
        await client.query(`
          UPDATE material_options SET
            material_id = $1, supplier_id = $2,
            thickness = $3, thickness_num = $4, size = $5,
            price = $6, sku = $7, price_per_sqm = $8,
            is_active = $9, updated_at = $10
          WHERE id = $11
        `, [
          option.material_id, option.supplier_id,
          option.thickness, option.thickness_num, option.size,
          option.price, option.sku, option.price_per_sqm,
          option.is_active, option.updated_at,
          option.id
        ]);
        updated++;
      } else {
        skipped++;
      }
    } else {
      await client.query(`
        INSERT INTO material_options (
          id, material_id, supplier_id,
          thickness, thickness_num, size, price, sku,
          price_per_sqm, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        option.id, option.material_id, option.supplier_id,
        option.thickness, option.thickness_num, option.size,
        option.price, option.sku, option.price_per_sqm,
        option.is_active, option.created_at, option.updated_at
      ]);
      inserted++;
    }
  }

  console.log(`   ✓ Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`);
  return { inserted, updated, skipped };
}

/**
 * Import hardware items (no dependencies)
 */
async function importHardware(client, hardware) {
  console.log(`\n🔧 Importing ${hardware.length} hardware items...`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of hardware) {
    const existing = await client.query(
      'SELECT id FROM hardware_items WHERE id = $1',
      [item.id]
    );

    if (existing.rows.length > 0) {
      if (upsertMode) {
        await client.query(`
          UPDATE hardware_items SET
            key = $1, name = $2, description = $3, category = $4,
            unit_price = $5, unit_of_measure = $6, default_qty = $7,
            image = $8, notes = $9, is_active = $10, updated_at = $11
          WHERE id = $12
        `, [
          item.key, item.name, item.description, item.category,
          item.unit_price, item.unit_of_measure, item.default_qty,
          item.image, item.notes, item.is_active, item.updated_at,
          item.id
        ]);
        updated++;
      } else {
        skipped++;
      }
    } else {
      await client.query(`
        INSERT INTO hardware_items (
          id, key, name, description, category,
          unit_price, unit_of_measure, default_qty,
          image, notes, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        item.id, item.key, item.name, item.description, item.category,
        item.unit_price, item.unit_of_measure, item.default_qty,
        item.image, item.notes, item.is_active,
        item.created_at, item.updated_at
      ]);
      inserted++;
    }
  }

  console.log(`   ✓ Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`);
  return { inserted, updated, skipped };
}

/**
 * Import doors/drawers products and pricing
 */
async function importDoorsDrawers(client, doorsDrawersData) {
  console.log(`\n🚪 Importing ${doorsDrawersData.products.length} door/drawer products...`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const product of doorsDrawersData.products) {
    const existing = await client.query(
      'SELECT id FROM door_drawer_products WHERE id = $1',
      [product.id]
    );

    if (existing.rows.length > 0) {
      if (upsertMode) {
        await client.query(`
          UPDATE door_drawer_products SET
            key = $1, name = $2, description = $3, category = $4,
            product_type = $5, size_description = $6,
            default_width_mm = $7, default_height_mm = $8,
            is_active = $9, updated_at = $10
          WHERE id = $11
        `, [
          product.key, product.name, product.description, product.category,
          product.product_type, product.size_description,
          product.default_width_mm, product.default_height_mm,
          product.is_active, product.updated_at,
          product.id
        ]);
        updated++;
      } else {
        skipped++;
      }
    } else {
      await client.query(`
        INSERT INTO door_drawer_products (
          id, key, name, description, category, product_type,
          size_description, default_width_mm, default_height_mm,
          is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        product.id, product.key, product.name, product.description,
        product.category, product.product_type, product.size_description,
        product.default_width_mm, product.default_height_mm,
        product.is_active, product.created_at, product.updated_at
      ]);
      inserted++;
    }
  }

  console.log(`   ✓ Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`);

  // Import pricing (depends on products and suppliers)
  console.log(`\n💰 Importing ${doorsDrawersData.pricing.length} pricing entries...`);

  inserted = 0;
  updated = 0;
  skipped = 0;

  for (const price of doorsDrawersData.pricing) {
    const existing = await client.query(
      'SELECT id FROM door_drawer_pricing WHERE id = $1',
      [price.id]
    );

    if (existing.rows.length > 0) {
      if (upsertMode) {
        await client.query(`
          UPDATE door_drawer_pricing SET
            product_id = $1, supplier_id = $2, unit_price = $3,
            lead_time_days = $4, minimum_order_qty = $5, notes = $6,
            is_preferred = $7, is_active = $8, updated_at = $9
          WHERE id = $10
        `, [
          price.product_id, price.supplier_id, price.unit_price,
          price.lead_time_days, price.minimum_order_qty, price.notes,
          price.is_preferred, price.is_active, price.updated_at,
          price.id
        ]);
        updated++;
      } else {
        skipped++;
      }
    } else {
      await client.query(`
        INSERT INTO door_drawer_pricing (
          id, product_id, supplier_id, unit_price,
          lead_time_days, minimum_order_qty, notes,
          is_preferred, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        price.id, price.product_id, price.supplier_id, price.unit_price,
        price.lead_time_days, price.minimum_order_qty, price.notes,
        price.is_preferred, price.is_active,
        price.created_at, price.updated_at
      ]);
      inserted++;
    }
  }

  console.log(`   ✓ Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`);
  return { inserted, updated, skipped };
}

/**
 * Import builds (depends on materials - optional references)
 */
async function importBuilds(client, builds) {
  console.log(`\n📦 Importing ${builds.length} builds...`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const build of builds) {
    const existing = await client.query(
      'SELECT id FROM builds WHERE id = $1',
      [build.id]
    );

    // Convert JSONB fields to JSON strings for PostgreSQL
    const configuration = build.configuration ? JSON.stringify(build.configuration) : null;
    const costs_json = build.costs_json ? JSON.stringify(build.costs_json) : null;
    const hardware_json = build.hardware_json ? JSON.stringify(build.hardware_json) : null;
    const extras_json = build.extras_json ? JSON.stringify(build.extras_json) : null;
    const image_gallery = build.image_gallery ? JSON.stringify(build.image_gallery) : null;
    const plinth_config = build.plinth_config ? JSON.stringify(build.plinth_config) : null;
    const dimension_validation = build.dimension_validation ? JSON.stringify(build.dimension_validation) : null;

    if (existing.rows.length > 0) {
      if (upsertMode) {
        await client.query(`
          UPDATE builds SET
            name = $1, character = $2, image = $3, furniture_type = $4,
            width = $5, height = $6, depth = $7,
            configuration = $8, costs_json = $9, hardware_json = $10,
            extras_json = $11, generated_image = $12, generated_prompt = $13,
            image_gallery = $14, plinth_config = $15, dimension_validation = $16,
            special_tools = $17, considerations = $18, recommended_for = $19,
            updated_at = $20
          WHERE id = $21
        `, [
          build.name, build.character, build.image, build.furniture_type,
          build.width, build.height, build.depth,
          configuration, costs_json, hardware_json,
          extras_json, build.generated_image, build.generated_prompt,
          image_gallery, plinth_config, dimension_validation,
          build.special_tools, build.considerations, build.recommended_for,
          build.updated_at,
          build.id
        ]);
        updated++;
      } else {
        skipped++;
      }
    } else {
      await client.query(`
        INSERT INTO builds (
          id, name, character, image, furniture_type,
          width, height, depth,
          configuration, costs_json, hardware_json, extras_json,
          generated_image, generated_prompt, image_gallery,
          plinth_config, dimension_validation,
          special_tools, considerations, recommended_for,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      `, [
        build.id, build.name, build.character, build.image, build.furniture_type,
        build.width, build.height, build.depth,
        configuration, costs_json, hardware_json, extras_json,
        build.generated_image, build.generated_prompt, image_gallery,
        plinth_config, dimension_validation,
        build.special_tools, build.considerations, build.recommended_for,
        build.created_at, build.updated_at
      ]);
      inserted++;
    }
  }

  console.log(`   ✓ Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`);
  return { inserted, updated, skipped };
}

/**
 * Get current database statistics
 */
async function getDatabaseStats(client) {
  const stats = await client.query(`
    SELECT
      (SELECT COUNT(*) FROM builds) as total_builds,
      (SELECT COUNT(*) FROM materials) as materials,
      (SELECT COUNT(*) FROM material_options) as material_options,
      (SELECT COUNT(*) FROM suppliers) as suppliers,
      (SELECT COUNT(*) FROM hardware_items) as hardware_items,
      (SELECT COUNT(*) FROM door_drawer_products) as door_drawer_products,
      (SELECT COUNT(*) FROM door_drawer_pricing) as pricing_entries
  `);

  return stats.rows[0];
}

/**
 * Main migration function
 */
async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting database migration...\n');
    console.log(`📁 Backup directory: ${backupDir}`);
    console.log(`🔧 Mode: ${dryRun ? 'DRY RUN' : upsertMode ? 'UPSERT' : 'INSERT ONLY'}`);
    console.log(`📋 Skip builds: ${skipBuilds ? 'YES' : 'NO'}\n`);

    // Read manifest
    const manifest = await readManifest(backupDir);

    // Show current database state
    console.log('\n📊 Current Database State:');
    const beforeStats = await getDatabaseStats(client);
    console.log(`   Builds: ${beforeStats.total_builds}`);
    console.log(`   Materials: ${beforeStats.materials} (${beforeStats.material_options} options)`);
    console.log(`   Suppliers: ${beforeStats.suppliers}`);
    console.log(`   Hardware: ${beforeStats.hardware_items}`);
    console.log(`   Doors/Drawers: ${beforeStats.door_drawer_products} (${beforeStats.pricing_entries} pricing entries)`);

    if (dryRun) {
      console.log('\n🔍 DRY RUN MODE - No changes will be made');
      console.log('   Remove --dry-run flag to perform actual migration\n');
      return;
    }

    // Begin transaction
    await client.query('BEGIN');

    try {
      // Import in dependency order
      // 1. Independent tables first
      await importSuppliers(client, await readBackupFile(backupDir, 'suppliers.json'));
      await importHardware(client, await readBackupFile(backupDir, 'hardware.json'));

      // 2. Materials (no dependencies)
      await importMaterials(client, await readBackupFile(backupDir, 'materials.json'));

      // 3. Doors/Drawers products and pricing
      await importDoorsDrawers(client, await readBackupFile(backupDir, 'doors_drawers.json'));

      // 4. Builds (optional - may reference materials)
      if (!skipBuilds) {
        await importBuilds(client, await readBackupFile(backupDir, 'builds.json'));
      }

      // Commit transaction
      await client.query('COMMIT');

      // Show final database state
      console.log('\n📊 Final Database State:');
      const afterStats = await getDatabaseStats(client);
      console.log(`   Builds: ${afterStats.total_builds} (+${afterStats.total_builds - beforeStats.total_builds})`);
      console.log(`   Materials: ${afterStats.materials} (+${afterStats.materials - beforeStats.materials})`);
      console.log(`   Material Options: ${afterStats.material_options} (+${afterStats.material_options - beforeStats.material_options})`);
      console.log(`   Suppliers: ${afterStats.suppliers} (+${afterStats.suppliers - beforeStats.suppliers})`);
      console.log(`   Hardware: ${afterStats.hardware_items} (+${afterStats.hardware_items - beforeStats.hardware_items})`);
      console.log(`   Doors/Drawers: ${afterStats.door_drawer_products} (+${afterStats.door_drawer_products - beforeStats.door_drawer_products})`);
      console.log(`   Pricing Entries: ${afterStats.pricing_entries} (+${afterStats.pricing_entries - beforeStats.pricing_entries})`);

      console.log('\n✅ Migration completed successfully!');

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
