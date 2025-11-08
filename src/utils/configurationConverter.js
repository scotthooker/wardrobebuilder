import { DeskModel } from '../models/DeskModel';

/**
 * Converts furniture configuration from builder to build object
 * Handles both wardrobes and desks
 */
export function configurationToBuild(configuration, buildName) {
  // Determine furniture type
  const furnitureType = configuration.furnitureType || 'wardrobe';

  // Use appropriate converter based on type
  if (furnitureType === 'desk') {
    return configurationToDeskBuild(configuration, buildName || 'My Desk');
  } else {
    return configurationToWardrobeBuild(configuration, buildName || 'My Wardrobe');
  }
}

/**
 * Convert desk configuration to build object
 */
function configurationToDeskBuild(configuration, buildName) {
  const deskModel = new DeskModel(configuration);
  const costs = deskModel.costs;
  const budget = configuration.budget || 5000;

  return {
    id: Date.now(),
    name: buildName,
    character: `${configuration.deskShape} desk, ${configuration.width}×${configuration.depth}mm`,
    image: '/placeholder-desk.png',
    furnitureType: 'desk',
    budget,
    configuration,
    costs: {
      materials: costs.materials,
      materialTotal: costs.materialTotal,
      professionalDoorsDrawers: {},
      professionalDoorsDrawersTotal: 0,
      hardware: costs.hardware,
      hardwareTotal: costs.hardwareTotal,
      extras: costs.accessories,
      extrasTotal: costs.accessoriesTotal,
      grandTotal: costs.grandTotal,
      savingsVsBudget: budget - costs.grandTotal
    }
  };
}

/**
 * Convert wardrobe configuration to build object
 */
function configurationToWardrobeBuild(configuration, buildName) {
  // Calculate materials needed
  const materials = [];

  // Add carcass materials
  materials.push({
    component: 'Carcass - Sides & Top/Bottom',
    material: 'Moisture Resistant MDF',
    thickness: '18mm',
    sheets: Math.ceil(configuration.numCarcasses * 2.5), // Rough estimate
    pricePerSheet: 46.81, // Default price
    subtotal: 0,
    category: 'CARCASS'
  });

  // Count total drawers and shelves
  let totalDrawers = 0;
  let totalShelves = 0;
  let totalRails = 0;

  configuration.carcasses?.forEach(carcass => {
    carcass.sections.forEach(section => {
      if (section.type === 'drawers') {
        totalDrawers += section.drawers || 0;
      } else if (section.type === 'shelves') {
        totalShelves += section.shelfCount || 0;
      } else if (section.type === 'rail' || section.type === 'double_rail') {
        totalRails += 1;
      }
    });
  });

  // Add drawer materials if needed
  if (totalDrawers > 0) {
    materials.push({
      component: 'Drawer Boxes',
      material: 'WBP Birch Plywood BB/BB',
      thickness: '12mm',
      sheets: Math.ceil(totalDrawers / 4),
      pricePerSheet: 45.00,
      subtotal: 0,
      category: 'DRAWER'
    });
  }

  // Calculate professional doors and drawers
  const professionalDoorsDrawers = {};

  if (configuration.doors?.style !== 'none' && configuration.doors?.count > 0) {
    professionalDoorsDrawers.doors = {
      qty: configuration.doors.count,
      description: `${configuration.doors.style === 'hinged' ? 'Hinged' : 'Sliding'} Doors`,
      unitPrice: 150.00,
      total: configuration.doors.count * 150.00
    };
  }

  if (configuration.externalDrawers?.count > 0) {
    professionalDoorsDrawers.drawerFronts = {
      qty: configuration.externalDrawers.count,
      description: 'External Drawer Fronts',
      unitPrice: 50.00,
      total: configuration.externalDrawers.count * 50.00
    };
  }

  // Hardware estimation
  const hardware = {
    hinges: {
      desc: 'Soft-close hinges',
      qty: (configuration.doors?.count || 0) * 2,
      unitPrice: 3.50,
      total: (configuration.doors?.count || 0) * 2 * 3.50
    },
    drawerSlides: {
      desc: 'Drawer slides',
      qty: totalDrawers,
      unitPrice: 8.00,
      total: totalDrawers * 8.00
    },
    hangingRails: {
      desc: 'Hanging rails',
      qty: totalRails,
      unitPrice: 12.00,
      total: totalRails * 12.00
    },
    shelfPins: {
      desc: 'Shelf support pins',
      qty: totalShelves * 4,
      unitPrice: 0.50,
      total: totalShelves * 4 * 0.50
    }
  };

  // Calculate totals
  const materialTotal = materials.reduce((sum, m) => {
    m.subtotal = m.sheets * m.pricePerSheet;
    return sum + m.subtotal;
  }, 0);

  const professionalDoorsDrawersTotal = Object.values(professionalDoorsDrawers).reduce(
    (sum, item) => sum + item.total, 0
  );

  const hardwareTotal = Object.values(hardware).reduce(
    (sum, item) => sum + item.total, 0
  );

  const grandTotal = materialTotal + professionalDoorsDrawersTotal + hardwareTotal;
  const budget = configuration.budget || 5000;

  return {
    id: Date.now(),
    name: buildName,
    character: `${configuration.width}x${configuration.height}x${configuration.depth}mm, ${configuration.numCarcasses} carcasses`,
    image: '/placeholder-wardrobe.png',
    furnitureType: 'wardrobe',
    budget,
    configuration, // Store the full configuration
    costs: {
      materials,
      materialTotal,
      professionalDoorsDrawers,
      professionalDoorsDrawersTotal,
      hardware,
      hardwareTotal,
      extras: [],
      extrasTotal: 0,
      grandTotal,
      savingsVsBudget: budget - grandTotal
    }
  };
}
