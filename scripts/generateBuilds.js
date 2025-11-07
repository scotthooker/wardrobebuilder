import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get material option
function getMaterialOption(materialName, thickness) {
  const materials = {
    'Moisture Resistant MDF': {
      '18mm': { material: 'Moisture Resistant MDF', thickness: '18mm', thicknessNum: 18, price: 50.80, sku: '3901289006312' },
      '15mm': { material: 'Moisture Resistant MDF', thickness: '15mm', thicknessNum: 15, price: 49.20, sku: '3901289006311' },
      '12mm': { material: 'Moisture Resistant MDF', thickness: '12mm', thicknessNum: 12, price: 44.82, sku: '3901289006310' }
    },
    'Premium Quality MDF': {
      '18mm': { material: 'Premium Quality MDF', thickness: '18mm', thicknessNum: 18, price: 46.81, sku: '3901289006306' },
      '15mm': { material: 'Premium Quality MDF', thickness: '15mm', thicknessNum: 15, price: 41.03, sku: '3901289006305' },
      '12mm': { material: 'Premium Quality MDF', thickness: '12mm', thicknessNum: 12, price: 37.45, sku: '3901289006304' }
    },
    'WBP Birch Plywood BB/BB': {
      '18mm': { material: 'WBP Birch Plywood BB/BB', thickness: '18mm', thicknessNum: 18, price: 89.70, sku: '3901289006344' },
      '12mm': { material: 'WBP Birch Plywood BB/BB', thickness: '12mm', thicknessNum: 12, price: 59.80, sku: '3901289006342' },
      '9mm': { material: 'WBP Birch Plywood BB/BB', thickness: '9mm', thicknessNum: 9, price: 44.85, sku: '3901289006341' }
    },
    'WBP Birch Plywood B/BB': {
      '18mm': { material: 'WBP Birch Plywood B/BB', thickness: '18mm', thicknessNum: 18, price: 74.75, sku: '3901289006347' },
      '12mm': { material: 'WBP Birch Plywood B/BB', thickness: '12mm', thicknessNum: 12, price: 49.83, sku: '3901289006345' },
      '9mm': { material: 'WBP Birch Plywood B/BB', thickness: '9mm', thicknessNum: 9, price: 37.38, sku: '3901289006348' }
    },
    'Black Textured Melamine MDF': {
      '18mm': { material: 'Black Textured Melamine MDF', thickness: '18mm', thicknessNum: 18, price: 79.74, sku: '3901289006335' },
      '15mm': { material: 'Black Textured Melamine MDF', thickness: '15mm', thicknessNum: 15, price: 68.80, sku: '3901289006334' }
    },
    'White Melamine Faced MDF': {
      '18mm': { material: 'White Melamine Faced MDF', thickness: '18mm', thicknessNum: 18, price: 69.78, sku: '3901289006337' },
      '15mm': { material: 'White Melamine Faced MDF', thickness: '15mm', thicknessNum: 15, price: 60.15, sku: '3901289006336' }
    }
  };

  return materials[materialName]?.[thickness] || materials['Moisture Resistant MDF']['18mm'];
}

