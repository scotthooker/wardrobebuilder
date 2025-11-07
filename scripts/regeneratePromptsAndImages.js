#!/usr/bin/env node

/**
 * Regenerate Prompts and Images for All Builds
 * Uses the new dynamic template system
 */

import pg from 'pg';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateBuildPrompt } from '../server/promptTemplate.js';
import { validateDimensions } from '../server/dimensionValidator.js';

const { Pool } = pg;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://wardrobe_user:wardrobe_password@localhost:5432/wardrobe_builder',
});

// Configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'google/gemini-2.5-flash-image';
const IMAGES_DIR = path.join(__dirname, '../public/generated-images');

/**
 * Generate image using OpenRouter API
 */
async function generateImage(prompt, buildId, buildName) {
  if (!OPENROUTER_API_KEY) {
    console.error('  ❌ OPENROUTER_API_KEY not set');
    return null;
  }

  try {
    console.log(`  🎨 Generating image via OpenRouter...`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`  ❌ OpenRouter API error: ${response.status} ${errorText}`);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.content;

    if (!imageUrl) {
      console.error('  ❌ No image URL in response');
      return null;
    }

    // Download image
    console.log(`  📥 Downloading image...`);
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      console.error(`  ❌ Failed to download image`);
      return null;
    }

    const imageBuffer = await imageResponse.buffer();

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = buildName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const filename = `build_${String(buildId).padStart(2, '0')}_${safeName}_${timestamp}_1.png`;
    const filepath = path.join(IMAGES_DIR, filename);

    // Ensure directory exists
    await fs.mkdir(IMAGES_DIR, { recursive: true });

    // Save image
    await fs.writeFile(filepath, imageBuffer);
    console.log(`  ✅ Image saved: ${filename}`);

    return filename;
  } catch (error) {
    console.error(`  ❌ Error generating image:`, error.message);
    return null;
  }
}

/**
 * Main regeneration function
 */
async function regeneratePromptsAndImages() {
  console.log('🚀 Starting Prompt and Image Regeneration...\n');

  try {
    // Fetch all builds
    const result = await pool.query('SELECT * FROM builds ORDER BY id');
    const builds = result.rows;

    console.log(`📦 Found ${builds.length} builds\n`);

    for (const build of builds) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Processing Build ${build.id}: ${build.name}`);
      console.log('='.repeat(60));

      // Parse JSON fields
      const buildData = {
        id: build.id,
        name: build.name,
        character: build.character,
        configuration: build.configuration,
        costs: build.costs_json,
        extras: build.extras_json || []
      };

      // Validate dimensions
      console.log(`  📏 Validating dimensions...`);
      const dimensionValidation = validateDimensions(buildData.configuration);

      if (!dimensionValidation.valid) {
        console.log(`  ⚠️  Dimension validation errors:`);
        dimensionValidation.errors.forEach(err => console.log(`     - ${err}`));
      }

      if (dimensionValidation.warnings.length > 0) {
        console.log(`  ⚠️  Dimension warnings:`);
        dimensionValidation.warnings.forEach(warn => console.log(`     - ${warn}`));
      }

      // Generate new prompt
      console.log(`  ✍️  Generating new prompt...`);
      const newPrompt = generateBuildPrompt(buildData);
      console.log(`  📝 New prompt (${newPrompt.length} chars):`);
      console.log(`     "${newPrompt.substring(0, 100)}..."`);

      // Generate new image
      const newImageFilename = await generateImage(newPrompt, build.id, build.name);

      // Update database
      console.log(`  💾 Updating database...`);
      await pool.query(
        `UPDATE builds SET
          generated_prompt = $1,
          generated_image = $2,
          dimension_validation = $3,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [
          newPrompt,
          newImageFilename || build.generated_image, // Keep old if generation failed
          JSON.stringify(dimensionValidation),
          build.id
        ]
      );

      console.log(`  ✅ Build ${build.id} updated successfully!`);

      // Rate limiting delay
      if (newImageFilename) {
        console.log(`  ⏱️  Waiting 2 seconds before next image...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ Regeneration complete!');
    console.log(`${'='.repeat(60)}\n`);

  } catch (error) {
    console.error('❌ Error during regeneration:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the regeneration
regeneratePromptsAndImages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
