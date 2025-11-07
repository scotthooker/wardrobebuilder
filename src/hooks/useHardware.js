import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Custom hook to fetch hardware items from database
 * Returns all active hardware items with fixed pricing
 */
export function useHardware() {
  const [hardware, setHardware] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHardware() {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/hardware`);

        if (!response.ok) {
          throw new Error('Failed to fetch hardware items');
        }

        const data = await response.json();
        setHardware(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching hardware:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHardware();
  }, []);

  /**
   * Get hardware item by key
   * @param {string} key - Hardware item key (e.g., 'hinges', 'drawerRunners')
   * @returns {object|null} Hardware item or null if not found
   */
  const getHardwareByKey = (key) => {
    return hardware.find(item => item.key === key) || null;
  };

  /**
   * Get hardware items by category
   * @param {string} category - Category name
   * @returns {array} Array of hardware items in the category
   */
  const getHardwareByCategory = (category) => {
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
