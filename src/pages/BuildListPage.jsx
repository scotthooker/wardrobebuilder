import { useBuilds } from '../hooks/useBuilds';
import { useBuildsStore } from '../store/buildsStore';
import { BuildCard } from '../components/builds/BuildCard';
import { ExportButton } from '../components/shared/ExportButton';
import { Loader2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BuildListPage() {
  const navigate = useNavigate();
  const { builds, isLoading, error } = useBuilds();
  const { selectedBuildIds, toggleBuildSelection, startEditing } = useBuildsStore();

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in-up">
          <div className="glass-effect border-2 border-red-200 rounded-2xl p-8 max-w-md shadow-premium">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-3">Error Loading Builds</h2>
            <p className="text-red-700 leading-relaxed">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-premium mt-6 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-lg font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="glass-effect rounded-2xl shadow-premium p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-gray-900">
              All Wardrobe Builds
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed max-w-2xl">
              Explore <span className="font-semibold text-primary-700">{builds.length}</span> premium wardrobe designs.
              Select builds to compare or click to view details.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/builder/new')}
              className="btn-premium flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create New Build
            </button>
            <ExportButton builds={builds} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-5 border border-primary-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-primary-900">
              {builds.length}
            </div>
            <div className="text-sm font-medium text-primary-800 mt-1">Total Builds</div>
          </div>
          <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl p-5 border border-secondary-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-secondary-900">
              {builds.filter(b => b.costs.savingsVsBudget >= 0).length}
            </div>
            <div className="text-sm font-medium text-secondary-800 mt-1">Under Budget</div>
          </div>
          <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl p-5 border border-accent-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-accent-900">
              {selectedBuildIds.length}
            </div>
            <div className="text-sm font-medium text-accent-800 mt-1">Selected</div>
          </div>
          <div className="bg-gradient-to-br from-wood-50 to-wood-100 rounded-xl p-5 border border-wood-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-wood-900">
              {Math.round(builds.reduce((sum, b) => sum + b.costs.grandTotal, 0) / builds.length)}
            </div>
            <div className="text-sm font-medium text-wood-800 mt-1">Avg. Cost (£)</div>
          </div>
        </div>
      </div>

      {/* Build Grid - Wider cards, fewer per row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {builds.map(build => (
          <BuildCard
            key={build.id}
            build={build}
            isSelected={selectedBuildIds.includes(build.id)}
            onToggleSelect={toggleBuildSelection}
            onEdit={startEditing}
          />
        ))}
      </div>

      {/* Empty State (shouldn't normally show) */}
      {builds.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No builds found.</p>
        </div>
      )}
    </div>
  );
}
