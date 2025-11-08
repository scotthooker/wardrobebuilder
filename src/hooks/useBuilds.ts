import { useEffect } from 'react';
import { useBuildsStore } from '../store/buildsStore';
import type { Build } from '@/components/builds/BuildCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Hook return types
export interface UseBuildsReturn {
  builds: Build[];
  isLoading: boolean;
  error: string | null;
}

export interface UseBuildReturn {
  build: Build | undefined;
  isLoading: boolean;
  error: string | null;
}

export interface UseSelectedBuildsReturn {
  selectedBuilds: Build[];
  selectedCount: number;
  hasSelection: boolean;
}

/**
 * Custom hook to load and manage build data from database
 * Fetches builds from the PostgreSQL database via API
 */
export function useBuilds(): UseBuildsReturn {
  const {
    builds,
    isLoading,
    error,
    setBuilds,
    setLoading,
    setError
  } = useBuildsStore();

  useEffect(() => {
    async function loadBuilds(): Promise<void> {
      try {
        setLoading(true);

        console.log('Loading builds from database...');
        const response = await fetch(`${API_URL}/api/builds`);

        if (!response.ok) {
          throw new Error('Failed to load builds from database');
        }

        const buildsData: Build[] = await response.json();
        setBuilds(buildsData);
        console.log(`✅ Loaded ${buildsData.length} builds from database`);
        setError(null);

      } catch (err) {
        console.error('Failed to load build data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setLoading(false);
      }
    }

    // Only load if not already loaded (no builds and no error)
    if (builds.length === 0 && !error) {
      loadBuilds();
    } else if (builds.length > 0) {
      // If we have builds, ensure loading is false
      setLoading(false);
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
export function useBuild(id: string | number): UseBuildReturn {
  const builds = useBuildsStore((state) => state.builds);
  const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
  const build = builds.find(b => b.id === parsedId);

  return {
    build,
    isLoading: !build,
    error: build ? null : 'Build not found'
  };
}

/**
 * Hook to get selected builds
 */
export function useSelectedBuilds(): UseSelectedBuildsReturn {
  const selectedBuildIds = useBuildsStore((state) => state.selectedBuildIds);
  const builds = useBuildsStore((state) => state.builds);

  const selectedBuilds = builds.filter(b => selectedBuildIds.includes(b.id));

  return {
    selectedBuilds,
    selectedCount: selectedBuilds.length,
    hasSelection: selectedBuilds.length > 0
  };
}
