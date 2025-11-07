import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://wardrobe_user:wardrobe_password@localhost:5432/wardrobe_builder',
});

// Image filename mappings
const IMAGE_MAPPINGS = {
  1: 'build_01_ultimate_premium_2025-11-07T11-15-23-062Z_1.png',
  2: 'build_02_modern_minimalist_2025-11-07T11-15-49-597Z_1.png',
  3: 'build_03_smart_storage_2025-11-07T11-16-00-935Z_1.png',
  4: 'build_04_walkin_closet_2025-11-07T11-16-08-239Z_1.png',
  5: 'build_05_compact_studio_2025-11-07T11-16-16-486Z_1.png',
  6: 'build_06_industrial_chic_2025-11-07T11-16-29-464Z_1.png',
  7: 'build_07_kids_room_2025-11-07T11-16-36-095Z_1.png',
  8: 'build_08_master_bedroom_2025-11-07T11-17-01-540Z_1.png',
  9: 'build_09_narrow_hallway_2025-11-07T11-17-11-245Z_1.png',
  10: 'build_10_guest_room_2025-11-07T11-17-23-600Z_1.png',
  11: 'build_11_eco_sustainable_2025-11-07T11-17-31-801Z_1.png'
};

async function updateDatabase() {
  console.log('🚀 Updating database with images and prompts...\n');

  try {
    // Read prompts file
    const promptsFile = path.join(__dirname, 'build_prompts.json');
    const promptsData = JSON.parse(fs.readFileSync(promptsFile, 'utf-8'));

    const client = await pool.connect();

    for (const buildData of promptsData) {
      const buildId = buildData.buildId;
      const prompt = buildData.prompt;
      const imagePath = IMAGE_MAPPINGS[buildId];

      if (!imagePath) {
        console.log(`⚠️  No image mapping found for build ${buildId}`);
        continue;
      }

      // Update database
      await client.query(
        `UPDATE builds
         SET generated_prompt = $1,
             generated_image = $2,
             image = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [prompt, imagePath, buildId]
      );

      console.log(`✅ Build ${buildId}: ${buildData.buildName}`);
      console.log(`   Image: ${imagePath}`);
    }

    client.release();

    console.log('\n✅ Database updated successfully!');
    console.log('\n📸 All builds now have images and prompts');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

updateDatabase();
