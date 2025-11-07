import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pg from 'pg';
const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://wardrobe_user:wardrobe_password@localhost:5432/wardrobe_builder',
});

// Build metadata - combining original names with descriptions
const BUILD_METADATA = {
  1: {
    name: 'The Ultimate Premium Build',
    character: 'Luxury boutique joinery with real wood warmth and painted elegance',
    recommendedFor: 'Master bedroom with luxury requirements',
      cutting: { days: 3, desc: 'Precision cutting all panels and components' },
      assembly: { days: 4, desc: 'Carcass assembly with veneer work' },
      finishing: { days: 3, desc: 'Door installation and final touches' },
      installation: { days: 2, desc: 'Wall mounting and adjustments' }
    }
  },
  2: {
    name: 'Modern Minimalist',
    character: 'Clean lines with white melamine and efficient storage',
    recommendedFor: 'Contemporary spaces prioritizing simplicity',
      cutting: { days: 2, desc: 'Cutting all components' },
      assembly: { days: 3, desc: 'Carcass construction' },
      finishing: { days: 2, desc: 'Door installation' },
      installation: { days: 1, desc: 'Wall mounting' }
    }
  },
  3: {
    name: 'Smart Storage Essential',
    character: 'MDF construction with smart storage solutions',
    recommendedFor: 'Budget-conscious builds with maximum functionality',
      cutting: { days: 2, desc: 'Panel cutting' },
      assembly: { days: 3, desc: 'Assembly with edge banding' },
      finishing: { days: 2, desc: 'Finishing touches' },
      installation: { days: 1, desc: 'Installation' }
    }
  },
  4: {
    name: 'Walk-In Closet System',
    character: 'Open wardrobe with maximum accessibility and display storage',
    recommendedFor: 'Spacious rooms with walk-in closet space',
      cutting: { days: 2, desc: 'Cutting all panels' },
      assembly: { days: 2, desc: 'Open system assembly' },
      finishing: { days: 1, desc: 'Final assembly' },
      installation: { days: 1, desc: 'Wall mounting' }
    }
  },
  5: {
    name: 'Compact Studio Solution',
    character: 'Space-efficient design perfect for small apartments',
    recommendedFor: 'Studio apartments and compact bedrooms',
      cutting: { days: 2, desc: 'Precision cutting' },
      assembly: { days: 2, desc: 'Compact assembly' },
      finishing: { days: 1, desc: 'Finishing' },
      installation: { days: 1, desc: 'Installation' }
    }
  },
  6: {
    name: 'Industrial Chic',
    character: 'Black melamine with metal accents and bold design',
    recommendedFor: 'Modern industrial-style interiors',
      cutting: { days: 2, desc: 'Panel cutting' },
      assembly: { days: 3, desc: 'Industrial assembly' },
      finishing: { days: 2, desc: 'Metal hardware installation' },
      installation: { days: 1, desc: 'Mounting' }
    }
  },
  7: {
    name: 'Kids Room Special',
    character: 'Lower hanging rails and accessible storage for children',
    recommendedFor: 'Children\'s bedrooms with safety considerations',
      cutting: { days: 2, desc: 'Panel preparation' },
      assembly: { days: 3, desc: 'Assembly with veneer' },
      finishing: { days: 2, desc: 'Safety hardware installation' },
      installation: { days: 1, desc: 'Secure mounting' }
    }
  },
  8: {
    name: 'Master Bedroom Suite',
    character: 'Traditional wardrobe with balanced storage and elegant details',
    recommendedFor: 'Traditional master bedrooms requiring premium finishes',
      cutting: { days: 3, desc: 'Precision cutting and milling' },
      assembly: { days: 4, desc: 'Complex assembly with veneer' },
      finishing: { days: 3, desc: 'Hand oiling and finishing' },
      installation: { days: 2, desc: 'Professional installation' }
    }
  },
  9: {
    name: 'Narrow Hallway Solution',
    character: 'Slim depth design for tight spaces without compromising storage',
    recommendedFor: 'Hallways and narrow spaces',
      cutting: { days: 2, desc: 'Precise cutting for plywood' },
      assembly: { days: 3, desc: 'Slim assembly' },
      finishing: { days: 2, desc: 'Lacquer finishing' },
      installation: { days: 1, desc: 'Wall mounting' }
    }
  },
  10: {
    name: 'Guest Room Classic',
    character: 'Spacious premium storage with plywood construction',
    recommendedFor: 'Guest rooms requiring durable storage',
      cutting: { days: 2, desc: 'Plywood cutting' },
      assembly: { days: 3, desc: 'Sturdy assembly' },
      finishing: { days: 2, desc: 'Lacquer application' },
      installation: { days: 1, desc: 'Installation' }
    }
  },
  11: {
    name: 'Eco-Friendly Sustainable',
    character: 'Sustainable MDF with efficient use of materials',
    recommendedFor: 'Environmentally conscious builds',
      cutting: { days: 2, desc: 'Efficient cutting' },
      assembly: { days: 2, desc: 'Sustainable assembly' },
      finishing: { days: 1, desc: 'Low-VOC finishing' },
      installation: { days: 1, desc: 'Installation' }
    }
  }
};

