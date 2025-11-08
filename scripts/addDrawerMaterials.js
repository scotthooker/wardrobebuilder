import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://wardrobe_user:wardrobe_password@localhost:5432/wardrobe_builder',
});

async function addDrawerMaterials() {
  const client = await pool.connect();

  try {
    console.log('🔧 Adding drawer box materials to database...\n');

    // Material 1: Birch Plywood Drawer Boxes BB/BB (Premium)
    console.log('Adding Birch Plywood Drawer Boxes BB/BB...');
    const material1 = await client.query(`
      INSERT INTO materials (name, category, type, recommended, description, usage, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [
      'Birch Plywood Drawer Boxes BB/BB',
      'Premium Drawer Box Plywood',
      'DRAWER',
      true,
      'Water Boil Proof birch plywood BB/BB grade, specifically selected for drawer box construction. Extremely strong with excellent screw holding for drawer slides.',
      'Premium choice for drawer boxes. Superior strength and durability with smooth BB grade faces perfect for painted or clear finish.',
      '/images/materials/birch-plywood-drawer-bb-bb.png'
    ]);
    const material1Id = material1.rows[0].id;

    // Add pricing options for Birch Plywood BB/BB
    await client.query(`
      INSERT INTO material_options (material_id, thickness, thickness_num, size, price, sku, price_per_sqm)
      VALUES
        ($1, '12mm', 12, '2440mm x 1220mm', 45.50, 'BIRCH-BB-12MM', 15.28),
        ($1, '9mm', 9, '2440mm x 1220mm', 38.20, 'BIRCH-BB-9MM', 12.83),
        ($1, '15mm', 15, '2440mm x 1220mm', 52.80, 'BIRCH-BB-15MM', 17.74)
    `, [material1Id]);

    // Material 2: Birch Plywood Drawer Boxes B/BB (Quality)
    console.log('Adding Birch Plywood Drawer Boxes B/BB...');
    const material2 = await client.query(`
      INSERT INTO materials (name, category, type, recommended, description, usage, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [
      'Birch Plywood Drawer Boxes B/BB',
      'Premium Drawer Box Plywood',
      'DRAWER',
      true,
      'Water Boil Proof birch plywood B/BB grade for drawer construction. Strong and durable with good face quality.',
      'Quality drawer box material with excellent strength. Good screw holding for drawer slides at a more economical price point.',
      '/images/materials/birch-plywood-drawer-b-bb.png'
    ]);
    const material2Id = material2.rows[0].id;

    // Add pricing options for Birch Plywood B/BB
    await client.query(`
      INSERT INTO material_options (material_id, thickness, thickness_num, size, price, sku, price_per_sqm)
      VALUES
        ($1, '12mm', 12, '2440mm x 1220mm', 38.90, 'BIRCH-BBB-12MM', 13.06),
        ($1, '9mm', 9, '2440mm x 1220mm', 32.50, 'BIRCH-BBB-9MM', 10.92),
        ($1, '15mm', 15, '2440mm x 1220mm', 45.20, 'BIRCH-BBB-15MM', 15.18)
    `, [material2Id]);

    // Material 3: Hardwood Plywood Drawer Boxes (Standard)
    console.log('Adding Hardwood Plywood Drawer Boxes...');
    const material3 = await client.query(`
      INSERT INTO materials (name, category, type, recommended, description, usage, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [
      'Hardwood Plywood Drawer Boxes',
      'Standard Drawer Box Plywood',
      'DRAWER',
      false,
      'Quality hardwood plywood suitable for drawer box construction. Good strength and screw holding properties.',
      'Economical option for drawer boxes. Suitable for most applications with good durability.',
      '/images/materials/hardwood-plywood-drawer.png'
    ]);
    const material3Id = material3.rows[0].id;

    // Add pricing options for Hardwood Plywood
    await client.query(`
      INSERT INTO material_options (material_id, thickness, thickness_num, size, price, sku, price_per_sqm)
      VALUES
        ($1, '12mm', 12, '2440mm x 1220mm', 28.50, 'HARDWOOD-PLY-12MM', 9.57),
        ($1, '9mm', 9, '2440mm x 1220mm', 24.20, 'HARDWOOD-PLY-9MM', 8.13)
    `, [material3Id]);

    // Material 4: MDF Drawer Boxes (Budget)
    console.log('Adding MDF Drawer Boxes...');
    const material4 = await client.query(`
      INSERT INTO materials (name, category, type, recommended, description, usage, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [
      'MDF Drawer Boxes',
      'Budget Drawer Box Materials',
      'DRAWER',
      false,
      'Moisture Resistant MDF suitable for basic drawer box construction. Requires careful handling during assembly.',
      'Budget-friendly drawer box option. Best for light-duty applications. Requires pre-drilling for screws.',
      '/images/materials/mdf-drawer.png'
    ]);
    const material4Id = material4.rows[0].id;

    // Add pricing options for MDF
    await client.query(`
      INSERT INTO material_options (material_id, thickness, thickness_num, size, price, sku, price_per_sqm)
      VALUES
        ($1, '12mm', 12, '2440mm x 1220mm', 18.50, 'MDF-DRAWER-12MM', 6.21),
        ($1, '15mm', 15, '2440mm x 1220mm', 22.80, 'MDF-DRAWER-15MM', 7.66)
    `, [material4Id]);

    console.log('\n✅ All drawer materials added successfully!');
    console.log('\nAdded materials:');
    console.log('  - Birch Plywood Drawer Boxes BB/BB (12mm, 9mm, 15mm)');
    console.log('  - Birch Plywood Drawer Boxes B/BB (12mm, 9mm, 15mm)');
    console.log('  - Hardwood Plywood Drawer Boxes (12mm, 9mm)');
    console.log('  - MDF Drawer Boxes (12mm, 15mm)');

  } catch (error) {
    console.error('❌ Error adding drawer materials:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addDrawerMaterials();