// Build templates
const builds = [
  {
    id: 1,
    name: "The Ultimate Premium Build",
    character: "Luxury boutique joinery with real wood warmth and painted elegance",
    width: 2400,
    height: 2400,
    depth: 600,
    sections: [
      {
        id: 0,
        width: 800,
        carcasses: [
          {
            id: 0,
            height: 1200,
            width: 800,
            material: getMaterialOption('WBP Birch Plywood BB/BB', '18mm'),
            interiorSections: [
              { id: 0, type: 'rail', height: 1200 }
            ]
          },
          {
            id: 1,
            height: 1200,
            width: 800,
            material: getMaterialOption('WBP Birch Plywood BB/BB', '18mm'),
            interiorSections: [
              { id: 0, type: 'drawers', height: 600, drawers: 3, isExternal: true },
              { id: 1, type: 'shelves', height: 600, shelfCount: 3 }
            ]
          }
        ]
      },
      {
        id: 1,
        width: 800,
        carcasses: [
          {
            id: 0,
            height: 2400,
            width: 800,
            material: getMaterialOption('WBP Birch Plywood BB/BB', '18mm'),
            interiorSections: [
              { id: 0, type: 'double_rail', height: 2400 }
            ]
          }
        ]
      },
      {
        id: 2,
        width: 800,
        carcasses: [
          {
            id: 0,
            height: 1200,
            width: 800,
            material: getMaterialOption('WBP Birch Plywood BB/BB', '18mm'),
            interiorSections: [
              { id: 0, type: 'shelves', height: 1200, shelfCount: 5 }
            ]
          },
          {
            id: 1,
            height: 1200,
            width: 800,
            material: getMaterialOption('WBP Birch Plywood BB/BB', '18mm'),
            interiorSections: [
              { id: 0, type: 'drawers', height: 1200, drawers: 6, isExternal: false }
            ]
          }
        ]
      }
    ],
    doors: {
      style: 'hinged',
      sectionConfigs: {
        0: {
          zones: [
            { id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 },
            { id: 1, startCarcass: 1, endCarcass: 1, doorCount: 0 }
          ]
        },
        1: {
          zones: [
            { id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 }
          ]
        },
        2: {
          zones: [
            { id: 0, startCarcass: 0, endCarcass: 1, doorCount: 1 }
          ]
        }
      }
    }
  },
  {
    id: 2,
    name: "Modern Minimalist",
    character: "Clean lines with white melamine and efficient storage",
    width: 2000,
    height: 2200,
    depth: 600,
    sections: [
      {
        id: 0,
        width: 1000,
        carcasses: [
          {
            id: 0,
            height: 2200,
            width: 1000,
            material: getMaterialOption('White Melamine Faced MDF', '18mm'),
            interiorSections: [
              { id: 0, type: 'rail', height: 2200 }
            ]
          }
        ]
      },
      {
        id: 1,
        width: 1000,
        carcasses: [
          {
            id: 0,
            height: 1100,
            width: 1000,
            material: getMaterialOption('White Melamine Faced MDF', '18mm'),
            interiorSections: [
              { id: 0, type: 'shelves', height: 1100, shelfCount: 5 }
            ]
          },
          {
            id: 1,
            height: 1100,
            width: 1000,
            material: getMaterialOption('White Melamine Faced MDF', '18mm'),
            interiorSections: [
              { id: 0, type: 'drawers', height: 1100, drawers: 5, isExternal: true }
            ]
          }
        ]
      }
    ],
    doors: {
      style: 'sliding',
      sectionConfigs: {
        0: { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 }] },
        1: { zones: [
          { id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 },
          { id: 1, startCarcass: 1, endCarcass: 1, doorCount: 0 }
        ]}
      }
    }
  },
  {
    id: 3,
    name: "Smart Storage Essential",
    character: "MDF construction with smart storage solutions",
    width: 1800,
    height: 2000,
    depth: 550,
    sections: [
      {
        id: 0,
        width: 900,
        carcasses: [
          {
            id: 0,
            height: 2000,
            width: 900,
            material: getMaterialOption('Premium Quality MDF', '18mm'),
            interiorSections: [
              { id: 0, type: 'rail', height: 2000 }
            ]
          }
        ]
      },
      {
        id: 1,
        width: 900,
        carcasses: [
          {
            id: 0,
            height: 2000,
            width: 900,
            material: getMaterialOption('Premium Quality MDF', '18mm'),
            interiorSections: [
              { id: 0, type: 'shelves', height: 1000, shelfCount: 4 },
              { id: 1, type: 'drawers', height: 1000, drawers: 4, isExternal: false }
            ]
          }
        ]
      }
    ],
    doors: {
      style: 'hinged',
      sectionConfigs: {
        0: { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 }] },
        1: { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 }] }
      }
    }
  },
  {
    id: 4,
    name: "Walk-In Closet System",
    character: "Open wardrobe with maximum accessibility and display",
    width: 3000,
    height: 2400,
    depth: 600,
    sections: [
      {
        id: 0,
        width: 750,
        carcasses: [
          {
            id: 0,
            height: 1200,
            width: 750,
            material: getMaterialOption('Moisture Resistant MDF', '18mm'),
            interiorSections: [
              { id: 0, type: 'rail', height: 1200 }
            ]
          },
          {
            id: 1,
            height: 1200,
            width: 750,
            material: getMaterialOption('Moisture Resistant MDF', '18mm'),
            interiorSections: [
              { id: 0, type: 'shelves', height: 1200, shelfCount: 5 }
            ]
          }
        ]
      },
      {
        id: 1,
        width: 750,
        carcasses: [
          {
            id: 0,
            height: 2400,
            width: 750,
            material: getMaterialOption('Moisture Resistant MDF', '18mm'),
            interiorSections: [
              { id: 0, type: 'double_rail', height: 2400 }
            ]
          }
        ]
      },
      {
        id: 2,
        width: 750,
        carcasses: [
          {
            id: 0,
            height: 1200,
            width: 750,
            material: getMaterialOption('Moisture Resistant MDF', '18mm'),
            interiorSections: [
              { id: 0, type: 'drawers', height: 1200, drawers: 6, isExternal: false }
            ]
          },
          {
            id: 1,
            height: 1200,
            width: 750,
            material: getMaterialOption('Moisture Resistant MDF', '18mm'),
            interiorSections: [
              { id: 0, type: 'shelves', height: 1200, shelfCount: 5 }
            ]
          }
        ]
      },
      {
        id: 3,
        width: 750,
        carcasses: [
          {
            id: 0,
            height: 2400,
            width: 750,
            material: getMaterialOption('Moisture Resistant MDF', '18mm'),
            interiorSections: [
              { id: 0, type: 'rail', height: 2400 }
            ]
          }
        ]
      }
    ],
    doors: {
      style: 'none',
      sectionConfigs: {}
    }
  },
  {
    id: 5,
    name: "Compact Studio Solution",
    character: "Space-efficient design perfect for small apartments",
    width: 1500,
    height: 2200,
    depth: 500,
    sections: [
      {
        id: 0,
        width: 750,
        carcasses: [
          {
            id: 0,
            height: 1100,
            width: 750,
            material: getMaterialOption('White Melamine Faced MDF', '15mm'),
            interiorSections: [
              { id: 0, type: 'rail', height: 1100 }
            ]
          },
          {
            id: 1,
            height: 1100,
            width: 750,
            material: getMaterialOption('White Melamine Faced MDF', '15mm'),
            interiorSections: [
              { id: 0, type: 'drawers', height: 550, drawers: 3, isExternal: true },
              { id: 1, type: 'shelves', height: 550, shelfCount: 3 }
            ]
          }
        ]
      },
      {
        id: 1,
        width: 750,
        carcasses: [
          {
            id: 0,
            height: 2200,
            width: 750,
            material: getMaterialOption('White Melamine Faced MDF', '15mm'),
            interiorSections: [
              { id: 0, type: 'shelves', height: 2200, shelfCount: 8 }
            ]
          }
        ]
      }
    ],
    doors: {
      style: 'sliding',
      sectionConfigs: {
        0: { zones: [
          { id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 },
          { id: 1, startCarcass: 1, endCarcass: 1, doorCount: 0 }
        ]},
        1: { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 }] }
      }
    }
  },
  {
    id: 6,
    name: "Industrial Chic",
    character: "Black melamine with metal accents and bold design",
    width: 2200,
    height: 2300,
    depth: 600,
    sections: [
      {
        id: 0,
        width: 1100,
        carcasses: [
          {
            id: 0,
            height: 2300,
            width: 1100,
            material: getMaterialOption('Black Textured Melamine MDF', '18mm'),
            interiorSections: [
              { id: 0, type: 'double_rail', height: 2300 }
            ]
          }
        ]
      },
      {
        id: 1,
        width: 1100,
        carcasses: [
          {
            id: 0,
            height: 1150,
            width: 1100,
            material: getMaterialOption('Black Textured Melamine MDF', '18mm'),
            interiorSections: [
              { id: 0, type: 'shelves', height: 1150, shelfCount: 5 }
            ]
          },
          {
            id: 1,
            height: 1150,
            width: 1100,
            material: getMaterialOption('Black Textured Melamine MDF', '18mm'),
            interiorSections: [
              { id: 0, type: 'drawers', height: 1150, drawers: 5, isExternal: true }
            ]
          }
        ]
      }
    ],
    doors: {
      style: 'hinged',
      sectionConfigs: {
        0: { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 2 }] },
        1: { zones: [
          { id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 },
          { id: 1, startCarcass: 1, endCarcass: 1, doorCount: 0 }
        ]}
      }
    }
  },
  {
    id: 7,
    name: "Kids Room Special",
    character: "Lower hanging rails and accessible storage for children",
    width: 1800,
    height: 1800,
    depth: 500,
    sections: [
      {
        id: 0,
        width: 900,
        carcasses: [
          {
            id: 0,
            height: 900,
            width: 900,
            material: getMaterialOption('Premium Quality MDF', '15mm'),
            interiorSections: [
              { id: 0, type: 'rail', height: 900 }
            ]
          },
          {
            id: 1,
            height: 900,
            width: 900,
            material: getMaterialOption('Premium Quality MDF', '15mm'),
            interiorSections: [
              { id: 0, type: 'shelves', height: 900, shelfCount: 4 }
            ]
          }
        ]
      },
      {
        id: 1,
        width: 900,
        carcasses: [
          {
            id: 0,
            height: 1800,
            width: 900,
            material: getMaterialOption('Premium Quality MDF', '15mm'),
            interiorSections: [
              { id: 0, type: 'drawers', height: 600, drawers: 3, isExternal: true },
              { id: 1, type: 'shelves', height: 600, shelfCount: 3 },
              { id: 2, type: 'shelves', height: 600, shelfCount: 3 }
            ]
          }
        ]
      }
    ],
    doors: {
      style: 'hinged',
      sectionConfigs: {
        0: { zones: [{ id: 0, startCarcass: 0, endCarcass: 1, doorCount: 1 }] },
        1: { zones: [
          { id: 0, startCarcass: 0, endCarcass: 0, doorCount: 0 }
        ]}
      }
    }
  },
  {
    id: 8,
    name: "Master Bedroom Suite",
    character: "Spacious premium storage with plywood construction",
    width: 2800,
    height: 2400,
    depth: 650,
    sections: [
      {
        id: 0,
        width: 700,
        carcasses: [
          {
            id: 0,
            height: 1200,
            width: 700,
            material: getMaterialOption('WBP Birch Plywood B/BB', '18mm'),
            interiorSections: [
              { id: 0, type: 'rail', height: 1200 }
            ]
          },
          {
            id: 1,
            height: 1200,
            width: 700,
            material: getMaterialOption('WBP Birch Plywood B/BB', '18mm'),
            interiorSections: [
              { id: 0, type: 'drawers', height: 600, drawers: 3, isExternal: true },
              { id: 1, type: 'shelves', height: 600, shelfCount: 3 }
            ]
          }
        ]
      },
      {
        id: 1,
        width: 700,
        carcasses: [
          {
            id: 0,
            height: 2400,
            width: 700,
            material: getMaterialOption('WBP Birch Plywood B/BB', '18mm'),
            interiorSections: [
              { id: 0, type: 'double_rail', height: 2400 }
            ]
          }
        ]
      },
      {
        id: 2,
        width: 700,
        carcasses: [
          {
            id: 0,
            height: 1200,
            width: 700,
            material: getMaterialOption('WBP Birch Plywood B/BB', '18mm'),
            interiorSections: [
              { id: 0, type: 'shelves', height: 1200, shelfCount: 5 }
            ]
          },
          {
            id: 1,
            height: 1200,
            width: 700,
            material: getMaterialOption('WBP Birch Plywood B/BB', '18mm'),
            interiorSections: [
              { id: 0, type: 'drawers', height: 1200, drawers: 6, isExternal: false }
            ]
          }
        ]
      },
      {
        id: 3,
        width: 700,
        carcasses: [
          {
            id: 0,
            height: 2400,
            width: 700,
            material: getMaterialOption('WBP Birch Plywood B/BB', '18mm'),
            interiorSections: [
              { id: 0, type: 'rail', height: 2400 }
            ]
          }
        ]
      }
    ],
    doors: {
      style: 'hinged',
      sectionConfigs: {
        0: { zones: [
          { id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 },
          { id: 1, startCarcass: 1, endCarcass: 1, doorCount: 0 }
        ]},
        1: { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 }] },
        2: { zones: [{ id: 0, startCarcass: 0, endCarcass: 1, doorCount: 1 }] },
        3: { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 }] }
      }
    }
  },
  {
    id: 9,
    name: "Narrow Hallway Solution",
    character: "Slim depth design for tight spaces",
    width: 2000,
    height: 2400,
    depth: 450,
    sections: [
      {
        id: 0,
        width: 1000,
        carcasses: [
          {
            id: 0,
            height: 2400,
            width: 1000,
            material: getMaterialOption('Moisture Resistant MDF', '15mm'),
            interiorSections: [
              { id: 0, type: 'rail', height: 2400 }
            ]
          }
        ]
      },
      {
        id: 1,
        width: 1000,
        carcasses: [
          {
            id: 0,
            height: 1200,
            width: 1000,
            material: getMaterialOption('Moisture Resistant MDF', '15mm'),
            interiorSections: [
              { id: 0, type: 'shelves', height: 1200, shelfCount: 6 }
            ]
          },
          {
            id: 1,
            height: 1200,
            width: 1000,
            material: getMaterialOption('Moisture Resistant MDF', '15mm'),
            interiorSections: [
              { id: 0, type: 'drawers', height: 1200, drawers: 6, isExternal: true }
            ]
          }
        ]
      }
    ],
    doors: {
      style: 'sliding',
      sectionConfigs: {
        0: { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 }] },
        1: { zones: [
          { id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 },
          { id: 1, startCarcass: 1, endCarcass: 1, doorCount: 0 }
        ]}
      }
    }
  },
  {
    id: 10,
    name: "Guest Room Classic",
    character: "Traditional wardrobe with balanced storage",
    width: 2000,
    height: 2200,
    depth: 600,
    sections: [
      {
        id: 0,
        width: 1000,
        carcasses: [
          {
            id: 0,
            height: 1100,
            width: 1000,
            material: getMaterialOption('Moisture Resistant MDF', '18mm'),
            interiorSections: [
              { id: 0, type: 'rail', height: 1100 }
            ]
          },
          {
            id: 1,
            height: 1100,
            width: 1000,
            material: getMaterialOption('Moisture Resistant MDF', '18mm'),
            interiorSections: [
              { id: 0, type: 'shelves', height: 1100, shelfCount: 5 }
            ]
          }
        ]
      },
      {
        id: 1,
        width: 1000,
        carcasses: [
          {
            id: 0,
            height: 2200,
            width: 1000,
            material: getMaterialOption('Moisture Resistant MDF', '18mm'),
            interiorSections: [
              { id: 0, type: 'drawers', height: 1100, drawers: 5, isExternal: false },
              { id: 1, type: 'shelves', height: 1100, shelfCount: 5 }
            ]
          }
        ]
      }
    ],
    doors: {
      style: 'hinged',
      sectionConfigs: {
        0: { zones: [{ id: 0, startCarcass: 0, endCarcass: 1, doorCount: 1 }] },
        1: { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 }] }
      }
    }
  },
  {
    id: 11,
    name: "Eco-Friendly Sustainable",
    character: "Sustainable MDF with efficient use of materials",
    width: 1600,
    height: 2000,
    depth: 550,
    sections: [
      {
        id: 0,
        width: 800,
        carcasses: [
          {
            id: 0,
            height: 2000,
            width: 800,
            material: getMaterialOption('Premium Quality MDF', '15mm'),
            interiorSections: [
              { id: 0, type: 'rail', height: 2000 }
            ]
          }
        ]
      },
      {
        id: 1,
        width: 800,
        carcasses: [
          {
            id: 0,
            height: 1000,
            width: 800,
            material: getMaterialOption('Premium Quality MDF', '15mm'),
            interiorSections: [
              { id: 0, type: 'shelves', height: 1000, shelfCount: 4 }
            ]
          },
          {
            id: 1,
            height: 1000,
            width: 800,
            material: getMaterialOption('Premium Quality MDF', '15mm'),
            interiorSections: [
              { id: 0, type: 'drawers', height: 1000, drawers: 5, isExternal: true }
            ]
          }
        ]
      }
    ],
    doors: {
      style: 'hinged',
      sectionConfigs: {
        0: { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 }] },
        1: { zones: [
          { id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 },
          { id: 1, startCarcass: 1, endCarcass: 1, doorCount: 0 }
        ]}
      }
    }
  }
];

// Save builds
const buildsDir = path.join(__dirname, '..', 'public', 'data', 'builds');
if (!fs.existsSync(buildsDir)) {
  fs.mkdirSync(buildsDir, { recursive: true });
}

builds.forEach(build => {
  const filename = `build-${String(build.id).padStart(2, '0')}.json`;
  const filepath = path.join(buildsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(build, null, 2));
  console.log(`✅ Generated ${filename}`);
});

console.log(`\n✅ All ${builds.length} builds generated successfully!`);
