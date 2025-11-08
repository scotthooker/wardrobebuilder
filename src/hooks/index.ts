/**
 * Central export for all custom hooks
 * Database-powered hooks for wardrobe builder application
 */

export { useBuilds, useBuild, useSelectedBuilds } from './useBuilds';
export { useMaterials } from './useMaterials';
export { useHardware } from './useHardware';
export { useDoorsDrawers } from './useDoorsDrawers';
export { useSuppliers } from './useSuppliers';

// Re-export types
export type { UseBuildsReturn, UseBuildReturn, UseSelectedBuildsReturn } from './useBuilds';
export type { UseMaterialsReturn, MaterialOption } from './useMaterials';
export type { UseHardwareReturn, HardwareItem } from './useHardware';
export type { UseDoorsDrawersReturn, DoorDrawerProduct, ProductPricing } from './useDoorsDrawers';
export type { UseSuppliersReturn, Supplier } from './useSuppliers';
