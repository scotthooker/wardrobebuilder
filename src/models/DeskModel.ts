/**
 * DeskModel - Represents a desk build with cost calculations
 * Handles material calculations for desktops, bases, overhead storage, and accessories
 */
import { DESK_DEFAULTS, DESK_ACCESSORIES } from '../constants/deskSectionTypes';

// Type definitions for DeskModel

interface MaterialCost {
  component: string;
  material: string;
  thickness: string;
  sheets: number;
  area: string;
  pricePerSheet: number;
  subtotal: number;
  note: string;
  category?: string;
  sku?: string;
}

interface HardwareItem {
  item: string;
  description: string;
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

interface Costs {
  materials: MaterialCost[];
  materialTotal: number;
  hardware: HardwareItem[];
  hardwareTotal: number;
  accessories: AccessoryItem[];
  accessoriesTotal: number;
  grandTotal: number;
}

interface PedestalConfig {
  enabled: boolean;
  width: number;
}

interface BaseConfig {
  type: 'pedestals' | 'panel_sides' | 'legs' | 'trestle';
  left?: PedestalConfig;
  right?: PedestalConfig;
}

interface OverheadConfig {
  enabled: boolean;
  type: 'hutch' | 'open_shelving' | 'closed_cabinets' | 'wall_mounted';
  height?: number;
}

interface AccessoriesConfig {
  [key: string]: boolean;
}

export interface DeskConfiguration {
  width: number;
  depth: number;
  height?: number;
  deskShape?: string;
  base?: BaseConfig;
  overhead?: OverheadConfig;
  accessories?: AccessoriesConfig;
  [key: string]: unknown;
}

interface DeskSummary {
  furnitureType: string;
  shape: string;
  dimensions: {
    width: number;
    depth: number;
    height?: number;
  };
  base?: BaseConfig;
  overhead?: OverheadConfig;
  accessories?: AccessoriesConfig;
  costs: Costs;
}

interface AccessoryPricing {
  name: string;
  price: number;
}

interface AccessoryPricingMap {
  [key: string]: AccessoryPricing;
}

interface DeskAccessory {
  description?: string;
  defaultQty?: number;
}

interface DeskAccessoriesMap {
  [key: string]: DeskAccessory;
}

export class DeskModel {
  configuration: DeskConfiguration;
  costs: Costs;

  constructor(configuration: DeskConfiguration) {
    this.configuration = configuration;
    this.costs = this._calculateCosts();
  }

  /**
   * Calculate all costs for this desk build
   */
  _calculateCosts(): Costs {
    const costs: Costs = {
      materials: [],
      materialTotal: 0,
      hardware: [],
      hardwareTotal: 0,
      accessories: [],
      accessoriesTotal: 0,
      grandTotal: 0
    };

    // 1. Calculate desktop material
    const desktopCost = this._calculateDesktopMaterial();
    if (desktopCost) {
      costs.materials.push(desktopCost);
      costs.materialTotal += desktopCost.subtotal;
    }

    // 2. Calculate base material (pedestals/panels)
    const baseCosts = this._calculateBaseMaterial();
    costs.materials.push(...baseCosts);
    costs.materialTotal += baseCosts.reduce((sum, item) => sum + item.subtotal, 0);

    // 3. Calculate overhead storage material
    if (this.configuration.overhead?.enabled) {
      const overheadCosts = this._calculateOverheadMaterial();
      costs.materials.push(...overheadCosts);
      costs.materialTotal += overheadCosts.reduce((sum, item) => sum + item.subtotal, 0);
    }

    // 4. Calculate hardware costs
    const hardwareCosts = this._calculateHardware();
    costs.hardware = hardwareCosts;
    costs.hardwareTotal = hardwareCosts.reduce((sum, item) => sum + item.total, 0);

    // 5. Calculate accessories costs
    const accessoryCosts = this._calculateAccessories();
    costs.accessories = accessoryCosts;
    costs.accessoriesTotal = accessoryCosts.reduce((sum, item) => sum + item.total, 0);

    // 6. Calculate grand total
    costs.grandTotal = costs.materialTotal + costs.hardwareTotal + costs.accessoriesTotal;

    return costs;
  }

