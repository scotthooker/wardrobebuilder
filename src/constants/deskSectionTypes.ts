/**
 * Desk Section Types
 * Defines component types for desk builds
 */

// Type definitions
export interface DeskShape {
  id: string
  name: string
  icon: string
  description: string
  surfaces: number
}

export interface DeskBaseType {
  id: string
  name: string
  icon: string
  description: string
  requiresCarcass: boolean
}

export interface StorageType {
  id: string
  name: string
  icon: string
  defaultHeight: number
  minHeight: number
  description: string
  defaultShelfCount?: number
}

export interface AccessoryType {
  id: string
  name: string
  icon: string
  description: string
  hardwareKey: string
  defaultQty: number
}

// Desktop shapes
export const DESK_SHAPES: Record<string, DeskShape> = {
  STRAIGHT: {
    id: 'straight',
    name: 'Straight Desk',
    icon: '▬',
    description: 'Simple rectangular desktop',
    surfaces: 1
  },
  L_SHAPED: {
    id: 'l_shaped',
    name: 'L-Shaped Desk',
    icon: '⌐',
    description: 'Two perpendicular desktop surfaces forming an L',
    surfaces: 2
  },
  U_SHAPED: {
    id: 'u_shaped',
    name: 'U-Shaped Desk',
    icon: '⊐',
    description: 'Three desktop surfaces forming a U',
    surfaces: 3
  }
};

// Base/support types for desks
export const DESK_BASE_TYPES: Record<string, DeskBaseType> = {
  PEDESTALS: {
    id: 'pedestals',
    name: 'Drawer Pedestals',
    icon: '🗄️',
    description: 'Drawer units on left and/or right side',
    requiresCarcass: true
  },
  PANEL_SIDES: {
    id: 'panel_sides',
    name: 'Panel Sides',
    icon: '▯',
    description: 'Solid panel end supports',
    requiresCarcass: true
  },
  LEGS: {
    id: 'legs',
    name: 'Desk Legs',
    icon: '||',
    description: 'Adjustable metal or wood legs',
    requiresCarcass: false
  },
  TRESTLE: {
    id: 'trestle',
    name: 'Trestle Base',
    icon: '⊥',
    description: 'A-frame trestle supports',
    requiresCarcass: false
  }
};

// Storage component types for lower units (below desktop)
export const DESK_LOWER_STORAGE: Record<string, StorageType> = {
  UTILITY_DRAWER: {
    id: 'utility_drawer',
    name: 'Utility Drawer',
    icon: '📦',
    defaultHeight: 150,
    minHeight: 100,
    description: 'Shallow drawer for pens, supplies'
  },
  FILE_DRAWER: {
    id: 'file_drawer',
    name: 'File Drawer',
    icon: '📁',
    defaultHeight: 300,
    minHeight: 250,
    description: 'Deep drawer for hanging files'
  },
  STANDARD_DRAWER: {
    id: 'standard_drawer',
    name: 'Standard Drawer',
    icon: '📋',
    defaultHeight: 200,
    minHeight: 150,
    description: 'Medium drawer for general storage'
  },
  CABINET_DOOR: {
    id: 'cabinet_door',
    name: 'Cabinet Door',
    icon: '🚪',
    defaultHeight: 600,
    minHeight: 400,
    description: 'Cabinet with hinged door'
  },
  OPEN_SHELF: {
    id: 'open_shelf',
    name: 'Open Shelf',
    icon: '📚',
    defaultHeight: 300,
    minHeight: 200,
    description: 'Open shelf compartment'
  }
};

// Storage component types for overhead units (above desktop)
export const DESK_OVERHEAD_STORAGE: Record<string, StorageType> = {
  OVERHEAD_CABINET: {
    id: 'overhead_cabinet',
    name: 'Overhead Cabinet',
    icon: '🗃️',
    defaultHeight: 400,
    minHeight: 300,
    description: 'Cabinet with doors above desk'
  },
  HUTCH_SHELVES: {
    id: 'hutch_shelves',
    name: 'Hutch Shelves',
    icon: '📚',
    defaultHeight: 400,
    minHeight: 250,
    description: 'Open shelving above desk',
    defaultShelfCount: 2
  },
  DISPLAY_CABINET: {
    id: 'display_cabinet',
    name: 'Display Cabinet',
    icon: '🪟',
    defaultHeight: 400,
    minHeight: 300,
    description: 'Glass-door display cabinet'
  },
  PIGEONHOLE_UNIT: {
    id: 'pigeonhole',
    name: 'Pigeonhole Unit',
    icon: '▦',
    defaultHeight: 350,
    minHeight: 250,
    description: 'Multiple small cubby compartments'
  }
};