// Wardrobe configuration designer - creates realistic layouts based on build type
function designWardrobeConfiguration(buildNum, materials) {
  // Standard wardrobe dimensions (3100mm x 2370mm from the app)
  const width = 3100;
  const height = 2370;
  const depth = 600;

  // Get primary carcass material from materials
  const carcassMaterial = materials.find(m => m.Component.includes('carcass'));

  // Material object structure
  const materialObj = {
    material: carcassMaterial.Material,
    thickness: carcassMaterial.Thickness,
    thicknessNum: parseInt(carcassMaterial.Thickness),
    price: parseFloat(carcassMaterial['Price/Sheet (£)']),
    sku: carcassMaterial.SKU
  };

  // Design configurations based on build type
  let configuration;

  switch (buildNum) {
    case 1: // The Ultimate Premium Build - Full luxury with multiple sections
      configuration = {
        width,
        height,
        depth,
        sections: [
          {
            id: 0,
            width: 1033, // 3 equal sections
            carcasses: [
              {
                id: 0,
                height: 2370,
                width: 1033,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'rail', height: 1200 },
                  { id: 1, type: 'shelves', height: 1170, shelfCount: 5 }
                ]
              }
            ]
          },
          {
            id: 1,
            width: 1034,
            carcasses: [
              {
                id: 0,
                height: 1200,
                width: 1034,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'drawers', height: 1200, drawers: 6, isExternal: true }
                ]
              },
              {
                id: 1,
                height: 1170,
                width: 1034,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'shelves', height: 1170, shelfCount: 5 }
                ]
              }
            ]
          },
          {
            id: 2,
            width: 1033,
            carcasses: [
              {
                id: 0,
                height: 2370,
                width: 1033,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'double_rail', height: 2370 }
                ]
              }
            ]
          }
        ],
        doors: {
          style: 'hinged',
          sectionConfigs: {
            "0": { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 2 }] },
            "1": { zones: [{ id: 0, startCarcass: 0, endCarcass: 1, doorCount: 2 }] },
            "2": { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 2 }] }
          }
        }
      };
      break;

    case 2: // Modern Minimalist - Clean 2-section design
      configuration = {
        width,
        height,
        depth,
        sections: [
          {
            id: 0,
            width: 1550,
            carcasses: [
              {
                id: 0,
                height: 2370,
                width: 1550,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'rail', height: 2370 }
                ]
              }
            ]
          },
          {
            id: 1,
            width: 1550,
            carcasses: [
              {
                id: 0,
                height: 1200,
                width: 1550,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'shelves', height: 1200, shelfCount: 6 }
                ]
              },
              {
                id: 1,
                height: 1170,
                width: 1550,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'drawers', height: 1170, drawers: 5, isExternal: true }
                ]
              }
            ]
          }
        ],
        doors: {
          style: 'hinged',
          sectionConfigs: {
            "0": { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 2 }] },
            "1": { zones: [{ id: 0, startCarcass: 0, endCarcass: 1, doorCount: 2 }] }
          }
        }
      };
      break;

    case 3: // Smart Storage Essential - MDF with efficient storage
      configuration = {
        width,
        height,
        depth,
        sections: [
          {
            id: 0,
            width: 1550,
            carcasses: [
              {
                id: 0,
                height: 1200,
                width: 1550,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'rail', height: 1200 }
                ]
              },
              {
                id: 1,
                height: 1170,
                width: 1550,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'shelves', height: 1170, shelfCount: 5 }
                ]
              }
            ]
          },
          {
            id: 1,
            width: 1550,
            carcasses: [
              {
                id: 0,
                height: 2370,
                width: 1550,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'drawers', height: 900, drawers: 4, isExternal: true },
                  { id: 1, type: 'shelves', height: 1470, shelfCount: 6 }
                ]
              }
            ]
          }
        ],
        doors: {
          style: 'hinged',
          sectionConfigs: {
            "0": { zones: [{ id: 0, startCarcass: 0, endCarcass: 1, doorCount: 2 }] },
            "1": { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 2 }] }
          }
        }
      };
      break;

    case 4: // Walk-In Closet System - Open design, no doors
      configuration = {
        width,
        height,
        depth,
        sections: [
          {
            id: 0,
            width: 1033,
            carcasses: [
              {
                id: 0,
                height: 2370,
                width: 1033,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'rail', height: 2370 }
                ]
              }
            ]
          },
          {
            id: 1,
            width: 1034,
            carcasses: [
              {
                id: 0,
                height: 2370,
                width: 1034,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'shelves', height: 2370, shelfCount: 10 }
                ]
              }
            ]
          },
          {
            id: 2,
            width: 1033,
            carcasses: [
              {
                id: 0,
                height: 800,
                width: 1033,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'drawers', height: 800, drawers: 4, isExternal: true }
                ]
              },
              {
                id: 1,
                height: 1570,
                width: 1033,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'rail', height: 1570 }
                ]
              }
            ]
          }
        ],
        doors: {
          style: 'none',
          sectionConfigs: {}
        }
      };
      break;

    case 5: // Compact Studio Solution - Small efficient design
      configuration = {
        width: 2400, // Smaller width for studios
        height: 2370,
        depth: 550, // Slightly shallower
        sections: [
          {
            id: 0,
            width: 1200,
            carcasses: [
              {
                id: 0,
                height: 2370,
                width: 1200,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'rail', height: 1200 },
                  { id: 1, type: 'shelves', height: 1170, shelfCount: 5 }
                ]
              }
            ]
          },
          {
            id: 1,
            width: 1200,
            carcasses: [
              {
                id: 0,
                height: 1000,
                width: 1200,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'drawers', height: 1000, drawers: 5, isExternal: true }
                ]
              },
              {
                id: 1,
                height: 1370,
                width: 1200,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'shelves', height: 1370, shelfCount: 6 }
                ]
              }
            ]
          }
        ],
        doors: {
          style: 'sliding',
          sectionConfigs: {
            "0": { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 2 }] },
            "1": { zones: [{ id: 0, startCarcass: 0, endCarcass: 1, doorCount: 2 }] }
          }
        }
      };
      break;

    case 6: // Industrial Chic - Bold design with mixed storage
      configuration = {
        width,
        height,
        depth,
        sections: [
          {
            id: 0,
            width: 1550,
            carcasses: [
              {
                id: 0,
                height: 2370,
                width: 1550,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'double_rail', height: 2370 }
                ]
              }
            ]
          },
          {
            id: 1,
            width: 1550,
            carcasses: [
              {
                id: 0,
                height: 1200,
                width: 1550,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'drawers', height: 1200, drawers: 6, isExternal: true }
                ]
              },
              {
                id: 1,
                height: 1170,
                width: 1550,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'rail', height: 1170 }
                ]
              }
            ]
          }
        ],
        doors: {
          style: 'hinged',
          sectionConfigs: {
            "0": { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 2 }] },
            "1": { zones: [{ id: 0, startCarcass: 0, endCarcass: 1, doorCount: 2 }] }
          }
        }
      };
      break;

    case 7: // Kids Room Special - Lower rails and accessible storage
      configuration = {
        width,
        height: 2200, // Slightly lower for kids
        depth: 550,
        sections: [
          {
            id: 0,
            width: 1550,
            carcasses: [
              {
                id: 0,
                height: 1100,
                width: 1550,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'rail', height: 1100 } // Lower rail for kids
                ]
              },
              {
                id: 1,
                height: 1100,
                width: 1550,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'shelves', height: 1100, shelfCount: 5 }
                ]
              }
            ]
          },
          {
            id: 1,
            width: 1550,
            carcasses: [
              {
                id: 0,
                height: 2200,
                width: 1550,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'drawers', height: 800, drawers: 4, isExternal: true },
                  { id: 1, type: 'shelves', height: 1400, shelfCount: 7 }
                ]
              }
            ]
          }
        ],
        doors: {
          style: 'hinged',
          sectionConfigs: {
            "0": { zones: [{ id: 0, startCarcass: 0, endCarcass: 1, doorCount: 2 }] },
            "1": { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 2 }] }
          }
        }
      };
      break;

    case 8: // Master Bedroom Suite - Traditional elegant design
      configuration = {
        width,
        height,
        depth,
        sections: [
          {
            id: 0,
            width: 1033,
            carcasses: [
              {
                id: 0,
                height: 2370,
                width: 1033,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'rail', height: 1200 },
                  { id: 1, type: 'shelves', height: 1170, shelfCount: 5 }
                ]
              }
            ]
          },
          {
            id: 1,
            width: 1034,
            carcasses: [
              {
                id: 0,
                height: 1200,
                width: 1034,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'drawers', height: 1200, drawers: 6, isExternal: true }
                ]
              },
              {
                id: 1,
                height: 1170,
                width: 1034,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'rail', height: 1170 }
                ]
              }
            ]
          },
          {
            id: 2,
            width: 1033,
            carcasses: [
              {
                id: 0,
                height: 2370,
                width: 1033,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'double_rail', height: 2370 }
                ]
              }
            ]
          }
        ],
        doors: {
          style: 'hinged',
          sectionConfigs: {
            "0": { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 2 }] },
            "1": { zones: [{ id: 0, startCarcass: 0, endCarcass: 1, doorCount: 2 }] },
            "2": { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 2 }] }
          }
        }
      };
      break;

    case 9: // Narrow Hallway Solution - Slim depth
      configuration = {
        width: 2400,
        height,
        depth: 500, // Narrower for hallways
        sections: [
          {
            id: 0,
            width: 1200,
            carcasses: [
              {
                id: 0,
                height: 2370,
                width: 1200,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'rail', height: 2370 }
                ]
              }
            ]
          },
          {
            id: 1,
            width: 1200,
            carcasses: [
              {
                id: 0,
                height: 1200,
                width: 1200,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'shelves', height: 1200, shelfCount: 6 }
                ]
              },
              {
                id: 1,
                height: 1170,
                width: 1200,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'drawers', height: 1170, drawers: 5, isExternal: true }
                ]
              }
            ]
          }
        ],
        doors: {
          style: 'sliding',
          sectionConfigs: {
            "0": { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 2 }] },
            "1": { zones: [{ id: 0, startCarcass: 0, endCarcass: 1, doorCount: 2 }] }
          }
        }
      };
      break;

    case 10: // Guest Room Classic - Traditional 2-section
      configuration = {
        width: 2600,
        height,
        depth,
        sections: [
          {
            id: 0,
            width: 1300,
            carcasses: [
              {
                id: 0,
                height: 2370,
                width: 1300,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'rail', height: 1200 },
                  { id: 1, type: 'shelves', height: 1170, shelfCount: 5 }
                ]
              }
            ]
          },
          {
            id: 1,
            width: 1300,
            carcasses: [
              {
                id: 0,
                height: 1200,
                width: 1300,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'rail', height: 1200 }
                ]
              },
              {
                id: 1,
                height: 1170,
                width: 1300,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'shelves', height: 1170, shelfCount: 5 }
                ]
              }
            ]
          }
        ],
        doors: {
          style: 'hinged',
          sectionConfigs: {
            "0": { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 2 }] },
            "1": { zones: [{ id: 0, startCarcass: 0, endCarcass: 1, doorCount: 2 }] }
          }
        }
      };
      break;

    case 11: // Eco-Friendly Sustainable - Efficient MDF design
      configuration = {
        width,
        height,
        depth,
        sections: [
          {
            id: 0,
            width: 1550,
            carcasses: [
              {
                id: 0,
                height: 1200,
                width: 1550,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'rail', height: 1200 }
                ]
              },
              {
                id: 1,
                height: 1170,
                width: 1550,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'drawers', height: 1170, drawers: 5, isExternal: true }
                ]
              }
            ]
          },
          {
            id: 1,
            width: 1550,
            carcasses: [
              {
                id: 0,
                height: 2370,
                width: 1550,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'rail', height: 1200 },
                  { id: 1, type: 'shelves', height: 1170, shelfCount: 5 }
                ]
              }
            ]
          }
        ],
        doors: {
          style: 'hinged',
          sectionConfigs: {
            "0": { zones: [{ id: 0, startCarcass: 0, endCarcass: 1, doorCount: 2 }] },
            "1": { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 2 }] }
          }
        }
      };
      break;

    default:
      // Fallback configuration
      configuration = {
        width,
        height,
        depth,
        sections: [
          {
            id: 0,
            width: 1550,
            carcasses: [
              {
                id: 0,
                height: 2370,
                width: 1550,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'rail', height: 2370 }
                ]
              }
            ]
          },
          {
            id: 1,
            width: 1550,
            carcasses: [
              {
                id: 0,
                height: 2370,
                width: 1550,
                material: materialObj,
                interiorSections: [
                  { id: 0, type: 'shelves', height: 2370, shelfCount: 10 }
                ]
              }
            ]
          }
        ],
        doors: {
          style: 'hinged',
          sectionConfigs: {
            "0": { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 2 }] },
            "1": { zones: [{ id: 0, startCarcass: 0, endCarcass: 0, doorCount: 2 }] }
          }
        }
      };
  }

  return configuration;
}

