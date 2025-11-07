import { Ruler } from 'lucide-react';

const COMMON_HEIGHTS = [2100, 2400, 2700, 3000];
const COMMON_WIDTHS = [1200, 1800, 2400, 3000, 3600];
const COMMON_DEPTHS = [450, 550, 600, 650];

export function DimensionsStep({ configuration, updateConfiguration }) {
  const handleDimensionChange = (dimension, value) => {
    updateConfiguration({ [dimension]: parseInt(value) });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wardrobe Dimensions</h2>
        <p className="text-gray-600">
          Select the overall dimensions of your wardrobe. You can choose from common sizes or enter custom measurements.
        </p>
      </div>

      {/* Visual Preview */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Simple wardrobe silhouette */}
            <div
              className="bg-white border-4 border-gray-800 rounded-lg shadow-2xl"
              style={{
                width: `${Math.min(configuration.width / 10, 300)}px`,
                height: `${Math.min(configuration.height / 10, 300)}px`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {configuration.width} × {configuration.height}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Depth: {configuration.depth}mm
                  </div>
                </div>
              </div>
            </div>

            {/* Dimension labels */}
            <div className="absolute -bottom-8 left-0 right-0 flex justify-center items-center gap-2 text-sm text-gray-600">
              <Ruler className="w-4 h-4" />
              <span>Width: {configuration.width}mm</span>
            </div>
            <div className="absolute -right-20 top-0 bottom-0 flex flex-col justify-center items-center gap-2 text-sm text-gray-600">
              <Ruler className="w-4 h-4 transform rotate-90" />
              <span className="writing-mode-vertical-rl">Height: {configuration.height}mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Width Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Width (mm)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          {COMMON_WIDTHS.map(width => (
            <button
              key={width}
              onClick={() => handleDimensionChange('width', width)}
              className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                configuration.width === width
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              {width}mm
            </button>
          ))}
        </div>
        <input
          type="number"
          value={configuration.width}
          onChange={(e) => handleDimensionChange('width', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          placeholder="Custom width..."
          min="600"
          max="6000"
          step="100"
        />
      </div>

      {/* Height Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Height (mm)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {COMMON_HEIGHTS.map(height => (
            <button
              key={height}
              onClick={() => handleDimensionChange('height', height)}
              className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                configuration.height === height
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              {height}mm
            </button>
          ))}
        </div>
        <input
          type="number"
          value={configuration.height}
          onChange={(e) => handleDimensionChange('height', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          placeholder="Custom height..."
          min="1800"
          max="3600"
          step="100"
        />
      </div>

      {/* Depth Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Depth (mm)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {COMMON_DEPTHS.map(depth => (
            <button
              key={depth}
              onClick={() => handleDimensionChange('depth', depth)}
              className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                configuration.depth === depth
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              {depth}mm
            </button>
          ))}
        </div>
        <input
          type="number"
          value={configuration.depth}
          onChange={(e) => handleDimensionChange('depth', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          placeholder="Custom depth..."
          min="400"
          max="800"
          step="50"
        />
      </div>

      {/* Summary Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Width:</span>
            <div className="text-lg font-bold text-blue-900">{configuration.width}mm</div>
          </div>
          <div>
            <span className="text-blue-700">Height:</span>
            <div className="text-lg font-bold text-blue-900">{configuration.height}mm</div>
          </div>
          <div>
            <span className="text-blue-700">Depth:</span>
            <div className="text-lg font-bold text-blue-900">{configuration.depth}mm</div>
          </div>
        </div>
      </div>
    </div>
  );
}