  /**
   * Calculate desktop material requirements
   */
  _calculateDesktopMaterial(): MaterialCost | null {
    const width = this.configuration.width || DESK_DEFAULTS.DEFAULT_DESKTOP_WIDTH;
    const depth = this.configuration.depth || DESK_DEFAULTS.DEFAULT_DESKTOP_DEPTH;
    const shape = this.configuration.deskShape || 'straight';

    // Calculate area in square meters
    let area = (width * depth) / 1_000_000;

    // Adjust for L-shaped or U-shaped desks (rough estimate)
    if (shape === 'l_shaped') {
      area *= 1.5; // L-shape uses ~1.5x material
    } else if (shape === 'u_shaped') {
      area *= 2.0; // U-shape uses ~2x material
    }

    // Standard desktop material: 25mm thickness
    // Assuming ~£60 per sheet (2440mm x 1220mm = 2.98 sqm)
    const sheetArea = 2.98; // sqm
    const sheetsNeeded = Math.ceil(area / sheetArea);
    const pricePerSheet = 60.00;

    return {
      component: 'Desktop',
      material: 'Oak Veneered MDF',
      thickness: '25mm',
      sheets: sheetsNeeded,
      area: area.toFixed(2),
      pricePerSheet: pricePerSheet,
      subtotal: sheetsNeeded * pricePerSheet,
      note: `${width}mm × ${depth}mm (${shape})`
    };
  }

  /**
   * Calculate base/pedestal material requirements
   */
  _calculateBaseMaterial(): MaterialCost[] {
    const materials: MaterialCost[] = [];
    const baseType = this.configuration.base?.type;

    if (baseType === 'pedestals' || baseType === 'panel_sides') {
      const leftPedestal = this.configuration.base?.left;
      const rightPedestal = this.configuration.base?.right;

      // Calculate material for left pedestal
      if (leftPedestal?.enabled) {
        const leftMaterial = this._calculatePedestalMaterial('Left', leftPedestal.width);
        materials.push(leftMaterial);
      }

      // Calculate material for right pedestal
      if (rightPedestal?.enabled) {
        const rightMaterial = this._calculatePedestalMaterial('Right', rightPedestal.width);
        materials.push(rightMaterial);
      }
    } else if (baseType === 'legs' || baseType === 'trestle') {
      // Legs don't require sheet materials, just hardware (calculated separately)
      // No material costs for legs
    }

    return materials;
  }

  /**
   * Calculate material for a single pedestal
   */
  _calculatePedestalMaterial(side: string, width: number): MaterialCost {
    const depth = this.configuration.depth || DESK_DEFAULTS.DEFAULT_DESKTOP_DEPTH;
    const height = this.configuration.height || DESK_DEFAULTS.DEFAULT_DESKTOP_HEIGHT;

    // Pedestal panels needed:
    // - 2 sides (height × depth)
    // - 1 back (height × width)
    // - 1 top (width × depth)
    // - 1 bottom (width × depth)
    // Total area in sqm
    const area = (
      (2 * height * depth) + // sides
      (height * width) + // back
      (2 * width * depth) // top and bottom
    ) / 1_000_000;

    const sheetArea = 2.98; // sqm per sheet
    const sheetsNeeded = Math.ceil(area / sheetArea);
    const pricePerSheet = 50.80; // MR MDF 18mm

    return {
      component: `${side} Pedestal`,
      material: 'Moisture Resistant MDF',
      thickness: '18mm',
      sheets: sheetsNeeded,
      area: area.toFixed(2),
      pricePerSheet: pricePerSheet,
      subtotal: sheetsNeeded * pricePerSheet,
      note: `${width}mm wide × ${height}mm high`
    };
  }

  /**
   * Calculate overhead storage material
   */
  _calculateOverheadMaterial(): MaterialCost[] {
    const materials: MaterialCost[] = [];
    const overhead = this.configuration.overhead;

    if (!overhead?.enabled) return materials;

    const width = this.configuration.width || DESK_DEFAULTS.DEFAULT_DESKTOP_WIDTH;
    const overheadHeight = overhead.height || DESK_DEFAULTS.OVERHEAD_DEFAULT_HEIGHT;
    const overheadDepth = DESK_DEFAULTS.OVERHEAD_DEFAULT_DEPTH;

    // Calculate area for overhead unit
    // Simplified: treat as a box (top, bottom, 2 sides, back, shelves)
    const area = (
      (2 * width * overheadDepth) + // top and bottom
      (2 * overheadHeight * overheadDepth) + // sides
      (overheadHeight * width) + // back
      (width * overheadDepth) // one shelf
    ) / 1_000_000;

    const sheetArea = 2.98;
    const sheetsNeeded = Math.ceil(area / sheetArea);
    const pricePerSheet = 50.80;

    materials.push({
      component: 'Overhead Storage',
      material: 'Moisture Resistant MDF',
      thickness: '18mm',
      sheets: sheetsNeeded,
      area: area.toFixed(2),
      pricePerSheet: pricePerSheet,
      subtotal: sheetsNeeded * pricePerSheet,
      note: `${overhead.type} - ${overheadHeight}mm high`
    });

    return materials;
  }