// Parse CSV line
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

// Read CSV file
function readCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row);
  }

  return rows;
}

// Calculate costs from CSV data
function calculateCosts(buildNum, materialsData, orderListData) {
  const costs = {
    materials: [],
    materialTotal: 0,
    professionalDoorsDrawers: {},
    professionalDoorsDrawersTotal: 0,
    hardware: {},
    hardwareTotal: 0,
    extras: [],
    extrasTotal: 0,
    grandTotal: 0,
    savingsVsBudget: 0,
    savingsPercent: 0
  };

  // Parse materials
  materialsData.forEach(row => {
    const subtotal = parseFloat(row['Subtotal (£)']);
    costs.materials.push({
      component: row.Component,
      material: row.Material,
      thickness: row.Thickness,
      sheets: parseInt(row.Sheets),
      pricePerSheet: parseFloat(row['Price/Sheet (£)']),
      subtotal: subtotal,
      sku: row.SKU
    });
    costs.materialTotal += subtotal;
  });

  // Parse order list for hardware and extras
  orderListData.forEach(row => {
    const purpose = row.Purpose || '';
    const total = parseFloat(row['Total (£)'] || 0);

    if (purpose.startsWith('HARDWARE') || row.SKU === 'HARDWARE') {
      const key = purpose.split(' - ')[0].replace('HARDWARE', '').trim() || row['Product Name'];
      costs.hardware[key] = {
        name: row['Product Name'],
        qty: parseInt(row.Quantity) || 1,
        unitPrice: parseFloat(row['Unit Price (£)'] || 0),
        total: total
      };
      costs.hardwareTotal += total;
    } else if (purpose.startsWith('EXTRA') || row.SKU === 'EXTRA') {
      costs.extras.push({
        name: row['Product Name'],
        cost: total,
        notes: purpose.replace('EXTRA', '').trim()
      });
      costs.extrasTotal += total;
    }
  });

  // Professional doors and drawers (estimate based on configuration)
  costs.professionalDoorsDrawers = {
    largeDoors: { qty: 4, unitPrice: 125, total: 500 },
    mediumDoors: { qty: 2, unitPrice: 85, total: 170 },
    drawerFronts: { qty: 6, unitPrice: 35, total: 210 }
  };
  costs.professionalDoorsDrawersTotal = 880;

  // Calculate totals
  costs.grandTotal = costs.materialTotal + costs.professionalDoorsDrawersTotal + costs.hardwareTotal + costs.extrasTotal;
  costs.savingsVsBudget = 5000 - costs.grandTotal;
  costs.savingsPercent = ((costs.savingsVsBudget / 5000) * 100).toFixed(1);

  return costs;
}

