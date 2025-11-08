import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Type definitions
export interface ProductPricing {
  supplier: string;
  price: number;
  isPreferred?: boolean;
}

export interface DoorDrawerProduct {
  key: string;
  category: string;
  productType: string;
  name?: string;
  description?: string;
  pricing: ProductPricing[];
}

export interface UseDoorsDrawersReturn {
  products: DoorDrawerProduct[];
  isLoading: boolean;
  error: string | null;
  getProductByKey: (key: string) => DoorDrawerProduct | null;
  getProductsByCategory: (category: string) => DoorDrawerProduct[];
  getProductsByType: (type: string) => DoorDrawerProduct[];
  getPreferredPricing: (key: string) => ProductPricing | null;
  getAllPricing: (key: string) => ProductPricing[];
}

/**
 * Custom hook to fetch door/drawer products from database
 * Returns products with multi-supplier pricing
 */
export function useDoorsDrawers(): UseDoorsDrawersReturn {
  const [products, setProducts] = useState<DoorDrawerProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts(): Promise<void> {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/doors-drawers`);

        if (!response.ok) {
          throw new Error('Failed to fetch door/drawer products');
        }

        const data: DoorDrawerProduct[] = await response.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching doors/drawers:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  /**
   * Get product by key
   */
  const getProductByKey = (key: string): DoorDrawerProduct | null => {
    return products.find(p => p.key === key) || null;
  };

  /**
   * Get products by category
   */
  const getProductsByCategory = (category: string): DoorDrawerProduct[] => {
    return products.filter(p => p.category === category);
  };

  /**
   * Get products by type
   */
  const getProductsByType = (type: string): DoorDrawerProduct[] => {
    return products.filter(p => p.productType === type);
  };

  /**
   * Get preferred supplier pricing for a product
   */
  const getPreferredPricing = (key: string): ProductPricing | null => {
    const product = getProductByKey(key);
    if (!product || !product.pricing) return null;

    return product.pricing.find(p => p.isPreferred) || product.pricing[0] || null;
  };

  /**
   * Get all pricing options for a product
   */
  const getAllPricing = (key: string): ProductPricing[] => {
    const product = getProductByKey(key);
    return product?.pricing || [];
  };

  return {
    products,
    isLoading,
    error,
    getProductByKey,
    getProductsByCategory,
    getProductsByType,
    getPreferredPricing,
    getAllPricing
  };
}
