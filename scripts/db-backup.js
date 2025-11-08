/**
 * Database Backup Script
 *
 * Exports all data from the PostgreSQL database to JSON files
 * - Builds (with full configurations, costs, images)
 * - Materials (carcass materials with options)
 * - Suppliers
 * - Hardware items
 * - Door/drawer products with pricing
 *
 * Usage:
 *   node scripts/db-backup.js [--output=./backups]
 *
 * Output:
 *   Creates timestamped backup files in the specified directory
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
const outputArg = args.find(arg => arg.startsWith('--output='));
const outputDir = outputArg ? outputArg.split('=')[1] : path.join(__dirname, '../backups');

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://wardrobe_user:wardrobe_password@localhost:5432/wardrobe_builder';

const pool = new Pool({
  connectionString: DATABASE_URL,
});

/**
 * Create timestamped backup directory
 */
async function createBackupDir() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupPath = path.join(outputDir, `backup-${timestamp}`);

  await fs.mkdir(backupPath, { recursive: true });
  console.log(`📁 Created backup directory: ${backupPath}`);

  return backupPath;
}

/**
 * Export builds with all related data
 */
async function exportBuilds(client) {
  console.log('📦 Exporting builds...');

  const result = await client.query(`
    SELECT
      id, name, character, image, furniture_type,
      width, height, depth,
      configuration, costs_json, hardware_json, extras_json,
      generated_image, generated_prompt, image_gallery,
      plinth_config, dimension_validation,
      special_tools, considerations, recommended_for,
      created_at, updated_at
    FROM builds
    ORDER BY id
  `);

  console.log(`   ✓ Exported ${result.rows.length} builds`);
  return result.rows;
}

/**
 * Export materials with their options
 */
async function exportMaterials(client) {
  console.log('🪵 Exporting materials...');

  const materialsResult = await client.query(`
    SELECT
      id, name, category, type, recommended,
      description, usage, image, created_at
    FROM materials
    ORDER BY id
  `);

  const optionsResult = await client.query(`
    SELECT
      id, material_id, supplier_id,
      thickness, thickness_num, size, price, sku,
      price_per_sqm, is_active, created_at, updated_at
    FROM material_options
    ORDER BY id
  `);

  console.log(`   ✓ Exported ${materialsResult.rows.length} materials`);
  console.log(`   ✓ Exported ${optionsResult.rows.length} material options`);

  return {
    materials: materialsResult.rows,
    options: optionsResult.rows
  };
}

/**
 * Export suppliers
 */
async function exportSuppliers(client) {
  console.log('🏪 Exporting suppliers...');

  const result = await client.query(`
    SELECT
      id, name, type, website, contact_email, contact_phone,
      notes, is_active, created_at, updated_at
    FROM suppliers
    ORDER BY id
  `);

  console.log(`   ✓ Exported ${result.rows.length} suppliers`);
  return result.rows;
}

/**
 * Export hardware items
 */
async function exportHardware(client) {
  console.log('🔧 Exporting hardware items...');

  const result = await client.query(`
    SELECT
      id, key, name, description, category,
      unit_price, unit_of_measure, default_qty,
      image, notes, is_active,
      created_at, updated_at
    FROM hardware_items
    ORDER BY id
  `);

  console.log(`   ✓ Exported ${result.rows.length} hardware items`);
  return result.rows;
}

/**
 * Export door/drawer products with pricing
 */
async function exportDoorsDrawers(client) {
  console.log('🚪 Exporting doors & drawers...');

  const productsResult = await client.query(`
    SELECT
      id, key, name, description, category, product_type,
      size_description, default_width_mm, default_height_mm,
      is_active, created_at, updated_at
    FROM door_drawer_products
    ORDER BY id
  `);

  const pricingResult = await client.query(`
    SELECT
      id, product_id, supplier_id, unit_price,
      lead_time_days, minimum_order_qty, notes,
      is_preferred, is_active, created_at, updated_at
    FROM door_drawer_pricing
    ORDER BY id
  `);

  console.log(`   ✓ Exported ${productsResult.rows.length} door/drawer products`);
  console.log(`   ✓ Exported ${pricingResult.rows.length} pricing entries`);

  return {
    products: productsResult.rows,
    pricing: pricingResult.rows
  };
}