// Main import function
async function importBuilds() {
  console.log('🚀 Starting CSV to Database Import...\n');

  const baseDir = '/Users/scotthooker/hardwoods';

  for (let buildNum = 1; buildNum <= 11; buildNum++) {
    try {
      console.log(`\n📦 Processing Build ${buildNum}...`);

      const metadata = BUILD_METADATA[buildNum];

      // Read CSV files (pad with zero only for single digits)
      const buildId = buildNum < 10 ? `0${buildNum}` : buildNum;
      const materialsPath = path.join(baseDir, `build_${buildId}_materials.csv`);
      const considerationsPath = path.join(baseDir, `build_${buildId}_considerations.csv`);
      const orderListPath = path.join(baseDir, `build_${buildId}_order_list.csv`);
      const toolsPath = path.join(baseDir, `build_${buildId}_tools.csv`);

      if (!fs.existsSync(materialsPath)) {
        console.log(`  ⚠️  Materials file not found, skipping build ${buildNum}`);
        continue;
      }

      const materials = readCSV(materialsPath);
      const considerations = readCSV(considerationsPath);
      const orderList = readCSV(orderListPath);
      const tools = readCSV(toolsPath);

      // Design configuration
      console.log(`  🎨 Designing wardrobe configuration...`);
      const configuration = designWardrobeConfiguration(buildNum, materials);

      // Calculate costs
      console.log(`  💰 Calculating costs...`);
      const costs = calculateCosts(buildNum, materials, orderList);

      // Extract special tools
      const specialTools = tools.map(t => t.Tool).filter(t => t && t !== 'None - doors pre-finished');

      // Extract considerations
      const considerationsList = considerations.map(c => c.Consideration).filter(c => c);

      // Build object for database
      const build = {
        name: metadata.name,
        character: metadata.character,
        image: null, // Will be generated later
        width: configuration.width,
        height: configuration.height,
        depth: configuration.depth,
        configuration: configuration,
        costs: costs,
        hardware: [], // Will be populated from costs.hardware
        extras: costs.extras,
        specialTools: specialTools,
        considerations: considerationsList,
        recommendedFor: metadata.recommendedFor,
        generatedImage: null,
        generatedPrompt: null
      };

      // Insert into database
      console.log(`  💾 Inserting into database...`);
      const result = await pool.query(
        `INSERT INTO builds (
          name, character, image,
          width, height, depth,
          configuration, costs_json, hardware_json, extras_json,
          special_tools, considerations, recommended_for,
          generated_image, generated_prompt
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id`,
        [
          build.name,
          build.character,
          build.image,
          build.width,
          build.height,
          build.depth,
          JSON.stringify(build.configuration),
          JSON.stringify(build.costs),
          JSON.stringify(build.hardware),
          JSON.stringify(build.extras),
          build.specialTools,
          build.considerations,
          build.recommendedFor,
          build.generatedImage,
          build.generatedPrompt
        ]
      );

      console.log(`  ✅ Build ${buildNum} imported successfully! (ID: ${result.rows[0].id})`);
      console.log(`     - ${metadata.name}`);
      console.log(`     - ${configuration.sections.length} sections, ${configuration.sections.reduce((sum, s) => sum + s.carcasses.length, 0)} carcasses`);
      console.log(`     - Grand Total: £${costs.grandTotal.toFixed(2)}`);
      console.log(`     - Savings: £${costs.savingsVsBudget.toFixed(2)}`);

    } catch (error) {
      console.error(`  ❌ Error importing build ${buildNum}:`, error.message);
    }
  }

  console.log('\n✅ Import complete!');
  await pool.end();
}

// Run the import
importBuilds().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
