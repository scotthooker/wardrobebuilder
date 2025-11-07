/**
 * Dynamic Prompt Template System
 * Generates repeatable AI prompts based on build configuration
 */

/**
 * Generate a detailed, dynamic prompt for AI image generation
 * @param {Object} build - Complete build object with configuration, costs, materials
 * @returns {string} - Formatted prompt for AI image generation
 */
export function generateBuildPrompt(build) {
  const config = build.configuration;
  const costs = build.costs;

  // Extract key information
  const materials = extractMaterials(build);
  const style = inferStyle(build);
  const interiorFeatures = extractInteriorFeatures(config);
  const doorStyle = config.doors?.style || 'hinged';
  const sectionCount = config.sections?.length || 0;

  // Build prompt using template
  const prompt = `Professional product photography of a ${style.adjective} wardrobe${style.descriptor ? ', ' + style.descriptor : ''}. ${sectionCount}-section wardrobe with ${doorStyle} doors, featuring ${interiorFeatures.join(', ')}. Built from ${materials.primary}, ${materials.finish}, ${materials.details}. ${style.setting}, ${style.lighting}. Front 3/4 view showing full wardrobe at slight angle, doors partially open revealing interior organization. Photorealistic, high-quality furniture catalog style, 8k resolution, sharp focus. Style: architectural visualization, product photography, professional lighting.`;

  return prompt;
}

/**
 * Extract material information from build
 */
function extractMaterials(build) {
  const config = build.configuration;
  const costs = build.costs;

  // Get primary carcass material
  const carcassMaterial = costs.materials?.find(m =>
    m.component?.includes('carcass') || m.component?.includes('main')
  );

  let primaryMaterial = 'quality wood';
  let finish = 'professional finish';
  let details = 'attention to detail';

  if (carcassMaterial) {
    const matName = carcassMaterial.material.toLowerCase();

    if (matName.includes('birch plywood')) {
      primaryMaterial = 'premium birch plywood';
      finish = 'natural wood grain finish';
      details = 'visible plywood edges showcasing quality';
    } else if (matName.includes('oak')) {
      primaryMaterial = 'oak veneer MDF';
      finish = 'rich wood veneer finish';
      details = 'warm oak tones';
    } else if (matName.includes('ash')) {
      primaryMaterial = 'ash veneer MDF';
      finish = 'light natural veneer';
      details = 'subtle grain patterns';
    } else if (matName.includes('cherry')) {
      primaryMaterial = 'cherry veneer MDF';
      finish = 'warm cherry veneer';
      details = 'elegant wood tones';
    } else if (matName.includes('melamine')) {
      primaryMaterial = 'white melamine';
      finish = 'smooth matte surface';
      details = 'clean modern aesthetic';
    } else if (matName.includes('mdf')) {
      primaryMaterial = 'eco-friendly MDF';
      finish = 'painted finish ready';
      details = 'smooth painted surface';
    }
  }

  // Check for extras that affect appearance
  if (build.extras) {
    const extrasText = JSON.stringify(build.extras).toLowerCase();

    if (extrasText.includes('brass')) {
      details = details + ', brass hardware accents';
    } else if (extrasText.includes('steel') || extrasText.includes('metal')) {
      details = details + ', industrial metal fixtures';
    } else if (extrasText.includes('handle')) {
      details = details + ', premium hardware';
    }

    if (extrasText.includes('lacquer')) {
      finish = 'hand-applied lacquer finish';
    } else if (extrasText.includes('oil')) {
      finish = 'hand-oiled natural finish';
    } else if (extrasText.includes('paint')) {
      finish = 'professional painted finish';
    }
  }

  return {
    primary: primaryMaterial,
    finish: finish,
    details: details
  };
}

/**
 * Infer style and aesthetic from build characteristics
 */
