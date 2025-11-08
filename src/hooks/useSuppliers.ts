import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Type definitions
export interface Supplier {
  name: string;
  type: 'SHEET_GOODS' | 'DOORS_DRAWERS' | 'BOTH';
  website?: string;
  contact?: string;
  notes?: string;
}

export interface UseSuppliersReturn {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;
  getSupplierByName: (name: string) => Supplier | null;
  getSuppliersByType: (supplierType: string) => Supplier[];
}

/**
 * Custom hook to fetch suppliers from database
 */
export function useSuppliers(type: string | null = null): UseSuppliersReturn {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSuppliers(): Promise<void> {
      try {
        setIsLoading(true);
        const url = type
          ? `${API_URL}/api/suppliers?type=${type}`
          : `${API_URL}/api/suppliers`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch suppliers');
        }

        const data: Supplier[] = await response.json();
        setSuppliers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching suppliers:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSuppliers();
  }, [type]);

  /**
   * Get supplier by name
   */
  const getSupplierByName = (name: string): Supplier | null => {
    return suppliers.find(s => s.name === name) || null;
  };

  /**
   * Get suppliers by type
   */
  const getSuppliersByType = (supplierType: string): Supplier[] => {
    return suppliers.filter(s => s.type === supplierType || s.type === 'BOTH');
  };

  return {
    suppliers,
    isLoading,
    error,
    getSupplierByName,
    getSuppliersByType
  };
}
