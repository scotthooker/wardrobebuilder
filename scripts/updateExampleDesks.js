import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3001';

// Desk cost calculation helper
function calculateDeskCosts(config) {
  const costs = {
    materials: [],
    materialTotal: 0,
    hardware: [],
    hardwareTotal: 0,
    accessories: [],
    accessoriesTotal: 0
  };

  // 1. Desktop material
  let area = (config.width * config.depth) / 1_000_000;
  if (config.deskShape === 'l_shaped') area *= 1.5;
  else if (config.deskShape === 'u_shaped') area *= 2.0;

  const sheetArea = 2.98;
  const desktopSheets = Math.ceil(area / sheetArea);
  const desktopCost = desktopSheets * 60;

  costs.materials.push({
    component: 'Desktop',
    material: 'Oak Veneered MDF',
    thickness: '25mm',
    sheets: desktopSheets,
    pricePerSheet: 60,
    subtotal: desktopCost
  });
  costs.materialTotal += desktopCost;

  // 2. Base material (pedestals/panels)
  if (config.base.type === 'pedestals' || config.base.type === 'panel_sides') {
    let baseSheets = 0;
    if (config.base.left?.enabled) baseSheets += 2;
    if (config.base.right?.enabled) baseSheets += 2;

    if (baseSheets > 0) {
      const baseCost = baseSheets * 50.8;
      costs.materials.push({
        component: config.base.type === 'pedestals' ? 'Pedestal Carcasses' : 'Panel Sides',
        material: 'Moisture Resistant MDF',
        thickness: '18mm',
        sheets: baseSheets,
        pricePerSheet: 50.8,
        subtotal: baseCost
      });
      costs.materialTotal += baseCost;
    }
  }

  // 3. Overhead storage
  if (config.overhead?.enabled) {
    const overheadSheets = config.overhead.type === 'hutch' ? 3 : 2;
    const overheadCost = overheadSheets * 50.8;
    costs.materials.push({
      component: 'Overhead Storage',
      material: 'Moisture Resistant MDF',
      thickness: '18mm',
      sheets: overheadSheets,
      pricePerSheet: 50.8,
      subtotal: overheadCost
    });
    costs.materialTotal += overheadCost;
  }

  // 4. Hardware
  const hardware = [];

  // Legs/trestle
  if (config.base.type === 'legs') {
    hardware.push({ name: 'Adjustable desk legs', qty: 4, unitPrice: 25, total: 100 });
  } else if (config.base.type === 'trestle') {
    hardware.push({ name: 'Trestle legs', qty: 2, unitPrice: 45, total: 90 });
  }

  // Drawer slides for pedestals
  if (config.base.type === 'pedestals') {
    const pedestalCount = (config.base.left?.enabled ? 1 : 0) + (config.base.right?.enabled ? 1 : 0);
    if (pedestalCount > 0) {
      const drawerSlides = pedestalCount * 9; // 3 drawers per pedestal
      hardware.push({ name: 'Soft-close drawer slides 500mm', qty: drawerSlides, unitPrice: 35, total: drawerSlides * 35 });
    }
  }

  // Overhead hinges
  if (config.overhead?.enabled && config.overhead.type !== 'open_shelving') {
    hardware.push({ name: 'Soft-close hinges (Blum/Häfele)', qty: 8, unitPrice: 8, total: 64 });
  }

  hardware.push({ name: 'Wood glue, screws, fixings', qty: 1, unitPrice: 40, total: 40 });

  costs.hardware = hardware;
  costs.hardwareTotal = hardware.reduce((sum, item) => sum + item.total, 0);

  // 5. Accessories
  const accessoryPrices = {
    keyboard_tray: 45,
    cable_management: 25,
    cable_tray: 30,
    monitor_arm: 85,
    cpu_holder: 35,
    desk_lamp: 65
  };

  for (const [key, enabled] of Object.entries(config.accessories || {})) {
    if (enabled && accessoryPrices[key]) {
      const name = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      costs.accessories.push({
        name: name,
        qty: 1,
        unitPrice: accessoryPrices[key],
        total: accessoryPrices[key]
      });
      costs.accessoriesTotal += accessoryPrices[key];
    }
  }

  costs.grandTotal = costs.materialTotal + costs.hardwareTotal + costs.accessoriesTotal;
  costs.savingsVsBudget = 5000 - costs.grandTotal;
  costs.savingsPercent = ((costs.savingsVsBudget / 5000) * 100).toFixed(1);

  return costs;
}

