import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Custom hook to fetch door/drawer products from database
 * Returns products with multi-supplier pricing
 */
export function useDoorsDrawers() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/doors-drawers`);

        if (!response.ok) {
          throw new Error('Failed to fetch door/drawer products');
        }

        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching doors/drawers:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  /**
   * Get product by key
   * @param {string} key - Product key (e.g., 'largeDoors', 'smallDoors')
   * @returns {object|null} Product with pricing or null if not found
   */
  const getProductByKey = (key) => {
    return products.find(p => p.key === key) || null;
  };

  /**
   * Get products by category
   * @param {string} category - Category name ('doors' or 'drawers')
   * @returns {array} Array of products in the category
   */
  const getProductsByCategory = (category) => {
    return products.filter(p => p.category === category);
  };

  /**
   * Get products by type
   * @param {string} type - Product type ('door' or 'drawer_front')
   * @returns {array} Array of products of the type
   */
  const getProductsByType = (type) => {
    return products.filter(p => p.productType === type);
  };

  /**
   * Get preferred supplier pricing for a product
   * @param {string} key - Product key
   * @returns {object|null} Preferred pricing object or null
   */
  const getPreferredPricing = (key) => {
    const product = getProductByKey(key);
    if (!product || !product.pricing) return null;

    return product.pricing.find(p => p.isPreferred) || product.pricing[0] || null;
  };

  /**
   * Get all pricing options for a product
   * @param {string} key - Product key
   * @returns {array} Array of pricing objects from different suppliers
   */
  const getAllPricing = (key) => {
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
