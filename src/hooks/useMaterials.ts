import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Type definitions
export interface MaterialOption {
  thickness: string;
  thicknessNum?: number;
  size?: string;
  price: number;
  sku?: string;
  pricePerSqm?: number;
}

export interface Material {
  name: string;
  category?: string;
  type?: string;
  recommended?: boolean;
  description?: string;
  usage?: string;
  image?: string;
  options: MaterialOption[];
}

export interface MaterialsApiResponse {
  materials: Material[];
  defaultMaterial?: string;
  recommendedThickness?: string;
}

export interface UseMaterialsReturn {
  materials: Material[];
  defaultMaterial: string | null;
  recommendedThickness: string;
  isLoading: boolean;
  error: string | null;
  getDefaultMaterialOption: () => (MaterialOption & { material: string }) | null;
}

export function useMaterials(): UseMaterialsReturn {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [defaultMaterial, setDefaultMaterial] = useState<string | null>(null);
  const [recommendedThickness, setRecommendedThickness] = useState<string>('18mm');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMaterials(): Promise<void> {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/materials/sheet-goods`);

        if (!response.ok) {
          throw new Error('Failed to fetch materials');
        }

        const data: MaterialsApiResponse = await response.json();
        setMaterials(data.materials || []);
        setDefaultMaterial(data.defaultMaterial || 'Moisture Resistant MDF');
        setRecommendedThickness(data.recommendedThickness || '18mm');
        setError(null);
      } catch (err) {
        console.error('Error fetching materials:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMaterials();
  }, []);

  /**
   * Helper function to get default material option
   */
  const getDefaultMaterialOption = (): (MaterialOption & { material: string }) | null => {
    const material = materials.find(m => m.name === defaultMaterial);
    if (!material) return null;

    const option = material.options.find(o => o.thickness === recommendedThickness);
    if (option) {
      return { material: material.name, ...option };
    }

    // Fallback to first option if recommended thickness not found
    if (material.options[0]) {
      return { material: material.name, ...material.options[0] };
    }

    return null;
  };

  return {
    materials,
    defaultMaterial,
    recommendedThickness,
    isLoading,
    error,
    getDefaultMaterialOption
  };
}
