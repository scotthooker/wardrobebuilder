import pg from 'pg';
const { Pool } = pg;

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://wardrobe_user:wardrobe_password@localhost:5432/wardrobe_builder',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection and log status
pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

// Initialize database (tables are created via init.sql in Docker)
async function initDatabase() {
  try {
    const client = await pool.connect();

    // Verify connection
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database initialized at', result.rows[0].now);

    client.release();
  } catch (err) {
    console.error('❌ Database initialization error:', err);
    throw err;
  }
}

// Initialize on import
initDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Helper function to enrich build with calculated properties
function enrichBuildData(build) {
  // Ensure costs has required structure
  if (!build.costs) {
    build.costs = {};
  }

  build.costs = {
    materials: build.costs.materials || [],
    materialTotal: build.costs.materialTotal || 0,
    professionalDoorsDrawers: build.costs.professionalDoorsDrawers || {},
    professionalDoorsDrawersTotal: build.costs.professionalDoorsDrawersTotal || 0,
    hardware: build.costs.hardware || {},
    hardwareTotal: build.costs.hardwareTotal || 0,
    extras: build.costs.extras || [],
    extrasTotal: build.costs.extrasTotal || 0,
    grandTotal: build.costs.grandTotal || 0,
    savingsVsBudget: build.costs.savingsVsBudget || 0,
    savingsPercent: build.costs.savingsPercent || 0
  };

  return build;
}

// Helper function to parse build JSON fields
function parseBuildFields(row) {
  if (!row) return null;

  const build = {
    id: row.id,
    name: row.name,
    character: row.character,
    image: row.image,

    // Dimensions
    width: row.width,
    height: row.height,
    depth: row.depth,

    // Configuration (sections, carcasses, doors)
    configuration: row.configuration || {},

    // Costs
    costs: row.costs_json || {},

    // Hardware selections
    hardware: row.hardware_json || [],

    // Extras/customizations
    extras: row.extras_json || {},

    // AI generation
    generatedImage: row.generated_image,
    generatedPrompt: row.generated_prompt,
    image_gallery: row.image_gallery || [],

    // Metadata
    specialTools: row.special_tools || [],
    considerations: row.considerations || [],
    recommendedFor: row.recommended_for,

    // Timestamps
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

  // Enrich with calculated properties
  return enrichBuildData(build);
}

// Get all builds
export async function getAllBuilds() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM builds ORDER BY created_at DESC');
    return result.rows.map(parseBuildFields);
  } finally {
    client.release();
  }
}

// Get build by ID
export async function getBuildById(id) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM builds WHERE id = $1', [id]);
    return parseBuildFields(result.rows[0]);
  } finally {
    client.release();
  }
}

// Create new build
export async function createBuild(build) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO builds (
        name, character, image,
        width, height, depth,
        configuration, costs_json, hardware_json, extras_json,
        special_tools, considerations, recommended_for,
        generated_image, generated_prompt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        build.name,
        build.character || null,
        build.image || null,
        build.width || 0,
        build.height || 0,
        build.depth || 0,
        JSON.stringify(build.configuration || {}),
        JSON.stringify(build.costs || {}),
        JSON.stringify(build.hardware || []),
        JSON.stringify(build.extras || {}),
        build.specialTools || [],
        build.considerations || [],
        build.recommendedFor || null,
        build.generatedImage || null,
        build.generatedPrompt || null
      ]
    );

    return parseBuildFields(result.rows[0]);
  } finally {
    client.release();
  }
}

// Update build
export async function updateBuild(id, updates) {
  const client = await pool.connect();
  try {
    // Get existing build
    const existing = await getBuildById(id);
    if (!existing) return null;

    const result = await client.query(
      `UPDATE builds SET
        name = $1,
        character = $2,
        image = $3,
        width = $4,
        height = $5,
        depth = $6,
        configuration = $7,
        costs_json = $8,
        hardware_json = $9,
        extras_json = $10,
        special_tools = $11,
        considerations = $12,
        recommended_for = $13,
        generated_image = $14,
        generated_prompt = $15,
        image_gallery = $16,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $17
      RETURNING *`,
      [
        updates.name !== undefined ? updates.name : existing.name,
        updates.character !== undefined ? updates.character : existing.character,
        updates.image !== undefined ? updates.image : existing.image,
        updates.width !== undefined ? updates.width : existing.width,
        updates.height !== undefined ? updates.height : existing.height,
        updates.depth !== undefined ? updates.depth : existing.depth,
        updates.configuration !== undefined ? JSON.stringify(updates.configuration) : JSON.stringify(existing.configuration),
        updates.costs !== undefined ? JSON.stringify(updates.costs) : JSON.stringify(existing.costs),
        updates.hardware !== undefined ? JSON.stringify(updates.hardware) : JSON.stringify(existing.hardware),
        updates.extras !== undefined ? JSON.stringify(updates.extras) : JSON.stringify(existing.extras),
        updates.specialTools !== undefined ? updates.specialTools : existing.specialTools,
        updates.considerations !== undefined ? updates.considerations : existing.considerations,
        updates.recommendedFor !== undefined ? updates.recommendedFor : existing.recommendedFor,
        updates.generatedImage !== undefined ? updates.generatedImage : existing.generatedImage,
        updates.generatedPrompt !== undefined ? updates.generatedPrompt : existing.generatedPrompt,
        updates.image_gallery !== undefined ? JSON.stringify(updates.image_gallery) : JSON.stringify(existing.image_gallery),
        id
      ]
    );

    return parseBuildFields(result.rows[0]);
  } finally {
    client.release();
  }
}

