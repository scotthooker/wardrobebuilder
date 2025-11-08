/**
 * Furniture Types
 * Defines the types of furniture that can be built
 */

export interface FurnitureType {
  id: string
  name: string
  icon: string
  description: string
  color: string
}

export const FURNITURE_TYPES = {
  WARDROBE: {
    id: 'wardrobe',
    name: 'Wardrobe',
    icon: '👔',
    description: 'Built-in wardrobe with hanging rails, shelves, and drawers',
    color: 'blue'
  } as const,
  DESK: {
    id: 'desk',
    name: 'Home Office Desk',
    icon: '🖥️',
    description: 'Built-in desk with storage, overhead cabinets, and accessories',
    color: 'green'
  } as const
} as const

// Helper function to get all furniture types as array
export function getFurnitureTypes(): FurnitureType[] {
  return Object.values(FURNITURE_TYPES)
}

// Helper function to get furniture type by ID
export function getFurnitureTypeById(id: string): FurnitureType | undefined {
  return Object.values(FURNITURE_TYPES).find(type => type.id === id)
}