/**
 * Get database statistics
 */
async function getDatabaseStats(client) {
  const stats = await client.query(`
    SELECT
      (SELECT COUNT(*) FROM builds) as total_builds,
      (SELECT COUNT(*) FROM builds WHERE furniture_type = 'wardrobe') as wardrobes,
      (SELECT COUNT(*) FROM builds WHERE furniture_type = 'desk') as desks,
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
 * Main backup function
 */
async function createBackup() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting database backup...\n');

    // Create backup directory
    const backupPath = await createBackupDir();

    // Get database stats
    const stats = await getDatabaseStats(client);
    console.log('\n📊 Database Statistics:');
    console.log(`   Total Builds: ${stats.total_builds} (${stats.wardrobes} wardrobes, ${stats.desks} desks)`);
    console.log(`   Materials: ${stats.materials} (${stats.material_options} options)`);
    console.log(`   Suppliers: ${stats.suppliers}`);
    console.log(`   Hardware: ${stats.hardware_items}`);
    console.log(`   Doors/Drawers: ${stats.door_drawer_products} (${stats.pricing_entries} pricing entries)\n`);

    // Export all data
    const builds = await exportBuilds(client);
    const materials = await exportMaterials(client);
    const suppliers = await exportSuppliers(client);
    const hardware = await exportHardware(client);
    const doorsDrawers = await exportDoorsDrawers(client);

    // Create backup manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      database_url: DATABASE_URL.replace(/:[^:@]*@/, ':****@'), // Hide password
      stats,
      files: {
        builds: 'builds.json',
        materials: 'materials.json',
        suppliers: 'suppliers.json',
        hardware: 'hardware.json',
        doors_drawers: 'doors_drawers.json'
      }
    };

    // Write all data to JSON files
    console.log('\n💾 Writing backup files...');

    await fs.writeFile(
      path.join(backupPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    console.log('   ✓ manifest.json');

    await fs.writeFile(
      path.join(backupPath, 'builds.json'),
      JSON.stringify(builds, null, 2)
    );
    console.log('   ✓ builds.json');

    await fs.writeFile(
      path.join(backupPath, 'materials.json'),
      JSON.stringify(materials, null, 2)
    );
    console.log('   ✓ materials.json');

    await fs.writeFile(
      path.join(backupPath, 'suppliers.json'),
      JSON.stringify(suppliers, null, 2)
    );
    console.log('   ✓ suppliers.json');

    await fs.writeFile(
      path.join(backupPath, 'hardware.json'),
      JSON.stringify(hardware, null, 2)
    );
    console.log('   ✓ hardware.json');

    await fs.writeFile(
      path.join(backupPath, 'doors_drawers.json'),
      JSON.stringify(doorsDrawers, null, 2)
    );
    console.log('   ✓ doors_drawers.json');

    // Create latest symlink (Unix only)
    const latestLink = path.join(outputDir, 'latest');
    try {
      await fs.unlink(latestLink).catch(() => {});
      // Use relative path for symlink to work correctly
      const relativePath = path.basename(backupPath);
      await fs.symlink(relativePath, latestLink);
      console.log(`\n🔗 Created symlink: ${latestLink} -> ${relativePath}`);
    } catch (err) {
      // Symlinks not supported on Windows - skip
    }

    console.log('\n✅ Backup completed successfully!');
    console.log(`📍 Location: ${backupPath}`);

    // Calculate total size
    const files = await fs.readdir(backupPath);
    let totalSize = 0;
    for (const file of files) {
      const stat = await fs.stat(path.join(backupPath, file));
      totalSize += stat.size;
    }
    console.log(`💿 Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run backup
createBackup().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
