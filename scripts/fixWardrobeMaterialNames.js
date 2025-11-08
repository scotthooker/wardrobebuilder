import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3001';

// Map of old component names to new descriptive names
const componentNameMap = {
  'carcass18mm': 'Main Carcass',
  'carcass19mm': 'Main Carcass',
  'lining19mm': 'Interior Lining',
  'lining18mm': 'Interior Lining',
  'backing6mm': 'Back Panel',
  'drawer12mm': 'Drawer Boxes',
  'drawer15mm': 'Drawer Boxes',
  'drawer18mm': 'Drawer Boxes'
};

async function fixWardrobeMaterialNames() {
  console.log('🔧 Fixing wardrobe material component names...\\n');

  try {
    // Get all builds
    const response = await fetch(`${API_URL}/api/builds`);
    const builds = await response.json();

    // Filter wardrobe builds
    const wardrobes = builds.filter(b => b.furnitureType === 'wardrobe' || !b.furnitureType);

    console.log(`Found ${wardrobes.length} wardrobe builds to update\\n`);

    for (const wardrobe of wardrobes) {
      try {
        console.log(`📝 Processing: ${wardrobe.name} (ID: ${wardrobe.id})`);

        // Update material component names
        let updated = false;
        if (wardrobe.costs && wardrobe.costs.materials) {
          wardrobe.costs.materials = wardrobe.costs.materials.map(mat => {
            if (componentNameMap[mat.component]) {
              console.log(`   ✏️  Renaming "${mat.component}" → "${componentNameMap[mat.component]}"`);
              updated = true;
              return {
                ...mat,
                component: componentNameMap[mat.component]
              };
            }
            return mat;
          });
        }

        if (updated) {
          // Update the build in database
          const updateResponse = await fetch(`${API_URL}/api/builds/${wardrobe.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: wardrobe.name,
              character: wardrobe.character,
              image: wardrobe.image,
              furnitureType: wardrobe.furnitureType || 'wardrobe',
              width: wardrobe.width,
              height: wardrobe.height,
              depth: wardrobe.depth,
              configuration: wardrobe.configuration,
              costs: wardrobe.costs,
              hardware: wardrobe.hardware || [],
              extras: wardrobe.extras || {}
            })
          });

          if (!updateResponse.ok) {
            throw new Error(`Failed to update build ${wardrobe.id}`);
          }

          console.log(`   ✅ Updated wardrobe ID ${wardrobe.id}\\n`);
        } else {
          console.log(`   ⏭️  No changes needed\\n`);
        }
      } catch (error) {
        console.error(`   ❌ Error updating wardrobe ${wardrobe.id}:`, error.message);
        console.log('');
      }
    }

    console.log('✅ Finished fixing wardrobe material names!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixWardrobeMaterialNames().catch(console.error);