  /**
   * Calculate hardware costs
   */
  _calculateHardware(): HardwareItem[] {
    const hardware: HardwareItem[] = [];
    const baseType = this.configuration.base?.type;

    // Hardware for pedestals
    if (baseType === 'pedestals') {
      const leftEnabled = this.configuration.base?.left?.enabled;
      const rightEnabled = this.configuration.base?.right?.enabled;

      // Drawer runners for pedestals (assuming 3 drawers per pedestal)
      const pedestalCount = (leftEnabled ? 1 : 0) + (rightEnabled ? 1 : 0);
      if (pedestalCount > 0) {
        hardware.push({
          item: 'Desk Drawer Slides',
          description: 'Heavy-duty full-extension drawer slides (400mm)',
          qty: pedestalCount * 3, // 3 drawers per pedestal
          unitPrice: 12.00,
          total: pedestalCount * 3 * 12.00
        });
      }

      // Cabinet hinges if needed
      hardware.push({
        item: 'Cabinet Hinges',
        description: 'Soft-close concealed hinges',
        qty: pedestalCount * 4, // 2 doors × 2 hinges each
        unitPrice: 4.50,
        total: pedestalCount * 4 * 4.50
      });
    } else if (baseType === 'legs') {
      // Desk legs hardware
      hardware.push({
        item: 'Adjustable Desk Legs',
        description: 'Height adjustable metal desk legs with leveling feet',
        qty: 4,
        unitPrice: 25.00,
        total: 100.00
      });
    }

    // Overhead storage hardware
    if (this.configuration.overhead?.enabled) {
      hardware.push({
        item: 'Overhead Cabinet Hinges',
        description: 'Soft-close concealed hinges for overhead cabinets',
        qty: 4, // 2 doors × 2 hinges
        unitPrice: 4.50,
        total: 18.00
      });
    }

    return hardware;
  }

  /**
   * Calculate accessories costs
   */
  _calculateAccessories(): AccessoryItem[] {
    const accessories: AccessoryItem[] = [];
    const selectedAccessories = this.configuration.accessories || {};

    // Accessory pricing map (from hardware database)
    const accessoryPricing: AccessoryPricingMap = {
      keyboard_tray: { name: 'Keyboard Tray Slides', price: 15.00 },
      cable_management: { name: 'Cable Management Grommets', price: 5.00 },
      monitor_arm: { name: 'Monitor Arm Mount', price: 45.00 },
      cpu_holder: { name: 'CPU Holder/Tower Mount', price: 12.00 },
      cable_tray: { name: 'Cable Management Tray', price: 18.00 },
      desk_power: { name: 'Desktop Power Outlet', price: 25.00 }
    };

    Object.entries(selectedAccessories).forEach(([key, isSelected]) => {
      if (isSelected && accessoryPricing[key]) {
        const accessory: DeskAccessory | undefined = (DESK_ACCESSORIES as DeskAccessoriesMap)[key.toUpperCase()];
        const pricing = accessoryPricing[key];
        const qty = accessory?.defaultQty || 1;

        accessories.push({
          item: pricing.name,
          description: accessory?.description || '',
          qty: qty,
          unitPrice: pricing.price,
          total: qty * pricing.price
        });
      }
    });

    return accessories;
  }

  /**
   * Get a summary of the desk configuration
   */
  getSummary(): DeskSummary {
    return {
      furnitureType: 'desk',
      shape: this.configuration.deskShape || 'straight',
      dimensions: {
        width: this.configuration.width,
        depth: this.configuration.depth,
        height: this.configuration.height
      },
      base: this.configuration.base,
      overhead: this.configuration.overhead,
      accessories: this.configuration.accessories,
      costs: this.costs
    };
  }
}
