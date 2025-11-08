import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Type definitions
export interface HardwareItem {
  key: string;
  category: string;
  name?: string;
  description?: string;
  price?: number;
  unitPrice?: number;
}

export interface UseHardwareReturn {
  hardware: HardwareItem[];
  isLoading: boolean;
  error: string | null;
  getHardwareByKey: (key: string) => HardwareItem | null;
  getHardwareByCategory: (category: string) => HardwareItem[];
}

/**
 * Custom hook to fetch hardware items from database
 * Returns all active hardware items with fixed pricing
 */
export function useHardware(): UseHardwareReturn {
  const [hardware, setHardware] = useState<HardwareItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHardware(): Promise<void> {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/hardware`);

        if (!response.ok) {
          throw new Error('Failed to fetch hardware items');
        }

        const data: HardwareItem[] = await response.json();
        setHardware(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching hardware:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHardware();
  }, []);

  /**
   * Get hardware item by key
   */
  const getHardwareByKey = (key: string): HardwareItem | null => {
    return hardware.find(item => item.key === key) || null;
  };

  /**
   * Get hardware items by category
   */
  const getHardwareByCategory = (category: string): HardwareItem[] => {
    return hardware.filter(item => item.category === category);
  };

  return {
    hardware,
    isLoading,
    error,
    getHardwareByKey,
    getHardwareByCategory
  };
}
