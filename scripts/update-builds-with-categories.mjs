#!/usr/bin/env node

/**
 * Update all build files to add category field to materials
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Material name to category mapping
const MATERIAL_CATEGORIES = {
  'Moisture Resistant MDF': 'CARCASS',
  'Premium Quality MDF': 'CARCASS',
  'WBP Birch Plywood BB/BB': 'CARCASS',
  'Oak Crown Cut MDF Veneered': 'LINING',
  'Ash Veneered MDF': 'LINING',
  'Walnut Veneered MDF': 'LINING',
  'Oak Iron on Edging': 'EDGING',
  'Ash Iron on Edging': 'EDGING',
  'Walnut Iron on Edging': 'EDGING',
  'White Melamine Edging': 'EDGING'
};

// Determine category based on material name and component
function getCategoryForMaterial(materialName, component) {
  // Check exact match first
  if (MATERIAL_CATEGORIES[materialName]) {
    return MATERIAL_CATEGORIES[materialName];
  }

  // Infer from material name
  const nameLower = materialName.toLowerCase();

  if (nameLower.includes('edging') || nameLower.includes('edge')) {
    return 'EDGING';
  }

  if (nameLower.includes('veneered') || nameLower.includes('veneer')) {
    return 'LINING';
  }

  // Infer from component name
  const componentLower = component.toLowerCase();

  if (componentLower.includes('drawer')) {
    return 'DRAWER';
  }

  if (componentLower.includes('lining')) {
    return 'LINING';
  }

  if (componentLower.includes('backing') || componentLower.includes('back')) {
    return 'CARCASS';
  }

  if (componentLower.includes('edging') || componentLower.includes('edge')) {
    return 'EDGING';
  }

  if (componentLower.includes('carcass')) {
    return 'CARCASS';
  }

  // Default to CARCASS for sheet materials
  return 'CARCASS';
}

async function updateBuild(buildPath) {
  const filename = path.basename(buildPath);
  console.log(`\n📝 Processing ${filename}...`);

  try {
    const content = await fs.readFile(buildPath, 'utf8');
    const build = JSON.parse(content);

    let updated = false;

    // Update materials array
    if (build.costs && build.costs.materials && Array.isArray(build.costs.materials)) {
      build.costs.materials = build.costs.materials.map(material => {
        // Skip if already has category
        if (material.category) {
          console.log(`   ✓ ${material.material} - already has category: ${material.category}`);
          return material;
        }

        // Determine category
        const category = getCategoryForMaterial(material.material, material.component || '');
        console.log(`   + ${material.material} - assigned category: ${category}`);

        updated = true;
        return {
          ...material,
          category
        };
      });
    }

    if (updated) {
      await fs.writeFile(buildPath, JSON.stringify(build, null, 2), 'utf8');
      console.log(`   ✅ Updated ${filename}`);
    } else {
      console.log(`   ℹ️  No changes needed for ${filename}`);
    }

    return { filename, updated, materials: build.costs?.materials?.length || 0 };

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { filename, error: error.message };
  }
}

async function main() {
  console.log('🔧 Updating Build Files with Material Categories\n');
  console.log('=' .repeat(60));

  const buildsDir = path.join(__dirname, '..', 'public', 'data', 'builds');
  const files = await fs.readdir(buildsDir);
  const buildFiles = files.filter(f => f.endsWith('.json'));

  console.log(`\nFound ${buildFiles.length} build files\n`);

  const results = [];

  for (const file of buildFiles) {
    const buildPath = path.join(buildsDir, file);
    const result = await updateBuild(buildPath);
    results.push(result);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 Summary:\n');
  console.log(`Total files: ${results.length}`);
  console.log(`Updated: ${results.filter(r => r.updated).length}`);
  console.log(`No changes: ${results.filter(r => !r.updated && !r.error).length}`);
  console.log(`Errors: ${results.filter(r => r.error).length}`);

  console.log('\n✅ Done!');
}

main().catch(console.error);
