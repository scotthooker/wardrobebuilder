import { useEffect } from 'react';
import { useBuildsStore } from '../store/buildsStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Custom hook to load and manage build data from database
 * Fetches builds from the PostgreSQL database via API
 */
export function useBuilds() {
  const {
    builds,
    isLoading,
    error,
    setBuilds,
    setLoading,
    setError
  } = useBuildsStore();

  useEffect(() => {
    async function loadBuilds() {
      try {
        setLoading(true);

        console.log('Loading builds from database...');
        const response = await fetch(`${API_URL}/api/builds`);

        if (!response.ok) {
          throw new Error('Failed to load builds from database');
        }

        const buildsData = await response.json();
        setBuilds(buildsData);
        console.log(`✅ Loaded ${buildsData.length} builds from database`);
        setError(null);

      } catch (err) {
        console.error('Failed to load build data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    // Only load if not already loaded
    if (!builds.length && !error && isLoading) {
      loadBuilds();
    }
  }, []); // Empty dependency array - only run once

  return {
    builds,
    isLoading,
    error
  };
}

/**
 * Hook to get a single build by ID
 */
export function useBuild(id) {
  const builds = useBuildsStore((state) => state.builds);
  const build = builds.find(b => b.id === parseInt(id));

  return {
    build,
    isLoading: !build,
    error: build ? null : 'Build not found'
  };
}

/**
 * Hook to get selected builds
 */
export function useSelectedBuilds() {
  const selectedBuildIds = useBuildsStore((state) => state.selectedBuildIds);
  const builds = useBuildsStore((state) => state.builds);

  const selectedBuilds = builds.filter(b => selectedBuildIds.includes(b.id));

  return {
    selectedBuilds,
    selectedCount: selectedBuilds.length,
    hasSelection: selectedBuilds.length > 0
  };
}
