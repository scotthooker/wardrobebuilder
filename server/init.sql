-- Wardrobe Builder Database Schema
-- PostgreSQL initialization script
-- Full database-powered application (no static JSON files)

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- SUPPLIERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL, -- 'SHEET_GOODS', 'DOORS_DRAWERS', or 'BOTH'
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(type);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active);

-- ============================================================================
-- SHEET GOODS MATERIALS
-- ============================================================================

-- Materials table (carcass materials)
CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  recommended BOOLEAN DEFAULT false,
  description TEXT,
  usage TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(type);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_recommended ON materials(recommended);

-- Material pricing and specifications (with supplier support)
CREATE TABLE IF NOT EXISTS material_options (
  id SERIAL PRIMARY KEY,
  material_id INTEGER REFERENCES materials(id) ON DELETE CASCADE,
  supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
  thickness TEXT NOT NULL,
  thickness_num INTEGER NOT NULL,
  size TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  price_per_sqm NUMERIC(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_material_options_material_id ON material_options(material_id);
CREATE INDEX IF NOT EXISTS idx_material_options_supplier_id ON material_options(supplier_id);
CREATE INDEX IF NOT EXISTS idx_material_options_sku ON material_options(sku);
CREATE INDEX IF NOT EXISTS idx_material_options_active ON material_options(is_active);

-- ============================================================================
-- HARDWARE ITEMS (Fixed pricing, no suppliers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS hardware_items (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE, -- 'hinges', 'drawerRunners', 'clothingRails', etc.
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'hardware',
  unit_price NUMERIC(10, 2) NOT NULL,
  unit_of_measure TEXT DEFAULT 'unit', -- 'unit', 'pair', 'set', 'kit'
  default_qty INTEGER DEFAULT 1, -- Default quantity per build
  image TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hardware_items_key ON hardware_items(key);
CREATE INDEX IF NOT EXISTS idx_hardware_items_category ON hardware_items(category);
CREATE INDEX IF NOT EXISTS idx_hardware_items_active ON hardware_items(is_active);

-- ============================================================================
-- PROFESSIONAL DOORS/DRAWERS (Multiple suppliers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS door_drawer_products (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE, -- 'largeDoors', 'mediumDoors', 'smallDoors', 'externalDrawerFronts'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'doors', -- 'doors' or 'drawers'
  product_type TEXT NOT NULL, -- 'door', 'drawer_front'
  size_description TEXT, -- e.g., "1579mm H x 512mm W"
  default_width_mm INTEGER,
  default_height_mm INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_door_drawer_products_key ON door_drawer_products(key);
CREATE INDEX IF NOT EXISTS idx_door_drawer_products_type ON door_drawer_products(product_type);
CREATE INDEX IF NOT EXISTS idx_door_drawer_products_category ON door_drawer_products(category);
CREATE INDEX IF NOT EXISTS idx_door_drawer_products_active ON door_drawer_products(is_active);

-- Pricing table for doors/drawers by supplier
CREATE TABLE IF NOT EXISTS door_drawer_pricing (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES door_drawer_products(id) ON DELETE CASCADE,
  supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
  unit_price NUMERIC(10, 2) NOT NULL,
  lead_time_days INTEGER,
  minimum_order_qty INTEGER DEFAULT 1,
  notes TEXT,
  is_preferred BOOLEAN DEFAULT false, -- Mark preferred supplier for this product
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, supplier_id)
);

CREATE INDEX IF NOT EXISTS idx_door_drawer_pricing_product ON door_drawer_pricing(product_id);
CREATE INDEX IF NOT EXISTS idx_door_drawer_pricing_supplier ON door_drawer_pricing(supplier_id);
CREATE INDEX IF NOT EXISTS idx_door_drawer_pricing_preferred ON door_drawer_pricing(is_preferred);
CREATE INDEX IF NOT EXISTS idx_door_drawer_pricing_active ON door_drawer_pricing(is_active);

-- ============================================================================
-- BUILDS (Enhanced structure for full configuration storage)
-- ============================================================================

DROP TABLE IF EXISTS build_carcasses CASCADE;
DROP TABLE IF EXISTS build_sections CASCADE;
DROP TABLE IF EXISTS builds CASCADE;

CREATE TABLE builds (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  character TEXT,
  image TEXT,

  -- Wardrobe dimensions
  width INTEGER NOT NULL, -- in mm
  height INTEGER NOT NULL, -- in mm
  depth INTEGER NOT NULL, -- in mm

  -- Configuration stored as JSONB (sections, carcasses, doors)
  -- Structure: {sections: [{id, width, carcasses: [...]}], doors: {...}}
  configuration JSONB NOT NULL,

  -- Cost breakdown (calculated and stored)
  costs_json JSONB NOT NULL,

  -- Hardware selections stored as JSONB
  -- Structure: [{hardware_item_id, qty, unit_price, total}, ...]
  hardware_json JSONB DEFAULT '[]'::jsonb,

  -- Extras/customizations
  extras_json JSONB DEFAULT '{}'::jsonb,

  -- AI generation metadata (legacy - use image_gallery instead)
  generated_image TEXT,
  generated_prompt TEXT,

  -- Image gallery (array of image objects)
  -- Structure: [{url, prompt, created_at, is_primary}, ...]
  image_gallery JSONB DEFAULT '[]'::jsonb,

  -- Plinth configuration
  plinth_config JSONB DEFAULT '{
    "enabled": false,
    "height": 100,
    "depth": 50,
    "hasLeft": true,
    "hasRight": true,
    "hasScribing": false,
    "scribingHeight": 150
  }'::jsonb,

  -- Dimension validation results
  dimension_validation JSONB,

  -- Metadata
  special_tools TEXT[], -- Array of special tools required
  considerations TEXT[], -- Array of special considerations
  recommended_for TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_builds_name ON builds(name);
CREATE INDEX IF NOT EXISTS idx_builds_created_at ON builds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_builds_width ON builds(width);
CREATE INDEX IF NOT EXISTS idx_builds_height ON builds(height);
CREATE INDEX IF NOT EXISTS idx_builds_plinth ON builds ((plinth_config->>'enabled'));

-- ============================================================================
-- BUILD SECTIONS (Normalized view for easier querying)
-- ============================================================================

CREATE TABLE IF NOT EXISTS build_sections (
  id SERIAL PRIMARY KEY,
  build_id INTEGER REFERENCES builds(id) ON DELETE CASCADE,
  section_index INTEGER NOT NULL, -- Order in the wardrobe (0, 1, 2...)
  width INTEGER NOT NULL, -- Width of this section in mm
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(build_id, section_index)
);

CREATE INDEX IF NOT EXISTS idx_build_sections_build ON build_sections(build_id);

-- ============================================================================
-- BUILD CARCASSES (Normalized view for easier querying)
-- ============================================================================

CREATE TABLE IF NOT EXISTS build_carcasses (
  id SERIAL PRIMARY KEY,
  build_id INTEGER REFERENCES builds(id) ON DELETE CASCADE,
  section_id INTEGER REFERENCES build_sections(id) ON DELETE CASCADE,
  carcass_index INTEGER NOT NULL, -- Order within the section (0, 1, 2...)
  height INTEGER NOT NULL, -- Height in mm
  width INTEGER NOT NULL, -- Width in mm (inherited from section)

  -- Material selection
  material_id INTEGER REFERENCES materials(id) ON DELETE SET NULL,
  material_option_id INTEGER REFERENCES material_options(id) ON DELETE SET NULL,

  -- Interior configuration stored as JSONB array
  -- Structure: [{id, type: 'rail'|'shelves'|'drawers'|'double_rail', height, ...}, ...]
  interior_sections JSONB NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(build_id, section_id, carcass_index)
);

CREATE INDEX IF NOT EXISTS idx_build_carcasses_build ON build_carcasses(build_id);
CREATE INDEX IF NOT EXISTS idx_build_carcasses_section ON build_carcasses(section_id);
CREATE INDEX IF NOT EXISTS idx_build_carcasses_material ON build_carcasses(material_id);
CREATE INDEX IF NOT EXISTS idx_build_carcasses_option ON build_carcasses(material_option_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger for suppliers
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update timestamp trigger for material_options
DROP TRIGGER IF EXISTS update_material_options_updated_at ON material_options;
CREATE TRIGGER update_material_options_updated_at
  BEFORE UPDATE ON material_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update timestamp trigger for hardware_items
DROP TRIGGER IF EXISTS update_hardware_items_updated_at ON hardware_items;
CREATE TRIGGER update_hardware_items_updated_at
  BEFORE UPDATE ON hardware_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update timestamp trigger for door_drawer_products
DROP TRIGGER IF EXISTS update_door_drawer_products_updated_at ON door_drawer_products;
CREATE TRIGGER update_door_drawer_products_updated_at
  BEFORE UPDATE ON door_drawer_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update timestamp trigger for door_drawer_pricing
DROP TRIGGER IF EXISTS update_door_drawer_pricing_updated_at ON door_drawer_pricing;
CREATE TRIGGER update_door_drawer_pricing_updated_at
  BEFORE UPDATE ON door_drawer_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update timestamp trigger for builds
DROP TRIGGER IF EXISTS update_builds_updated_at ON builds;
CREATE TRIGGER update_builds_updated_at
  BEFORE UPDATE ON builds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