function inferStyle(build) {
  const name = (build.name || '').toLowerCase();
  const character = (build.character || '').toLowerCase();
  const extrasText = JSON.stringify(build.extras).toLowerCase();
  const costsText = JSON.stringify(build.costs).toLowerCase();

  let adjective = 'modern';
  let descriptor = 'contemporary furniture design';
  let setting = 'modern bedroom with white walls, scandinavian interior';
  let lighting = 'bright even lighting, clean aesthetic';

  // Premium/Luxury
  if (name.includes('premium') || name.includes('luxury') || name.includes('ultimate')) {
    adjective = 'luxury';
    descriptor = 'high-end boutique wardrobe';
    setting = 'upscale bedroom interior, designer furniture setting';
    lighting = 'soft studio lighting with elegant shadows, premium ambiance';
  }
  // Minimalist/Modern
  else if (name.includes('minimalist') || name.includes('modern') || character.includes('clean lines')) {
    adjective = 'modern minimalist';
    descriptor = 'contemporary furniture design';
    setting = 'modern bedroom with white walls, scandinavian interior';
    lighting = 'bright even lighting, clean aesthetic';
  }
  // Industrial
  else if (name.includes('industrial') || extrasText.includes('steel') || extrasText.includes('metal')) {
    adjective = 'industrial modern';
    descriptor = 'urban loft aesthetic';
    setting = 'industrial loft interior, exposed brick or concrete';
    lighting = 'dramatic lighting with strong contrast';
  }
  // Eco/Sustainable
  else if (name.includes('eco') || name.includes('sustainable') || character.includes('sustainable')) {
    adjective = 'eco-conscious';
    descriptor = 'natural aesthetic';
    setting = 'modern eco-friendly interior, plants visible, natural daylight';
    lighting = 'soft shadows';
  }
  // Traditional/Classic
  else if (name.includes('classic') || name.includes('traditional') || name.includes('master bedroom')) {
    adjective = 'traditional';
    descriptor = 'elegant details';
    setting = 'classic bedroom interior, traditional decor';
    lighting = 'warm ambient lighting';
  }
  // Compact/Studio
  else if (name.includes('compact') || name.includes('studio') || name.includes('small')) {
    adjective = 'compact';
    descriptor = 'optimized for small spaces';
    setting = 'small apartment or studio interior';
    lighting = 'bright lighting to emphasize spaciousness';
  }
  // Kids/Children
  else if (name.includes('kids') || name.includes('children')) {
    adjective = 'child-friendly';
    descriptor = 'playful design';
    setting = 'colorful children\'s bedroom';
    lighting = 'bright cheerful lighting';
  }

  return { adjective, descriptor, setting, lighting };
}

/**
 * Extract interior features to highlight in prompt
 */
function extractInteriorFeatures(config) {
  const features = [];
  let hasRails = false;
  let hasDrawers = false;
  let hasShelves = false;
  let hasDoubleRail = false;

  config.sections?.forEach(section => {
    section.carcasses?.forEach(carcass => {
      carcass.interiorSections?.forEach(interior => {
        if (interior.type === 'rail' && !hasRails) {
          features.push('hanging rail visible');
          hasRails = true;
        } else if (interior.type === 'double_rail' && !hasDoubleRail) {
          features.push('double hanging rails visible through open doors');
          hasDoubleRail = true;
        } else if (interior.type === 'drawers' && !hasDrawers) {
          features.push('integrated drawer units');
          hasDrawers = true;
        } else if (interior.type === 'shelves' && !hasShelves) {
          features.push('organized shelving');
          hasShelves = true;
        }
      });
    });
  });

  if (features.length === 0) {
    features.push('versatile interior organization');
  }

  return features;
}

/**
 * Validate and update prompt for existing build
 * @param {Object} build - Build object
 * @returns {Object} - Updated build with new prompt
 */
export function updateBuildPrompt(build) {
  const newPrompt = generateBuildPrompt(build);
  return {
    ...build,
    generatedPrompt: newPrompt
  };
}
