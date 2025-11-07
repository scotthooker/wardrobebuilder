import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://wardrobe_user:wardrobe_password@localhost:5432/wardrobe_builder',
});

// Helper to load JSON file
function loadJSON(relativePath) {
  const fullPath = path.join(__dirname, '..', '..', relativePath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

async function migrateData() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting database migration...\n');
    await client.query('BEGIN');

    // Step 1: Insert suppliers
    console.log('📦 Step 1: Migrating suppliers...');
    await migrateSuppliers(client);

    // Step 2: Migrate hardware items from base-config.json
    console.log('📦 Step 2: Migrating hardware items...');
    await migrateHardware(client);

    // Step 3: Migrate professional doors/drawers
    console.log('📦 Step 3: Migrating doors/drawers products...');
    await migrateDoorsDrawers(client);

    // Step 4: Migrate timeline templates
    console.log('📦 Step 4: Migrating timeline templates...');
    await migrateTimelineTemplates(client);

    // Step 5: Update material_options with supplier_id
    console.log('📦 Step 5: Updating material options with supplier...');
    await updateMaterialSuppliers(client);

    // Step 6: Migrate all 11 builds
    console.log('📦 Step 6: Migrating builds...');
    await migrateBuilds(client);

    await client.query('COMMIT');
    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Step 1: Insert suppliers
async function migrateSuppliers(client) {
  const suppliers = [
    {
      name: 'SL Hardwoods',
      type: 'SHEET_GOODS',
      website: 'https://www.slhardwoods.co.uk',
      is_active: true
    },
    {
      name: 'Made to Measure (MTM)',
      type: 'DOORS_DRAWERS',
      website: null,
      is_active: true
    }
  ];

  for (const supplier of suppliers) {
    await client.query(
      `INSERT INTO suppliers (name, type, website, is_active)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (name) DO UPDATE SET
         type = EXCLUDED.type,
         website = EXCLUDED.website,
         is_active = EXCLUDED.is_active`,
      [supplier.name, supplier.type, supplier.website, supplier.is_active]
    );
  }

  console.log(`   ✓ Migrated ${suppliers.length} suppliers`);
}

// Step 2: Migrate hardware items
async function migrateHardware(client) {
  const baseConfig = loadJSON('public/data/base-config.json');

  const hardwareItems = Object.entries(baseConfig.hardware).map(([key, item]) => ({
    key,
    name: item.desc,
    description: item.desc,
    category: item.category,
    unit_price: item.unitPrice,
    default_qty: item.qty,
    unit_of_measure: 'unit',
    is_active: true
  }));

  for (const item of hardwareItems) {
    await client.query(
      `INSERT INTO hardware_items (key, name, description, category, unit_price, default_qty, unit_of_measure, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (key) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         unit_price = EXCLUDED.unit_price,
         default_qty = EXCLUDED.default_qty`,
      [item.key, item.name, item.description, item.category, item.unit_price,
       item.default_qty, item.unit_of_measure, item.is_active]
    );
  }

  console.log(`   ✓ Migrated ${hardwareItems.length} hardware items`);
}

// Step 3: Migrate doors/drawers
async function migrateDoorsDrawers(client) {
  const baseConfig = loadJSON('public/data/base-config.json');

  // Get MTM supplier ID
  const supplierResult = await client.query(
    "SELECT id FROM suppliers WHERE name = 'Made to Measure (MTM)' LIMIT 1"
  );
  const mtmSupplierId = supplierResult.rows[0]?.id;

  if (!mtmSupplierId) {
    throw new Error('MTM supplier not found. Run supplier migration first.');
  }

  const products = Object.entries(baseConfig.professionalDoors).map(([key, item]) => ({
    key,
    name: item.desc,
    description: item.desc,
    category: item.category,
    product_type: key.toLowerCase().includes('drawer') ? 'drawer_front' : 'door',
    size_description: item.size,
    unit_price: item.unitPrice
  }));

  for (const product of products) {
    // Insert product
    const productResult = await client.query(
      `INSERT INTO door_drawer_products (key, name, description, category, product_type, size_description, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (key) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         category = EXCLUDED.category
       RETURNING id`,
      [product.key, product.name, product.description, product.category,
       product.product_type, product.size_description, true]
    );

    const productId = productResult.rows[0].id;

    // Insert pricing for MTM supplier
    await client.query(
      `INSERT INTO door_drawer_pricing (product_id, supplier_id, unit_price, is_preferred, is_active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (product_id, supplier_id) DO UPDATE SET
         unit_price = EXCLUDED.unit_price,
         is_preferred = EXCLUDED.is_preferred`,
      [productId, mtmSupplierId, product.unit_price, true, true]
    );
  }

  console.log(`   ✓ Migrated ${products.length} door/drawer products with pricing`);
}

// Step 4: Migrate timeline templates
async function migrateTimelineTemplates(client) {
  const baseConfig = loadJSON('public/data/base-config.json');

  await client.query(
    `INSERT INTO timeline_templates (name, description, is_default, phases)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (name) DO UPDATE SET
       phases = EXCLUDED.phases,
       description = EXCLUDED.description`,
    [
      'Default Wardrobe Build',
      'Standard timeline for most wardrobe builds',
      true,
      JSON.stringify(baseConfig.defaultTimeline)
    ]
  );

  console.log('   ✓ Migrated timeline templates');
}

// Step 5: Update material options with supplier
async function updateMaterialSuppliers(client) {
  const supplierResult = await client.query(
    "SELECT id FROM suppliers WHERE name = 'SL Hardwoods' LIMIT 1"
  );
  const supplierId = supplierResult.rows[0]?.id;

  if (supplierId) {
    const result = await client.query(
      `UPDATE material_options SET supplier_id = $1 WHERE supplier_id IS NULL`,
      [supplierId]
    );
    console.log(`   ✓ Updated ${result.rowCount} material options with SL Hardwoods supplier`);
  }
}

// Step 6: Migrate all builds
async function migrateBuilds(client) {
  const baseConfig = loadJSON('public/data/base-config.json');

  let migratedCount = 0;

  for (let i = 1; i <= 11; i++) {
    const buildId = String(i).padStart(2, '0');
    const buildPath = `public/data/builds/build-${buildId}.json`;

    try {
      const buildData = loadJSON(buildPath);

      // Calculate costs using a simplified approach
      const costs = {
        materialTotal: 0,
        professionalDoorsDrawersTotal: 0,
        hardwareTotal: 0,
        extrasTotal: 0,
        grandTotal: 0,
        savingsVsBudget: 0,
        savingsPercent: 0,
        materials: []
      };

      // Insert build
      const buildResult = await client.query(
        `INSERT INTO builds (
          name, character, image, width, height, depth,
          configuration, costs_json, hardware_json, extras_json,
          timeline_json, skill_level, special_tools, considerations, recommended_for
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id`,
        [
          buildData.name,
          buildData.character,
          buildData.image || null,
          buildData.width,
          buildData.height,
          buildData.depth,
          JSON.stringify({
            sections: buildData.sections,
            doors: buildData.doors
          }),
          JSON.stringify(costs),
          JSON.stringify([]), // hardware selections
          JSON.stringify({}), // extras
          JSON.stringify(baseConfig.defaultTimeline),
          baseConfig.defaultSkillLevel,
          [],
          [],
          ''
        ]
      );

      const newBuildId = buildResult.rows[0].id;

      // Insert sections and carcasses
      await migrateBuildSections(client, newBuildId, buildData.sections);

      migratedCount++;
      console.log(`   ✓ Migrated build ${buildId}: ${buildData.name}`);

    } catch (error) {
      console.warn(`   ⚠️  Build ${buildId} not found or error: ${error.message}`);
    }
  }

  console.log(`   ✓ Total builds migrated: ${migratedCount}`);
}

// Helper: Migrate build sections and carcasses
async function migrateBuildSections(client, buildId, sections) {
  for (const section of sections) {
    // Insert section
    const sectionResult = await client.query(
      `INSERT INTO build_sections (build_id, section_index, width)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [buildId, section.id, section.width]
    );

    const sectionId = sectionResult.rows[0].id;

    // Insert carcasses
    for (const carcass of section.carcasses) {
      // Find material and material_option IDs
      const materialResult = await client.query(
        `SELECT m.id as material_id, mo.id as option_id
         FROM materials m
         JOIN material_options mo ON mo.material_id = m.id
         WHERE m.name = $1 AND mo.thickness = $2
         LIMIT 1`,
        [carcass.material.material, carcass.material.thickness]
      );

      const materialId = materialResult.rows[0]?.material_id;
      const optionId = materialResult.rows[0]?.option_id;

      await client.query(
        `INSERT INTO build_carcasses (
          build_id, section_id, carcass_index, height, width,
          material_id, material_option_id, interior_sections
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          buildId,
          sectionId,
          carcass.id,
          carcass.height,
          carcass.width,
          materialId,
          optionId,
          JSON.stringify(carcass.interiorSections)
        ]
      );
    }
  }
}

// Run migration
console.log('═══════════════════════════════════════════════════════');
console.log('  Wardrobe Builder - Database Migration');
console.log('  From: Static JSON files');
console.log('  To: PostgreSQL Database');
console.log('═══════════════════════════════════════════════════════\n');

migrateData()
  .then(() => {
    console.log('\n✨ Migration complete! Database is now fully populated.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed with error:');
    console.error(error);
    process.exit(1);
  });
