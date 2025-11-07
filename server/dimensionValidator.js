/**
 * Dimension Validation and Calculation Helper
 * Ensures all dimensions correctly factor in material thickness
 */

/**
 * Validate and calculate actual dimensions accounting for material thickness
 * @param {Object} configuration - Build configuration object
 * @returns {Object} - Validation results and corrected dimensions
 */
export function validateDimensions(configuration) {
  const errors = [];
  const warnings = [];
  const calculations = [];

  // Validate overall dimensions
  if (!configuration.width || !configuration.height || !configuration.depth) {
    errors.push('Missing overall dimensions (width, height, depth)');
    return { valid: false, errors, warnings, calculations };
  }

  // Validate sections
  if (!configuration.sections || configuration.sections.length === 0) {
    errors.push('No sections defined in configuration');
    return { valid: false, errors, warnings, calculations };
  }

  // Check section widths add up correctly
  const totalSectionWidth = configuration.sections.reduce((sum, section) => {
    return sum + (section.width || 0);
  }, 0);

  if (Math.abs(totalSectionWidth - configuration.width) > 1) {
    warnings.push(`Section widths (${totalSectionWidth}mm) don't match overall width (${configuration.width}mm)`);
  }

  // Validate each section and carcass
  configuration.sections.forEach((section, sectionIdx) => {
    if (!section.carcasses || section.carcasses.length === 0) {
      warnings.push(`Section ${sectionIdx} has no carcasses`);
      return;
    }

    // Check carcass heights add up to section height
    const totalCarcassHeight = section.carcasses.reduce((sum, carcass) => {
      return sum + (carcass.height || 0);
    }, 0);

    if (Math.abs(totalCarcassHeight - configuration.height) > 1) {
      warnings.push(`Section ${sectionIdx}: Carcass heights (${totalCarcassHeight}mm) don't match overall height (${configuration.height}mm)`);
    }

    // Validate each carcass
    section.carcasses.forEach((carcass, carcassIdx) => {
      const validation = validateCarcass(carcass, section, sectionIdx, carcassIdx);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
      calculations.push(...validation.calculations);
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    calculations
  };
}

/**
 * Validate a single carcass and its dimensions
 */
function validateCarcass(carcass, section, sectionIdx, carcassIdx) {
  const errors = [];
  const warnings = [];
  const calculations = [];

  if (!carcass.material || !carcass.material.thicknessNum) {
    errors.push(`Section ${sectionIdx}, Carcass ${carcassIdx}: Missing material thickness`);
    return { errors, warnings, calculations };
  }

  const thickness = carcass.material.thicknessNum;

  // Calculate internal dimensions
  const externalWidth = carcass.width || section.width;
  const externalHeight = carcass.height;
  const externalDepth = carcass.depth || section.depth || 600;

  // Account for panel thickness (left, right, top, bottom panels)
  const internalWidth = externalWidth - (thickness * 2);
  const internalHeight = externalHeight - (thickness * 2);
  const internalDepth = externalDepth - thickness; // Only back panel

  calculations.push({
    section: sectionIdx,
    carcass: carcassIdx,
    material: carcass.material.material,
    thickness: `${thickness}mm`,
    external: {
      width: externalWidth,
      height: externalHeight,
      depth: externalDepth
    },
    internal: {
      width: internalWidth,
      height: internalHeight,
      depth: internalDepth
    },
    panelThickness: {
      sides: thickness * 2, // Left + Right
      topBottom: thickness * 2, // Top + Bottom
      back: thickness // Back panel only
    }
  });

  // Validate interior sections fit within internal dimensions
  if (carcass.interiorSections) {
    const totalInteriorHeight = carcass.interiorSections.reduce((sum, interior) => {
      return sum + (interior.height || 0);
    }, 0);

    if (totalInteriorHeight > internalHeight) {
      errors.push(`Section ${sectionIdx}, Carcass ${carcassIdx}: Interior sections (${totalInteriorHeight}mm) exceed internal height (${internalHeight}mm)`);
    } else if (Math.abs(totalInteriorHeight - internalHeight) > 5) {
      warnings.push(`Section ${sectionIdx}, Carcass ${carcassIdx}: Interior sections (${totalInteriorHeight}mm) don't use full internal height (${internalHeight}mm)`);
    }

    // Validate drawer and shelf dimensions
    carcass.interiorSections.forEach((interior, interiorIdx) => {
      if (interior.type === 'drawers' && interior.drawers) {
        const drawerHeight = interior.height / interior.drawers;
        if (drawerHeight < 100) {
          warnings.push(`Section ${sectionIdx}, Carcass ${carcassIdx}: Drawer height (${drawerHeight}mm) may be too small`);
        }
      }

      if (interior.type === 'shelves' && interior.shelfCount) {
        const shelfSpacing = interior.height / (interior.shelfCount + 1);
        if (shelfSpacing < 200) {
          warnings.push(`Section ${sectionIdx}, Carcass ${carcassIdx}: Shelf spacing (${shelfSpacing}mm) may be too tight`);
        }
      }
    });
  }

  return { errors, warnings, calculations };
}

/**
 * Calculate plinth dimensions and requirements
 * @param {Object} configuration - Build configuration
 * @param {Object} plinthOptions - Plinth options (height, depth, hasLeft, hasRight, hasScribing)
 * @returns {Object} - Plinth calculations
 */
export function calculatePlinthDimensions(configuration, plinthOptions = {}) {
  const {
    height = 100, // Standard 100mm plinth
    depth = 50,    // 50mm setback from front
    hasLeft = true,
    hasRight = true,
    hasScribing = false,
    scribingHeight = 150 // Scribing facia height if required
  } = plinthOptions;

  const calculations = {
    plinth: {
      height,
      depth,
      components: []
    },
    scribing: null
  };

  // Calculate front plinth
  calculations.plinth.components.push({
    type: 'front',
    width: configuration.width,
    height: height,
    depth: depth,
    material: 'Match carcass material or MDF',
    notes: 'Main plinth spanning full width'
  });

  // Calculate left return if needed
  if (hasLeft) {
    calculations.plinth.components.push({
      type: 'left_return',
      width: configuration.depth - depth, // From front plinth to wall
      height: height,
      depth: depth,
      material: 'Match carcass material or MDF',
      notes: 'Left side return'
    });
  }

  // Calculate right return if needed
  if (hasRight) {
    calculations.plinth.components.push({
      type: 'right_return',
      width: configuration.depth - depth, // From front plinth to wall
      height: height,
      depth: depth,
      material: 'Match carcass material or MDF',
      notes: 'Right side return'
    });
  }

  // Calculate scribing facia if needed
  if (hasScribing) {
    calculations.scribing = {
      type: 'facia',
      width: configuration.width,
      height: scribingHeight,
      thickness: 18, // Standard 18mm
      material: 'Match carcass material',
      notes: 'Decorative facia to hide plinth gap, allows for floor unevenness',
      purpose: 'Conceals plinth and allows scribing to uneven floors'
    };
  }

  // Calculate adjusted wardrobe height accounting for plinth
  calculations.adjustedWardrobeHeight = configuration.height + height;

  return calculations;
}

/**
 * Generate cut list accounting for material thickness
 * @param {Object} configuration - Build configuration
 * @returns {Array} - List of required cuts with dimensions
 */
export function generateCutList(configuration) {
  const cutList = [];

  configuration.sections?.forEach((section, sectionIdx) => {
    section.carcasses?.forEach((carcass, carcassIdx) => {
      const thickness = carcass.material?.thicknessNum || 18;
      const material = carcass.material?.material || 'Unknown';

      // External dimensions
      const width = carcass.width || section.width;
      const height = carcass.height;
      const depth = carcass.depth || configuration.depth || 600;

      // Top and bottom panels (full width and depth)
      cutList.push({
        section: sectionIdx,
        carcass: carcassIdx,
        component: 'Top panel',
        width: width,
        depth: depth,
        thickness: thickness,
        material: material,
        quantity: 1
      });

      cutList.push({
        section: sectionIdx,
        carcass: carcassIdx,
        component: 'Bottom panel',
        width: width,
        depth: depth,
        thickness: thickness,
        material: material,
        quantity: 1
      });

      // Side panels (height minus top/bottom thickness, depth)
      cutList.push({
        section: sectionIdx,
        carcass: carcassIdx,
        component: 'Left side panel',
        width: height - (thickness * 2), // Account for top and bottom
        depth: depth,
        thickness: thickness,
        material: material,
        quantity: 1
      });

      cutList.push({
        section: sectionIdx,
        carcass: carcassIdx,
        component: 'Right side panel',
        width: height - (thickness * 2), // Account for top and bottom
        depth: depth,
        thickness: thickness,
        material: material,
        quantity: 1
      });

      // Back panel (internal dimensions)
      cutList.push({
        section: sectionIdx,
        carcass: carcassIdx,
        component: 'Back panel',
        width: width - (thickness * 2), // Internal width
        depth: height - (thickness * 2), // Internal height
        thickness: 6, // Typically thinner backing material
        material: 'Backing material',
        quantity: 1
      });

      // Shelves for interior sections
      carcass.interiorSections?.forEach((interior, interiorIdx) => {
        if (interior.type === 'shelves' && interior.shelfCount) {
          cutList.push({
            section: sectionIdx,
            carcass: carcassIdx,
            component: `Shelves (${interior.shelfCount}x)`,
            width: width - (thickness * 2) - 4, // Internal width minus clearance
            depth: depth - thickness - 4, // Internal depth minus clearance
            thickness: thickness,
            material: material,
            quantity: interior.shelfCount
          });
        }
      });
    });
  });

  return cutList;
}
