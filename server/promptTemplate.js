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
  const furnitureType = build.furnitureType || build.configuration?.furnitureType || 'wardrobe';

  if (furnitureType === 'desk') {
    return generateDeskPrompt(build);
  } else {
    return generateWardrobePrompt(build);
  }
}

/**
 * Generate prompt specifically for wardrobe builds
 */
function generateWardrobePrompt(build) {
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
 * Generate prompt specifically for desk builds
 */
function generateDeskPrompt(build) {
  const config = build.configuration;
  const costs = build.costs;

  // Extract key desk information
  const materials = extractDeskMaterials(build);
  const style = inferDeskStyle(build);
  const features = extractDeskFeatures(config);
  const shape = config.deskShape || 'straight';
  const dimensions = `${config.width || 1600}mm × ${config.depth || 700}mm`;

  // Build prompt using desk template
  const prompt = `Professional product photography of a ${style.adjective} ${shape.replace('_', '-')} desk${style.descriptor ? ', ' + style.descriptor : ''}. ${dimensions} desk featuring ${features.join(', ')}. Desktop crafted from ${materials.desktop}, ${materials.base}, ${materials.finish}. ${style.setting}, ${style.lighting}. Front 3/4 angled view showing full desk setup, showcasing workspace organization and storage solutions. Photorealistic, high-quality furniture catalog style, 8k resolution, sharp focus. Style: architectural visualization, home office photography, professional lighting.`;

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

/**
 * Extract material information from desk build
 */
function extractDeskMaterials(build) {
  const costs = build.costs;

  // Get desktop material
  const desktopMaterial = costs.materials?.find(m =>
    m.component?.toLowerCase().includes('desktop')
  );

  // Get base material (pedestals/panels)
  const baseMaterial = costs.materials?.find(m =>
    m.component?.toLowerCase().includes('pedestal') ||
    m.component?.toLowerCase().includes('panel')
  );

  let desktop = 'premium oak veneer';
  let base = 'sturdy construction';
  let finish = 'professional finish';

  if (desktopMaterial) {
    const matName = desktopMaterial.material.toLowerCase();

    if (matName.includes('oak')) {
      desktop = 'premium oak veneered desktop with rich grain';
      finish = 'natural wood finish with protective coating';
    } else if (matName.includes('walnut')) {
      desktop = 'luxury walnut veneered desktop';
      finish = 'rich dark wood finish';
    } else if (matName.includes('ash')) {
      desktop = 'light ash veneered desktop';
      finish = 'contemporary blonde wood finish';
    } else if (matName.includes('melamine')) {
      desktop = 'clean white melamine desktop';
      finish = 'smooth matte surface';
    } else {
      desktop = 'quality engineered wood desktop';
      finish = 'durable work surface';
    }
  }

  if (baseMaterial) {
    const matName = baseMaterial.material.toLowerCase();

    if (matName.includes('pedestal')) {
      base = 'matching pedestal units with drawer storage';
    } else if (matName.includes('panel')) {
      base = 'solid panel sides for stability';
    }
  }

  // Check hardware for base type
  const hardware = build.costs.hardware || [];
  const hardwareText = JSON.stringify(hardware).toLowerCase();

  if (hardwareText.includes('trestle')) {
    base = 'modern trestle base with industrial aesthetic';
  } else if (hardwareText.includes('legs') || hardwareText.includes('adjustable')) {
    base = 'adjustable metal legs for ergonomic height';
  }

  return { desktop, base, finish };
}

/**
 * Infer style and aesthetic from desk build characteristics
 */
function inferDeskStyle(build) {
  const name = (build.name || '').toLowerCase();
  const character = (build.character || '').toLowerCase();
  const config = build.configuration || {};

  let adjective = 'modern';
  let descriptor = 'home office design';
  let setting = 'contemporary home office with neutral walls';
  let lighting = 'bright natural lighting from window, soft shadows';

  // Executive/Premium
  if (name.includes('executive') || name.includes('premium') || name.includes('professional')) {
    adjective = 'executive';
    descriptor = 'professional workspace';
    setting = 'upscale home office, designer furniture, professional environment';
    lighting = 'soft professional lighting, elegant ambiance';
  }
  // Gaming
  else if (name.includes('gaming') || name.includes('command center')) {
    adjective = 'gaming';
    descriptor = 'command center setup';
    setting = 'modern gaming room with LED accent lighting, tech-forward environment';
    lighting = 'dramatic ambient lighting with RGB accents visible';
  }
  // Standing desk
  else if (name.includes('standing') || config.height > 1000) {
    adjective = 'ergonomic standing';
    descriptor = 'height-adjustable workspace';
    setting = 'modern ergonomic office, health-conscious workspace';
    lighting = 'bright even lighting emphasizing workspace ergonomics';
  }
  // Creative/Studio
  else if (name.includes('creative') || name.includes('studio')) {
    adjective = 'creative professional';
    descriptor = 'spacious studio workspace';
    setting = 'artist studio or design office, creative environment, plants and inspiration';
    lighting = 'natural daylight with task lighting, creative ambiance';
  }
  // Minimalist
  else if (name.includes('minimalist') || name.includes('compact')) {
    adjective = 'minimalist';
    descriptor = 'clean simple design';
    setting = 'minimal home office, scandinavian aesthetic, uncluttered space';
    lighting = 'bright clean lighting, airy feel';
  }
  // Corner/L-shaped
  else if (name.includes('corner') || config.deskShape === 'l_shaped') {
    adjective = 'corner';
    descriptor = 'space-efficient L-configuration';
    setting = 'organized corner office setup, maximized workspace';
    lighting = 'balanced ambient lighting from multiple angles';
  }

  return { adjective, descriptor, setting, lighting };
}

/**
 * Extract desk features to highlight in prompt
 */
function extractDeskFeatures(config) {
  const features = [];

  // Base type features
  if (config.base?.type === 'pedestals') {
    const pedestalCount = (config.base.left?.enabled ? 1 : 0) + (config.base.right?.enabled ? 1 : 0);
    if (pedestalCount === 2) {
      features.push('dual pedestal storage with soft-close drawers');
    } else if (pedestalCount === 1) {
      features.push('single pedestal unit with integrated storage');
    }
  } else if (config.base?.type === 'panel_sides') {
    features.push('solid panel sides for clean aesthetic');
  } else if (config.base?.type === 'trestle') {
    features.push('industrial trestle base');
  } else if (config.base?.type === 'legs') {
    features.push('height-adjustable legs');
  }

  // Overhead storage
  if (config.overhead?.enabled) {
    if (config.overhead.type === 'hutch') {
      features.push('overhead hutch with enclosed storage');
    } else if (config.overhead.type === 'open_shelving') {
      features.push('open shelving for display and organization');
    } else if (config.overhead.type === 'closed_cabinets') {
      features.push('overhead closed cabinets');
    }
  }

  // Accessories
  const accessories = config.accessories || {};
  const accessoryFeatures = [];

  if (accessories.keyboard_tray) {
    accessoryFeatures.push('slide-out keyboard tray');
  }
  if (accessories.cable_management) {
    accessoryFeatures.push('integrated cable management');
  }
  if (accessories.monitor_arm) {
    accessoryFeatures.push('adjustable monitor arm');
  }
  if (accessories.cpu_holder) {
    accessoryFeatures.push('under-desk CPU holder');
  }
  if (accessories.desk_lamp) {
    accessoryFeatures.push('modern desk lamp');
  }

  if (accessoryFeatures.length > 0) {
    features.push(accessoryFeatures.join(', '));
  }

  // Desk shape
  const shape = config.deskShape || 'straight';
  if (shape === 'l_shaped') {
    features.push('spacious L-shaped layout maximizing corner space');
  } else if (shape === 'u_shaped') {
    features.push('expansive U-shaped configuration for maximum workspace');
  }

  if (features.length === 0) {
    features.push('functional workspace design');
  }

  return features;
}