// Define comprehensive desk configurations
const deskConfigurations = [
  {
    name: 'Executive L-Shaped Desk',
    character: 'Premium L-shaped desk with dual pedestals and overhead hutch for executive offices',
    configuration: {
      furnitureType: 'desk',
      deskShape: 'l_shaped',
      width: 1800,
      height: 750,
      depth: 800,
      base: {
        type: 'pedestals',
        left: { enabled: true, width: 450 },
        right: { enabled: true, width: 450 }
      },
      overhead: {
        enabled: true,
        type: 'hutch',
        height: 600
      },
      accessories: {
        keyboard_tray: true,
        cable_management: true,
        monitor_arm: true,
        cpu_holder: true
      }
    }
  },
  {
    name: 'Compact Home Office',
    character: 'Simple straight desk with adjustable legs, perfect for small home offices and apartments',
    configuration: {
      furnitureType: 'desk',
      deskShape: 'straight',
      width: 1200,
      height: 740,
      depth: 600,
      base: {
        type: 'legs',
        left: { enabled: false, width: 0 },
        right: { enabled: false, width: 0 }
      },
      overhead: {
        enabled: false,
        type: 'hutch',
        height: 0
      },
      accessories: {
        cable_management: true,
        desk_lamp: true
      }
    }
  },
  {
    name: 'Creative U-Shaped Studio',
    character: 'Spacious U-shaped desk with panel sides and open shelving for creative professionals',
    configuration: {
      furnitureType: 'desk',
      deskShape: 'u_shaped',
      width: 2400,
      height: 760,
      depth: 750,
      base: {
        type: 'panel_sides',
        left: { enabled: true, width: 600 },
        right: { enabled: true, width: 600 }
      },
      overhead: {
        enabled: true,
        type: 'open_shelving',
        height: 500
      },
      accessories: {
        cable_management: true,
        cable_tray: true,
        monitor_arm: true,
        desk_lamp: true
      }
    }
  },
  {
    name: 'Standing Desk Pro',
    character: 'Modern straight desk with trestle base, ideal for standing desk conversion',
    configuration: {
      furnitureType: 'desk',
      deskShape: 'straight',
      width: 1600,
      height: 1100,
      depth: 700,
      base: {
        type: 'trestle',
        left: { enabled: false, width: 0 },
        right: { enabled: false, width: 0 }
      },
      overhead: {
        enabled: false,
        type: 'hutch',
        height: 0
      },
      accessories: {
        cable_management: true,
        monitor_arm: true
      }
    }
  },
  {
    name: 'Gaming Command Center',
    character: 'L-shaped gaming desk with left pedestal, open shelving, and extensive cable management',
    configuration: {
      furnitureType: 'desk',
      deskShape: 'l_shaped',
      width: 2000,
      height: 750,
      depth: 800,
      base: {
        type: 'pedestals',
        left: { enabled: true, width: 400 },
        right: { enabled: false, width: 0 }
      },
      overhead: {
        enabled: true,
        type: 'open_shelving',
        height: 450
      },
      accessories: {
        cable_management: true,
        cable_tray: true,
        monitor_arm: true,
        cpu_holder: true,
        desk_lamp: true
      }
    }
  },
  {
    name: 'Minimalist Workspace',
    character: 'Clean straight desk with panel sides for a minimalist aesthetic',
    configuration: {
      furnitureType: 'desk',
      deskShape: 'straight',
      width: 1400,
      height: 740,
      depth: 650,
      base: {
        type: 'panel_sides',
        left: { enabled: true, width: 650 },
        right: { enabled: true, width: 650 }
      },
      overhead: {
        enabled: false,
        type: 'hutch',
        height: 0
      },
      accessories: {
        cable_management: true
      }
    }
  },
  {
    name: 'Professional Corner Desk',
    character: 'L-shaped desk with dual pedestals and closed overhead cabinets for privacy',
    configuration: {
      furnitureType: 'desk',
      deskShape: 'l_shaped',
      width: 1600,
      height: 750,
      depth: 700,
      base: {
        type: 'pedestals',
        left: { enabled: true, width: 400 },
        right: { enabled: true, width: 400 }
      },
      overhead: {
        enabled: true,
        type: 'closed_cabinets',
        height: 550
      },
      accessories: {
        keyboard_tray: true,
        cable_management: true,
        monitor_arm: true
      }
    }
  }
];

async function deleteExistingDesks() {
  console.log('🗑️  Deleting existing example desks...\n');

  try {
    const response = await fetch(`${API_URL}/api/builds`);
    const builds = await response.json();
    const desks = builds.filter(b => b.furnitureType === 'desk');

    console.log(`Found ${desks.length} desk builds to delete`);

    for (const desk of desks) {
      try {
        const deleteResponse = await fetch(`${API_URL}/api/builds/${desk.id}`, {
          method: 'DELETE'
        });

        if (deleteResponse.ok) {
          console.log(`   ✅ Deleted desk ID ${desk.id}: ${desk.name}`);
        }
      } catch (error) {
        console.error(`   ❌ Error deleting desk ${desk.id}:`, error.message);
      }
    }

    console.log('');
  } catch (error) {
    console.error('Error fetching builds:', error.message);
  }
}

async function createExampleDesks() {
  console.log('🚀 Creating updated example desk builds...\n');

  for (const deskConfig of deskConfigurations) {
    try {
      console.log(`📝 Creating: ${deskConfig.name}`);

      const costs = calculateDeskCosts(deskConfig.configuration);

      const buildPayload = {
        name: deskConfig.name,
        character: deskConfig.character,
        image: null,
        furnitureType: 'desk',
        width: deskConfig.configuration.width,
        height: deskConfig.configuration.height,
        depth: deskConfig.configuration.depth,
        configuration: deskConfig.configuration,
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
          savingsVsBudget: costs.savingsVsBudget,
          savingsPercent: costs.savingsPercent
        },
        hardware: costs.hardware,
        extras: costs.accessories
      };

      console.log(`   💰 Total cost: £${costs.grandTotal.toFixed(2)}`);
      console.log(`   💵 Savings: £${costs.savingsVsBudget.toFixed(2)} (${costs.savingsPercent}% under budget)`);

      const response = await fetch(`${API_URL}/api/builds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildPayload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create: ${error}`);
      }

      const savedDesk = await response.json();
      console.log(`   ✅ Created desk ID: ${savedDesk.id}\n`);
    } catch (error) {
      console.error(`   ❌ Error creating ${deskConfig.name}:`, error.message);
      console.log('');
    }
  }

  console.log('✅ Example desk builds updated successfully!');
}

async function main() {
  await deleteExistingDesks();
  await createExampleDesks();
}

main().catch(console.error);