// Delete build
export async function deleteBuild(id) {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM builds WHERE id = $1', [id]);
    return result.rowCount > 0;
  } finally {
    client.release();
  }
}

// ==================== Materials Functions ====================

// Get all materials with their options
export async function getAllMaterials() {
  const client = await pool.connect();
  try {
    const materialsResult = await client.query(
      'SELECT * FROM materials ORDER BY recommended DESC, name'
    );

    const materials = [];
    for (const material of materialsResult.rows) {
      const optionsResult = await client.query(
        'SELECT * FROM material_options WHERE material_id = $1 ORDER BY thickness_num',
        [material.id]
      );

      materials.push({
        ...material,
        options: optionsResult.rows
      });
    }

    return materials;
  } finally {
    client.release();
  }
}

// Get carcass materials only
export async function getCarcassMaterials() {
  const client = await pool.connect();
  try {
    const materialsResult = await client.query(
      `SELECT * FROM materials
       WHERE type = 'CARCASS'
       ORDER BY recommended DESC, name`
    );

    const materials = [];
    for (const material of materialsResult.rows) {
      const optionsResult = await client.query(
        'SELECT * FROM material_options WHERE material_id = $1 ORDER BY thickness_num',
        [material.id]
      );

      // Convert snake_case to camelCase for frontend
      const options = optionsResult.rows.map(option => ({
        ...option,
        thicknessNum: option.thickness_num,
        pricePerSqm: option.price_per_sqm,
        materialId: option.material_id,
        createdAt: option.created_at
      }));

      materials.push({
        ...material,
        createdAt: material.created_at,
        options: options
      });
    }

    return materials;
  } finally {
    client.release();
  }
}

// ==================== Hardware Functions ====================

// Get all hardware items
export async function getHardwareItems() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM hardware_items
       WHERE is_active = true
       ORDER BY category, name`
    );

    // Convert snake_case to camelCase for frontend
    return result.rows.map(item => ({
      id: item.id,
      key: item.key,
      name: item.name,
      description: item.description,
      category: item.category,
      unitPrice: item.unit_price,
      unitOfMeasure: item.unit_of_measure,
      defaultQty: item.default_qty,
      image: item.image,
      notes: item.notes,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } finally {
    client.release();
  }
}

// ==================== Doors/Drawers Functions ====================

// Get all door/drawer products with pricing from all suppliers
export async function getDoorDrawerProducts() {
  const client = await pool.connect();
  try {
    const productsResult = await client.query(
      `SELECT * FROM door_drawer_products
       WHERE is_active = true
       ORDER BY category, product_type, name`
    );

    const products = [];
    for (const product of productsResult.rows) {
      // Get pricing from all suppliers
      const pricingResult = await client.query(
        `SELECT
          ddp.id,
          ddp.unit_price,
          ddp.lead_time_days,
          ddp.minimum_order_qty,
          ddp.notes,
          ddp.is_preferred,
          s.id as supplier_id,
          s.name as supplier_name,
          s.type as supplier_type,
          s.website as supplier_website
         FROM door_drawer_pricing ddp
         JOIN suppliers s ON s.id = ddp.supplier_id
         WHERE ddp.product_id = $1 AND ddp.is_active = true AND s.is_active = true
         ORDER BY ddp.is_preferred DESC, ddp.unit_price ASC`,
        [product.id]
      );

      // Convert snake_case to camelCase
      const pricing = pricingResult.rows.map(p => ({
        id: p.id,
        unitPrice: p.unit_price,
        leadTimeDays: p.lead_time_days,
        minimumOrderQty: p.minimum_order_qty,
        notes: p.notes,
        isPreferred: p.is_preferred,
        supplier: {
          id: p.supplier_id,
          name: p.supplier_name,
          type: p.supplier_type,
          website: p.supplier_website
        }
      }));

      products.push({
        id: product.id,
        key: product.key,
        name: product.name,
        description: product.description,
        category: product.category,
        productType: product.product_type,
        sizeDescription: product.size_description,
        defaultWidthMm: product.default_width_mm,
        defaultHeightMm: product.default_height_mm,
        isActive: product.is_active,
        pricing: pricing,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      });
    }

    return products;
  } finally {
    client.release();
  }
}

// ==================== Suppliers Functions ====================

// Get all suppliers
export async function getSuppliers(type = null) {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM suppliers WHERE is_active = true';
    const params = [];

    if (type) {
      query += ' AND (type = $1 OR type = \'BOTH\')';
      params.push(type);
    }

    query += ' ORDER BY name';

    const result = await client.query(query, params);

    return result.rows.map(s => ({
      id: s.id,
      name: s.name,
      type: s.type,
      website: s.website,
      contactEmail: s.contact_email,
      contactPhone: s.contact_phone,
      notes: s.notes,
      isActive: s.is_active,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }));
  } finally {
    client.release();
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database pool...');
  await pool.end();
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database pool...');
  await pool.end();
  process.exit(0);
});

export default pool;
