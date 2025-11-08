import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Build } from '@/components/builds/BuildCard';

/**
 * Global state store for wardrobe builds
 * Using Zustand for lightweight, performant state management
 * Database-powered - no more static JSON files
 */

// State interface
interface BuildsState {
  // === State ===
  builds: Build[];
  selectedBuildIds: Array<string | number>;
  editingBuildId: string | number | null;
  isEditing: boolean;
  isLoading: boolean;
  error: string | null;
}

// Actions interface
interface BuildsActions {
  // === Data Loading Actions ===
  setBuilds: (builds: Build[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // === Build Selection Actions ===
  toggleBuildSelection: (id: string | number) => void;
  selectBuild: (id: string | number) => void;
  deselectBuild: (id: string | number) => void;
  clearSelection: () => void;
  selectAll: () => void;

  // === Editing Actions ===
  startEditing: (id: string | number) => void;
  stopEditing: () => void;

  // === Build Modification Actions ===
  updateBuild: (id: string | number, updates: Partial<Build>) => void;
  addBuild: (build: Build) => void;
  removeBuild: (id: string | number) => void;

  // === Utility Actions ===
  getBuildById: (id: string | number) => Build | undefined;
  getSelectedBuilds: () => Build[];

  // === Export Actions ===
  exportState: () => { builds: Build[] };
  exportSelectedBuilds: () => Build[];

  // === Reset Action ===
  reset: () => void;
}

// Combined store type
type BuildsStore = BuildsState & BuildsActions;

// Persisted state type (only what we persist)
interface PersistedState {
  selectedBuildIds: Array<string | number>;
}

export const useBuildsStore = create<BuildsStore>()(
  persist(
    (set, get) => ({
      // === State ===
      builds: [],
      selectedBuildIds: [],
      editingBuildId: null,
      isEditing: false,
      isLoading: true,
      error: null,

      // === Data Loading Actions ===
      setBuilds: (builds) => set({ builds, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // === Build Selection Actions ===
      toggleBuildSelection: (id) => set((state) => ({
        selectedBuildIds: state.selectedBuildIds.includes(id)
          ? state.selectedBuildIds.filter(bid => bid !== id)
          : [...state.selectedBuildIds, id]
      })),

      selectBuild: (id) => set((state) => ({
        selectedBuildIds: state.selectedBuildIds.includes(id)
          ? state.selectedBuildIds
          : [...state.selectedBuildIds, id]
      })),

      deselectBuild: (id) => set((state) => ({
        selectedBuildIds: state.selectedBuildIds.filter(bid => bid !== id)
      })),

      clearSelection: () => set({ selectedBuildIds: [] }),

      selectAll: () => set((state) => ({
        selectedBuildIds: state.builds.map(b => b.id)
      })),

      // === Editing Actions ===
      startEditing: (id) => set({ editingBuildId: id, isEditing: true }),

      stopEditing: () => set({ editingBuildId: null, isEditing: false }),

      // === Build Modification Actions ===
      updateBuild: (id, updates) => set((state) => ({
        builds: state.builds.map(b =>
          b.id === id ? { ...b, ...updates } : b
        )
      })),

      addBuild: (build) => set((state) => ({
        builds: [...state.builds, build]
      })),

      removeBuild: (id) => set((state) => ({
        builds: state.builds.filter(b => b.id !== id),
        selectedBuildIds: state.selectedBuildIds.filter(bid => bid !== id)
      })),

      // === Utility Actions ===
      getBuildById: (id) => {
        const state = get();
        return state.builds.find(b => b.id === id);
      },

      getSelectedBuilds: () => {
        const state = get();
        return state.builds.filter(b => state.selectedBuildIds.includes(b.id));
      },

      // === Export Actions ===
      exportState: () => {
        const state = get();
        return {
          builds: state.builds
        };
      },

      exportSelectedBuilds: () => {
        const state = get();
        return state.getSelectedBuilds();
      },

      // === Reset Action ===
      reset: () => set({
        builds: [],
        selectedBuildIds: [],
        editingBuildId: null,
        isEditing: false,
        isLoading: true,
        error: null
      })
    }),
    {
      name: 'wardrobe-builder-storage',
      // Only persist user selections, not the full state
      partialize: (state): PersistedState => ({
        selectedBuildIds: state.selectedBuildIds
      })
    }
  )
);
