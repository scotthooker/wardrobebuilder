import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useMaterials() {
  const [materials, setMaterials] = useState([]);
  const [defaultMaterial, setDefaultMaterial] = useState(null);
  const [recommendedThickness, setRecommendedThickness] = useState('18mm');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMaterials() {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/materials/sheet-goods`);

        if (!response.ok) {
          throw new Error('Failed to fetch materials');
        }

        const data = await response.json();
        setMaterials(data.materials || []);
        setDefaultMaterial(data.defaultMaterial || 'Moisture Resistant MDF');
        setRecommendedThickness(data.recommendedThickness || '18mm');
        setError(null);
      } catch (err) {
        console.error('Error fetching materials:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMaterials();
  }, []);

  // Helper function to get default material option
  const getDefaultMaterialOption = () => {
    const material = materials.find(m => m.name === defaultMaterial);
    if (!material) return null;

    const option = material.options.find(o => o.thickness === recommendedThickness);
    return option ? { material: material.name, ...option } : material.options[0];
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
