import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function validateBuilds() {
  console.log('🔍 Validating all builds...\\n');

  try {
    const response = await fetch(`${API_URL}/api/builds`);
    const builds = await response.json();

    console.log(`Found ${builds.length} total builds\\n`);

    const wardrobes = builds.filter(b => b.furnitureType === 'wardrobe' || !b.furnitureType);
    const desks = builds.filter(b => b.furnitureType === 'desk');

    console.log(`📚 Wardrobes: ${wardrobes.length}`);
    console.log(`🖥️  Desks: ${desks.length}\\n`);

    // Validate Wardrobes
    console.log('=' .repeat(80));
    console.log('WARDROBE BUILDS VALIDATION');
    console.log('=' .repeat(80) + '\\n');

    for (const wardrobe of wardrobes) {
      console.log(`📦 Build #${wardrobe.id}: ${wardrobe.name}`);

      const issues = [];
      const warnings = [];

      // Check required fields
      if (!wardrobe.name) issues.push('Missing name');
      if (!wardrobe.character) warnings.push('Missing character description');
      if (!wardrobe.costs) {
        issues.push('Missing costs object');
      } else {
        // Check materials
        if (!wardrobe.costs.materials || wardrobe.costs.materials.length === 0) {
          issues.push('No materials defined');
        } else {
          const components = wardrobe.costs.materials.map(m => m.component);
          console.log(`   Materials (${components.length}): ${components.join(', ')}`);

          // Check for required material types
          const hasCarcass = components.some(c => c.toLowerCase().includes('carcass'));
          const hasBackPanel = components.some(c => c.toLowerCase().includes('back') || c.toLowerCase().includes('backing'));
          const hasDrawers = wardrobe.configuration?.sections?.some(s =>
            s.carcasses?.some(c =>
              c.interiorSections?.some(i => i.type === 'drawers')
            )
          );
          const hasDrawerMaterial = components.some(c => c.toLowerCase().includes('drawer'));

          if (!hasCarcass) issues.push('Missing carcass material');
          if (!hasBackPanel) warnings.push('Missing back panel material');

          // Only flag missing drawer material if drawers are in configuration
          if (hasDrawers && !hasDrawerMaterial) {
            warnings.push('Has drawers in config but no drawer material');
          } else if (!hasDrawers && hasDrawerMaterial) {
            warnings.push('Has drawer material but no drawers in config');
          }
        }

        // Check configuration
        if (!wardrobe.configuration) {
          issues.push('Missing configuration');
        } else {
          if (!wardrobe.configuration.sections || wardrobe.configuration.sections.length === 0) {
            issues.push('No sections defined in configuration');
          }
          if (!wardrobe.configuration.width) warnings.push('Missing width');
          if (!wardrobe.configuration.height) warnings.push('Missing height');
          if (!wardrobe.configuration.depth) warnings.push('Missing depth');
        }

        // Check costs totals
        if (wardrobe.costs.grandTotal === undefined || wardrobe.costs.grandTotal === null) {
          issues.push('Missing grandTotal');
        }
      }

      // Print validation results
      if (issues.length === 0 && warnings.length === 0) {
        console.log(`   ✅ Valid - All checks passed\\n`);
      } else {
        if (issues.length > 0) {
          console.log(`   ❌ Issues (${issues.length}):`);
          issues.forEach(issue => console.log(`      - ${issue}`));
        }
        if (warnings.length > 0) {
          console.log(`   ⚠️  Warnings (${warnings.length}):`);
          warnings.forEach(warning => console.log(`      - ${warning}`));
        }
        console.log('');
      }
    }

    // Validate Desks
    console.log('\\n' + '=' .repeat(80));
    console.log('DESK BUILDS VALIDATION');
    console.log('=' .repeat(80) + '\\n');

    for (const desk of desks) {
      console.log(`🖥️  Build #${desk.id}: ${desk.name}`);

      const issues = [];
      const warnings = [];

      // Check required fields
      if (!desk.name) issues.push('Missing name');
      if (!desk.character) warnings.push('Missing character description');
      if (!desk.costs) {
        issues.push('Missing costs object');
      } else {
        // Check materials
        if (!desk.costs.materials || desk.costs.materials.length === 0) {
          issues.push('No materials defined');
        } else {
          const components = desk.costs.materials.map(m => m.component);
          console.log(`   Materials (${components.length}): ${components.join(', ')}`);

          // Check for required material types
          const hasDesktop = components.some(c => c.toLowerCase().includes('desktop'));

          if (!hasDesktop) issues.push('Missing desktop material');

          // Check if base material matches configuration
          const baseType = desk.configuration?.base?.type;
          if (baseType === 'pedestals' || baseType === 'panel_sides') {
            const hasBaseMaterial = components.some(c =>
              c.toLowerCase().includes('pedestal') || c.toLowerCase().includes('panel')
            );
            if (!hasBaseMaterial) {
              warnings.push(`Base type is "${baseType}" but no base material found`);
            }
          }

          // Check if overhead material matches configuration
          if (desk.configuration?.overhead?.enabled) {
            const hasOverheadMaterial = components.some(c =>
              c.toLowerCase().includes('overhead') || c.toLowerCase().includes('storage')
            );
            if (!hasOverheadMaterial) {
              warnings.push('Overhead enabled but no overhead storage material');
            }
          }
        }

        // Check configuration
        if (!desk.configuration) {
          issues.push('Missing configuration');
        } else {
          if (!desk.configuration.deskShape) warnings.push('Missing desk shape');
          if (!desk.configuration.base) warnings.push('Missing base configuration');
          if (!desk.configuration.width) warnings.push('Missing width');
          if (!desk.configuration.height) warnings.push('Missing height');
          if (!desk.configuration.depth) warnings.push('Missing depth');
        }

        // Check costs totals
        if (desk.costs.grandTotal === undefined || desk.costs.grandTotal === null) {
          issues.push('Missing grandTotal');
        }

        // Check hardware
        if (!desk.costs.hardware || desk.costs.hardware.length === 0) {
          warnings.push('No hardware defined');
        }
      }

      // Print validation results
      if (issues.length === 0 && warnings.length === 0) {
        console.log(`   ✅ Valid - All checks passed\\n`);
      } else {
        if (issues.length > 0) {
          console.log(`   ❌ Issues (${issues.length}):`);
          issues.forEach(issue => console.log(`      - ${issue}`));
        }
        if (warnings.length > 0) {
          console.log(`   ⚠️  Warnings (${warnings.length}):`);
          warnings.forEach(warning => console.log(`      - ${warning}`));
        }
        console.log('');
      }
    }

    console.log('\\n' + '=' .repeat(80));
    console.log('VALIDATION COMPLETE');
    console.log('=' .repeat(80));
    console.log('\\n✅ Build validation finished!');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

validateBuilds().catch(console.error);
