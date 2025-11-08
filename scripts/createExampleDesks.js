import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3001';

const exampleDesks = [
  {
    name: 'Executive Office Desk',
    character: 'Premium L-shaped desk with extensive storage for executive offices',
    furnitureType: 'desk',
    width: 1800,
    height: 750,
    depth: 800,
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
    },
    costs: {},
    hardware: [],
    extras: {}
  },
  {
    name: 'Home Office Compact',
    character: 'Simple straight desk perfect for small home offices',
    furnitureType: 'desk',
    width: 1200,
    height: 740,
    depth: 600,
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
        cable_management: true
      }
    },
    costs: {},
    hardware: [],
    extras: {}
  },
  {
    name: 'Creative Workspace',
    character: 'Spacious U-shaped desk for creative professionals with multiple monitors',
    furnitureType: 'desk',
    width: 2400,
    height: 760,
    depth: 750,
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
        monitor_arm: true,
        desk_lamp: true
      }
    },
    costs: {},
    hardware: [],
    extras: {}
  },
  {
    name: 'Standing Desk Setup',
    character: 'Modern straight desk with trestle base for standing desk conversion',
    furnitureType: 'desk',
    width: 1600,
    height: 1100,
    depth: 700,
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
    },
    costs: {},
    hardware: [],
    extras: {}
  },
  {
    name: 'Gaming Command Center',
    character: 'L-shaped gaming desk with RGB lighting and extensive cable management',
    furnitureType: 'desk',
    width: 2000,
    height: 750,
    depth: 800,
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
    },
    costs: {},
    hardware: [],
    extras: {}
  }
];

async function createExampleDesks() {
  console.log('🚀 Creating example desk builds...\n');

  for (const desk of exampleDesks) {
    try {
      console.log(`📝 Creating: ${desk.name}`);

      const response = await fetch(`${API_URL}/api/builds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(desk),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create ${desk.name}: ${error}`);
      }

      const savedDesk = await response.json();
      console.log(`   ✅ Created desk ID: ${savedDesk.id}`);
    } catch (error) {
      console.error(`   ❌ Error creating ${desk.name}:`, error.message);
    }
  }

  console.log('\n✅ Example desk builds created successfully!');
}

createExampleDesks().catch(console.error);
