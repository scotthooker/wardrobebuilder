import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Custom hook to fetch suppliers from database
 * @param {string} type - Optional filter by type ('SHEET_GOODS', 'DOORS_DRAWERS', or null for all)
 */
export function useSuppliers(type = null) {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSuppliers() {
      try {
        setIsLoading(true);
        const url = type
          ? `${API_URL}/api/suppliers?type=${type}`
          : `${API_URL}/api/suppliers`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch suppliers');
        }

        const data = await response.json();
        setSuppliers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching suppliers:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSuppliers();
  }, [type]);

  /**
   * Get supplier by name
   * @param {string} name - Supplier name
   * @returns {object|null} Supplier or null if not found
   */
  const getSupplierByName = (name) => {
    return suppliers.find(s => s.name === name) || null;
  };

  /**
   * Get suppliers by type
   * @param {string} supplierType - Supplier type
   * @returns {array} Array of suppliers of the type
   */
  const getSuppliersByType = (supplierType) => {
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
