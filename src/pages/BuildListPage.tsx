/**
 * BuildListPage Component
 * Displays all furniture builds (wardrobes and desks) with filtering and stats
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
// @ts-ignore - useBuilds is JS file without type declarations
import { useBuilds } from '../hooks/useBuilds';
// @ts-ignore - buildsStore is JS file without type declarations
import { useBuildsStore } from '../store/buildsStore';
import { BuildCard } from '../components/builds/BuildCard';
// @ts-ignore - ExportButton is JSX file without type declarations
import { ExportButton } from '../components/shared/ExportButton';
import { Button } from '../components/ui/Button';
import { ButtonGroup, type ButtonGroupOption } from '../components/ui/ButtonGroup';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { Build } from '../components/builds/BuildCard';

// Furniture type filter options
type FurnitureTypeFilter = 'all' | 'wardrobe' | 'desk';

interface StatsCardProps {
  value: number;
  label: string;
  variant: 'primary' | 'secondary' | 'accent' | 'wood';
}

function StatsCard({ value, label, variant }: StatsCardProps) {
  const variantClasses = {
    primary: 'from-primary-50 to-primary-100 border-primary-200 text-primary-900',
    secondary: 'from-secondary-50 to-secondary-100 border-secondary-200 text-secondary-900',
    accent: 'from-accent-50 to-accent-100 border-accent-200 text-accent-900',
    wood: 'from-wood-50 to-wood-100 border-wood-200 text-wood-900',
  };

  const labelClasses = {
    primary: 'text-primary-800',
    secondary: 'text-secondary-800',
    accent: 'text-accent-800',
    wood: 'text-wood-800',
  };

  return (
    <div
      className={`
        bg-gradient-to-br rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow
        ${variantClasses[variant]}
      `}
    >
      <div className="text-3xl font-bold">
        {value}
      </div>
      <div className={`text-sm font-medium mt-1 ${labelClasses[variant]}`}>
        {label}
      </div>
    </div>
  );
}

export function BuildListPage() {
  const navigate = useNavigate();
  const { builds, isLoading, error } = useBuilds();
  const { selectedBuildIds, toggleBuildSelection, startEditing } = useBuildsStore();
  const [furnitureTypeFilter, setFurnitureTypeFilter] = useState<FurnitureTypeFilter>('all');

  // Filter builds by furniture type
  const filteredBuilds: Build[] = furnitureTypeFilter === 'all'
    ? builds
    : builds.filter((b: Build) => (b.furnitureType || 'wardrobe') === furnitureTypeFilter);

  // Count by type
  const wardrobeCount = builds.filter((b: Build) => (b.furnitureType || 'wardrobe') === 'wardrobe').length;
  const deskCount = builds.filter((b: Build) => b.furnitureType === 'desk').length;

  // Button group options
  const filterOptions: ButtonGroupOption[] = [
    { value: 'all', label: `All (${builds.length})` },
    { value: 'wardrobe', label: `Wardrobes (${wardrobeCount})` },
    { value: 'desk', label: `Desks (${deskCount})` },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-primary-600 mx-auto mb-4" />
            <div className="absolute inset-0 w-16 h-16 mx-auto animate-ping opacity-20">
              <div className="w-full h-full rounded-full bg-primary-400"></div>
            </div>
          </div>
          <p className="text-gray-700 font-medium text-lg">Loading builds...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing your premium wardrobes</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in-up">
          <Card
            variant="glass"
            padding="lg"
            className="border-2 border-red-200 max-w-md shadow-premium"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-3">Error Loading Builds</h2>
            <p className="text-red-700 leading-relaxed">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
              size="lg"
              className="mt-6 bg-gradient-to-r from-red-600 to-red-700"
            >
              Retry
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Get stats label based on filter
  const getStatsLabel = (): string => {
    if (furnitureTypeFilter === 'all') return 'Total';
    if (furnitureTypeFilter === 'wardrobe') return 'Wardrobes';
    return 'Desks';
  };

  // Calculate average cost
  const averageCost = filteredBuilds.length > 0
    ? Math.round(filteredBuilds.reduce((sum, b) => sum + b.costs.grandTotal, 0) / filteredBuilds.length)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <Card variant="glass" padding="lg" className="shadow-premium">
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-gray-900">
              All Furniture Builds
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed max-w-2xl">
              Explore <Badge variant="primary" size="md">{builds.length}</Badge> premium furniture designs
              ({wardrobeCount} wardrobes, {deskCount} desks).
              Select builds to compare or click to view details.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/builder/new')}
              variant="premium"
              size="lg"
              leftIcon={<Plus className="w-5 h-5" />}
              className="shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300"
            >
              Create New Build
            </Button>
            {/* @ts-ignore - ExportButton props are optional (builds OR build) */}
            <ExportButton builds={builds} />
          </div>
        </div>

        {/* Furniture Type Filter */}
        <div className="mt-6">
          <ButtonGroup
            options={filterOptions}
            value={furnitureTypeFilter}
            onChange={(value) => setFurnitureTypeFilter(value as FurnitureTypeFilter)}
            size="md"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <StatsCard
            value={filteredBuilds.length}
            label={getStatsLabel()}
            variant="primary"
          />
          <StatsCard
            value={filteredBuilds.filter(b => b.costs.savingsVsBudget >= 0).length}
            label="Under Budget"
            variant="secondary"
          />
          <StatsCard
            value={selectedBuildIds.length}
            label="Selected"
            variant="accent"
          />
          <StatsCard
            value={averageCost}
            label="Avg. Cost (£)"
            variant="wood"
          />
        </div>
      </Card>

      {/* Build Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredBuilds.map(build => (
          <BuildCard
            key={build.id}
            build={build}
            isSelected={selectedBuildIds.includes(build.id)}
            onToggleSelect={toggleBuildSelection}
            onEdit={startEditing}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredBuilds.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No {furnitureTypeFilter === 'all' ? '' : furnitureTypeFilter} builds found.
          </p>
        </div>
      )}
    </div>
  );
}
