import { DeskModel, type DeskConfiguration } from '../models/DeskModel';

// Types and Interfaces

interface Material {
  component: string;
  material: string;
  thickness: string;
  sheets: number;
  pricePerSheet: number;
  subtotal: number;
  category: string;
  sku?: string;
  note?: string;
}

interface MaterialCost {
  component: string;
  material: string;
  thickness: string;
  sheets: number;
  area: string;
  pricePerSheet: number;
  subtotal: number;
  note: string;
}

interface ProfessionalItem {
  qty: number;
  description: string;
  unitPrice: number;
  total: number;
}

interface HardwareItem {
  desc?: string;
  item?: string;
  description?: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface AccessoryItem {
  item: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface CarcassMaterial {
  material: string;
  thickness: string;
  thicknessNum: number;
  price: number;
  sku: string;
}

interface InteriorSection {
  id: number;
  type: 'rail' | 'double_rail' | 'shelves' | 'drawers';
  height: number;
  drawers?: number;
  shelfCount?: number;
  isExternal?: boolean;
}

interface Carcass {
  id: number;
  height: number;
  width: number;
  material?: CarcassMaterial;
  sections?: InteriorSection[];
}

interface Section {
  id: number;
  width: number;
  carcasses: Carcass[];
}

interface DoorsConfig {
  style: 'none' | 'hinged' | 'sliding';
  count?: number;
  sectionConfigs?: Record<string, {
    zones: Array<{
      id: number;
      startCarcass: number;
      endCarcass: number;
      doorCount: number;
    }>;
  }>;
}

interface ExternalDrawers {
  count: number;
}

interface WardrobeConfiguration {
  furnitureType?: 'wardrobe' | 'desk';
  width: number;
  height: number;
  depth: number;
  budget?: number;
  numCarcasses?: number;
  carcasses?: Carcass[];
  sections?: Section[];
  doors?: DoorsConfig;
  externalDrawers?: ExternalDrawers;
}

type FurnitureConfiguration = WardrobeConfiguration | DeskConfiguration;

interface BuildCosts {
  materials: Material[] | MaterialCost[] | Record<string, unknown>;
  materialTotal: number;
  professionalDoorsDrawers: Record<string, ProfessionalItem>;
  professionalDoorsDrawersTotal: number;
  hardware: Record<string, HardwareItem> | HardwareItem[];
  hardwareTotal: number;
  extras: unknown[] | AccessoryItem[];
  extrasTotal: number;
  grandTotal: number;
  savingsVsBudget: number;
}

interface Build {
  id: number;
  name: string;
  character: string;
  image: string;
  furnitureType: 'wardrobe' | 'desk';
  budget: number;
  configuration: FurnitureConfiguration;
  costs: BuildCosts;
}

/**
 * Converts furniture configuration from builder to build object.
 * Handles both wardrobes and desks by determining the furniture type
 * and routing to the appropriate converter function.
 *
 * @param configuration - The furniture configuration from the builder
 * @param buildName - Optional name for the build
 * @returns A complete build object with costs and materials
 */
export function configurationToBuild(
  configuration: FurnitureConfiguration,
  buildName?: string
): Build {
  // Determine furniture type
  const furnitureType = configuration.furnitureType || 'wardrobe';

  // Use appropriate converter based on type
  if (furnitureType === 'desk') {
    return configurationToDeskBuild(
      configuration as DeskConfiguration,
      buildName || 'My Desk'
    );
  } else {
    return configurationToWardrobeBuild(
      configuration as WardrobeConfiguration,
      buildName || 'My Wardrobe'
    );
  }
}

/**
 * Converts desk configuration to a build object with cost breakdown.
 * Uses DeskModel to calculate materials, hardware, and accessories costs.
 *
 * @param configuration - The desk configuration
 * @param buildName - Name for the desk build
 * @returns A complete desk build object
 */
function configurationToDeskBuild(
  configuration: DeskConfiguration,
  buildName: string
): Build {
  const deskModel = new DeskModel(configuration);
  const costs = deskModel.costs;
  const budget: number = typeof configuration.budget === 'number' ? configuration.budget : 5000;
  const grandTotal = Number(costs.grandTotal);

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
      grandTotal,
      savingsVsBudget: budget - grandTotal
    }
  };
}

/**
 * Converts wardrobe configuration to a build object with detailed cost breakdown.
 * Calculates materials needed for carcass, drawers, professional doors/fronts,
 * and hardware based on the configuration sections and interior design.
 *
 * @param configuration - The wardrobe configuration
 * @param buildName - Name for the wardrobe build
 * @returns A complete wardrobe build object with itemized costs
 */
function configurationToWardrobeBuild(
  configuration: WardrobeConfiguration,
  buildName: string
): Build {
  // Calculate materials needed
  const materials: Material[] = [];

  // Add carcass materials
  materials.push({
    component: 'Carcass - Sides & Top/Bottom',
    material: 'Moisture Resistant MDF',
    thickness: '18mm',
    sheets: Math.ceil((configuration.numCarcasses || 0) * 2.5), // Rough estimate
    pricePerSheet: 46.81, // Default price
    subtotal: 0,
    category: 'CARCASS'
  });

  // Count total drawers and shelves
  let totalDrawers = 0;
  let totalShelves = 0;
  let totalRails = 0;

  configuration.carcasses?.forEach(carcass => {
    carcass.sections?.forEach(section => {
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
  const professionalDoorsDrawers: Record<string, ProfessionalItem> = {};

  const doorsConfig = configuration.doors;
  if (doorsConfig && doorsConfig.style !== 'none' && (doorsConfig.count || 0) > 0) {
    professionalDoorsDrawers.doors = {
      qty: doorsConfig.count || 0,
      description: `${doorsConfig.style === 'hinged' ? 'Hinged' : 'Sliding'} Doors`,
      unitPrice: 150.00,
      total: (doorsConfig.count || 0) * 150.00
    };
  }

  if ((configuration.externalDrawers?.count || 0) > 0) {
    professionalDoorsDrawers.drawerFronts = {
      qty: configuration.externalDrawers?.count || 0,
      description: 'External Drawer Fronts',
      unitPrice: 50.00,
      total: (configuration.externalDrawers?.count || 0) * 50.00
    };
  }

  // Hardware estimation
  const doorCount = configuration.doors?.count || 0;
  const hardware: Record<string, HardwareItem> = {
    hinges: {
      desc: 'Soft-close hinges',
      qty: doorCount * 2,
      unitPrice: 3.50,
      total: doorCount * 2 * 3.50
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
    character: `${configuration.width}x${configuration.height}x${configuration.depth}mm, ${configuration.numCarcasses || 0} carcasses`,
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