// Desk accessories and hardware
export const DESK_ACCESSORIES: Record<string, AccessoryType> = {
  KEYBOARD_TRAY: {
    id: 'keyboard_tray',
    name: 'Keyboard Tray',
    icon: '⌨️',
    description: 'Under-desk keyboard tray with slides',
    hardwareKey: 'keyboard_slides',
    defaultQty: 1
  },
  CABLE_MANAGEMENT: {
    id: 'cable_management',
    name: 'Cable Management',
    icon: '🔌',
    description: 'Cable grommets and trays',
    hardwareKey: 'cable_grommets',
    defaultQty: 2
  },
  MONITOR_ARM: {
    id: 'monitor_arm',
    name: 'Monitor Arm',
    icon: '🖥️',
    description: 'VESA monitor arm mount',
    hardwareKey: 'monitor_arm',
    defaultQty: 1
  },
  CPU_HOLDER: {
    id: 'cpu_holder',
    name: 'CPU Holder',
    icon: '💻',
    description: 'Under-desk CPU holder',
    hardwareKey: 'cpu_holder',
    defaultQty: 1
  },
  CABLE_TRAY: {
    id: 'cable_tray',
    name: 'Cable Tray',
    icon: '🔗',
    description: 'Under-desk wire management tray',
    hardwareKey: 'cable_tray',
    defaultQty: 1
  },
  DESK_POWER: {
    id: 'desk_power',
    name: 'Power Outlet',
    icon: '⚡',
    description: 'Desktop power and USB outlet',
    hardwareKey: 'desk_power_outlet',
    defaultQty: 1
  }
};

// Standard desk dimensions (in mm)
export const DESK_DEFAULTS = {
  DESKTOP_THICKNESS: 25,
  MIN_DESKTOP_WIDTH: 800,
  MAX_DESKTOP_WIDTH: 3000,
  MIN_DESKTOP_DEPTH: 450,
  MAX_DESKTOP_DEPTH: 900,
  DEFAULT_DESKTOP_WIDTH: 1600,
  DEFAULT_DESKTOP_DEPTH: 750,
  DEFAULT_DESKTOP_HEIGHT: 730, // Standard desk height from floor

  PEDESTAL_MIN_WIDTH: 300,
  PEDESTAL_MAX_WIDTH: 500,
  PEDESTAL_DEFAULT_WIDTH: 400,
  PEDESTAL_DEFAULT_DEPTH: 500,

  OVERHEAD_MIN_HEIGHT: 300,
  OVERHEAD_MAX_HEIGHT: 800,
  OVERHEAD_DEFAULT_HEIGHT: 600,
  OVERHEAD_MIN_DEPTH: 250,
  OVERHEAD_MAX_DEPTH: 400,
  OVERHEAD_DEFAULT_DEPTH: 300,

  CLEARANCE_ABOVE_DESKTOP: 50, // Minimum gap between desktop and overhead

  // Ergonomics
  KNEE_CLEARANCE_HEIGHT: 650,
  KNEE_CLEARANCE_DEPTH: 450,

  // Material defaults
  DEFAULT_CARCASS_THICKNESS: 18,
  DEFAULT_DESKTOP_MATERIAL: 'Oak Veneered MDF',
  DEFAULT_DESKTOP_THICKNESS: '25mm',
  DEFAULT_CARCASS_MATERIAL: 'Moisture Resistant MDF'
};

// Helper function to get all lower storage types as array
export function getLowerStorageTypes(): StorageType[] {
  return Object.values(DESK_LOWER_STORAGE);
}

// Helper function to get all overhead storage types as array
export function getOverheadStorageTypes(): StorageType[] {
  return Object.values(DESK_OVERHEAD_STORAGE);
}

// Helper function to get all desk shapes as array
export function getDeskShapes(): DeskShape[] {
  return Object.values(DESK_SHAPES);
}

// Helper function to get all desk base types as array
export function getDeskBaseTypes(): DeskBaseType[] {
  return Object.values(DESK_BASE_TYPES);
}

// Helper function to get all desk accessories as array
export function getDeskAccessories(): AccessoryType[] {
  return Object.values(DESK_ACCESSORIES);
}
