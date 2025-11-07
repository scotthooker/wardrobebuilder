#!/usr/bin/env node

/**
 * Fix Build Dimensions
 * Corrects interior section heights to account for material thickness
 * Interior sections should fit within INTERNAL dimensions, not external
 */

import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://wardrobe_user:wardrobe_password@localhost:5432/wardrobe_builder',
});

/**
 * Fix dimensions for a single carcass
 */
function fixCarcassDimensions(carcass, sectionWidth) {
  const thickness = carcass.material?.thicknessNum || 18;
  const externalHeight = carcass.height;
  const internalHeight = externalHeight - (thickness * 2);

  // Calculate current total interior height
  const currentInteriorHeight = carcass.interiorSections?.reduce((sum, section) => {
    return sum + (section.height || 0);
  }, 0) || 0;

  if (currentInteriorHeight === 0) {
    console.log(`    ⚠️  No interior sections to fix`);
    return carcass;
  }

  // Calculate correction ratio
  const ratio = internalHeight / currentInteriorHeight;

  console.log(`    📐 External: ${externalHeight}mm → Internal: ${internalHeight}mm`);
  console.log(`    📏 Current interior total: ${currentInteriorHeight}mm`);
  console.log(`    🔧 Applying ratio: ${ratio.toFixed(4)}`);

  // Apply correction to each interior section
  let adjustedTotal = 0;
  const fixedInteriorSections = carcass.interiorSections.map((section, idx) => {
    const oldHeight = section.height;
    const newHeight = Math.round(oldHeight * ratio);
    adjustedTotal += newHeight;

    console.log(`       Section ${idx}: ${oldHeight}mm → ${newHeight}mm (${section.type})`);

    return {
      ...section,
      height: newHeight
    };
  });

  // Handle rounding errors by adjusting the last section
  const roundingError = internalHeight - adjustedTotal;
  if (roundingError !== 0) {
    const lastIdx = fixedInteriorSections.length - 1;
    fixedInteriorSections[lastIdx].height += roundingError;
    console.log(`       Rounding adjustment: ${roundingError}mm to last section`);
  }

  console.log(`    ✅ New interior total: ${fixedInteriorSections.reduce((sum, s) => sum + s.height, 0)}mm`);

  return {
    ...carcass,
    interiorSections: fixedInteriorSections
  };
}

/**
 * Fix dimensions for all builds
 */
async function fixAllBuildDimensions() {
  console.log('🔧 Starting Build Dimension Fix...\n');

  try {
    // Fetch all builds
    const result = await pool.query('SELECT * FROM builds ORDER BY id');
    const builds = result.rows;

    console.log(`📦 Found ${builds.length} builds\n`);

    for (const build of builds) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Fixing Build ${build.id}: ${build.name}`);
      console.log('='.repeat(60));

      const config = build.configuration;
      let hasChanges = false;

      // Fix each section and carcass
      config.sections?.forEach((section, sectionIdx) => {
        section.carcasses?.forEach((carcass, carcassIdx) => {
          console.log(`\n  Section ${sectionIdx}, Carcass ${carcassIdx}:`);

          const fixedCarcass = fixCarcassDimensions(carcass, section.width);

          // Check if dimensions changed
          const oldTotal = carcass.interiorSections?.reduce((sum, s) => sum + (s.height || 0), 0) || 0;
          const newTotal = fixedCarcass.interiorSections?.reduce((sum, s) => sum + (s.height || 0), 0) || 0;

          if (oldTotal !== newTotal) {
            hasChanges = true;
            // Update in place
            section.carcasses[carcassIdx] = fixedCarcass;
          }
        });
      });

      if (hasChanges) {
        // Update database
        console.log(`\n  💾 Updating database...`);
        await pool.query(
          'UPDATE builds SET configuration = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [JSON.stringify(config), build.id]
        );
        console.log(`  ✅ Build ${build.id} updated successfully!`);
      } else {
        console.log(`\n  ℹ️  No changes needed for Build ${build.id}`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ Dimension fix complete!');
    console.log(`${'='.repeat(60)}\n`);

  } catch (error) {
    console.error('❌ Error during dimension fix:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the fix
fixAllBuildDimensions().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
