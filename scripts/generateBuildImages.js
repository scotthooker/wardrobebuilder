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

// Design prompt templates based on build characteristics
const STYLE_TEMPLATES = {
  premium: {
    materials: ['birch plywood', 'oak veneer', 'premium wood'],
    style: 'luxury boutique wardrobe, high-end furniture photography',
    lighting: 'soft studio lighting with elegant shadows',
    setting: 'upscale bedroom interior, minimalist background',
    finish: 'smooth painted finish, professional craftsmanship',
  },
  modern: {
    materials: ['white melamine', 'clean surfaces'],
    style: 'modern minimalist wardrobe, contemporary furniture design',
    lighting: 'bright even lighting, clean aesthetic',
    setting: 'modern bedroom with white walls, scandinavian interior',
    finish: 'matte white finish, seamless edges',
  },
  industrial: {
    materials: ['black melamine', 'metal accents'],
    style: 'industrial modern wardrobe, urban loft aesthetic',
    lighting: 'dramatic lighting with strong contrast',
    setting: 'industrial loft interior, exposed brick or concrete',
    finish: 'matte black finish, metal hardware',
  },
  traditional: {
    materials: ['cherry wood', 'walnut', 'warm wood tones'],
    style: 'traditional wardrobe with elegant details',
    lighting: 'warm ambient lighting',
    setting: 'classic bedroom interior, traditional decor',
    finish: 'hand-oiled wood finish, visible wood grain',
  },
  sustainable: {
    materials: ['eco-friendly MDF', 'sustainable materials'],
    style: 'eco-conscious wardrobe design, natural aesthetic',
    lighting: 'natural daylight, soft shadows',
    setting: 'modern eco-friendly interior, plants visible',
    finish: 'low-VOC finish, natural appearance',
  },
  compact: {
    materials: ['efficient materials', 'space-saving design'],
    style: 'compact wardrobe optimized for small spaces',
    lighting: 'bright lighting to emphasize spaciousness',
    setting: 'small apartment or studio interior',
    finish: 'clean finish, maximizing visual space',
  },
  kids: {
    materials: ['colorful accents', 'safe materials'],
    style: 'child-friendly wardrobe with playful design',
    lighting: 'bright cheerful lighting',
    setting: 'colorful children\'s bedroom',
    finish: 'durable finish, rounded edges',
  }
};

// Generate detailed prompt for a build
function generatePromptForBuild(build) {
  let template;
  let configDetails = '';

  // Determine style based on build name and characteristics
  const name = build.name.toLowerCase();

  if (name.includes('premium') || name.includes('luxury') || name.includes('ultimate')) {
    template = STYLE_TEMPLATES.premium;
  } else if (name.includes('minimalist') || name.includes('modern') || name.includes('contemporary')) {
    template = STYLE_TEMPLATES.modern;
  } else if (name.includes('industrial') || name.includes('chic')) {
    template = STYLE_TEMPLATES.industrial;
  } else if (name.includes('master') || name.includes('heritage') || name.includes('traditional')) {
    template = STYLE_TEMPLATES.traditional;
  } else if (name.includes('sustainable') || name.includes('eco')) {
    template = STYLE_TEMPLATES.sustainable;
  } else if (name.includes('compact') || name.includes('studio') || name.includes('narrow')) {
    template = STYLE_TEMPLATES.compact;
  } else if (name.includes('kids') || name.includes('children')) {
    template = STYLE_TEMPLATES.kids;
  } else {
    template = STYLE_TEMPLATES.modern; // default
  }

  // Extract configuration details
  const sections = build.configuration?.sections?.length || 2;
  const doorStyle = build.configuration?.doors?.style || 'hinged';

  // Count different interior types
  let hasRails = false;
  let hasDrawers = false;
  let hasShelves = false;
  let hasDoubleRail = false;

  if (build.configuration?.sections) {
    build.configuration.sections.forEach(section => {
      section.carcasses?.forEach(carcass => {
        carcass.interiorSections?.forEach(interior => {
          if (interior.type === 'rail') hasRails = true;
          if (interior.type === 'double_rail') hasDoubleRail = true;
          if (interior.type === 'drawers') hasDrawers = true;
          if (interior.type === 'shelves') hasShelves = true;
        });
      });
    });
  }

  // Build configuration description
  const interiorFeatures = [];
  if (hasDoubleRail) interiorFeatures.push('double hanging rails visible through open doors');
  else if (hasRails) interiorFeatures.push('hanging rail visible');
  if (hasDrawers) interiorFeatures.push('integrated drawer units');
  if (hasShelves) interiorFeatures.push('organized shelving');

  configDetails = interiorFeatures.length > 0
    ? `, featuring ${interiorFeatures.join(', ')}`
    : '';

  // Build the complete prompt
  const prompt = `Professional product photography of a ${template.style}.
${sections}-section wardrobe with ${doorStyle} doors${configDetails}.
Built from ${template.materials[0]}, ${template.finish}.
${template.setting}, ${template.lighting}.
Front 3/4 view showing full wardrobe at slight angle, doors partially open revealing interior organization.
Photorealistic, high-quality furniture catalog style, 8k resolution, sharp focus.
Style: architectural visualization, product photography, professional lighting.`;

  return prompt.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

// Generate image using OpenRouter (will be called via Node.js child process to use MCP)
async function generateImageForBuild(build, prompt) {
  console.log(`\n🎨 Generating image for: ${build.name}`);
  console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);

  const filename = `build_${build.id}_${Date.now()}`;

  // We'll save this prompt and filename to use with MCP tool separately
  return {
    prompt,
    filename: `${filename}.png`,
    needsGeneration: true
  };
}

// Update build in database
async function updateBuildWithImage(buildId, prompt, imagePath) {
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE builds
       SET generated_prompt = $1,
           generated_image = $2,
           image = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [prompt, imagePath, imagePath, buildId]
    );
    console.log(`  ✅ Database updated for build ${buildId}`);
  } finally {
    client.release();
  }
}

// Main function
async function generateAllImages() {
  console.log('🚀 Starting Build Image Generation...\n');

  try {
    // Get all builds
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM builds ORDER BY id');
    client.release();

    const builds = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      character: row.character,
      configuration: row.configuration,
      costs: row.costs_json
    }));

    console.log(`📦 Found ${builds.length} builds\n`);

    // Generate prompts for all builds
    const buildPrompts = [];
    for (const build of builds) {
      const prompt = generatePromptForBuild(build);
      buildPrompts.push({
        buildId: build.id,
        buildName: build.name,
        prompt: prompt
      });
    }

    // Save prompts to a JSON file for the image generation script
    const promptsFile = path.join(__dirname, 'build_prompts.json');
    fs.writeFileSync(promptsFile, JSON.stringify(buildPrompts, null, 2));
    console.log(`✅ Prompts saved to: ${promptsFile}\n`);

    // Output prompts for review
    console.log('📋 Generated Prompts:\n');
    buildPrompts.forEach(({ buildId, buildName, prompt }) => {
      console.log(`\n${buildId}. ${buildName}`);
      console.log(`   ${prompt.substring(0, 150)}...`);
    });

    console.log('\n✅ Prompt generation complete!');
    console.log('\n📸 Next step: Run the image generation script to create images');
    console.log('   The prompts are saved in build_prompts.json');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

// Run
generateAllImages();
