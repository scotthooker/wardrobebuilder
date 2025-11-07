import { CheckCircle2, Ruler, Grid3x3, Package, DoorClosed } from 'lucide-react';

export function ReviewStep({ configuration }) {
  const totalSections = configuration.carcasses?.reduce((sum, c) => sum + c.sections.length, 0) || 0;

  const totalDrawers = configuration.carcasses?.reduce((sum, c) => {
    return sum + c.sections.reduce((sectionSum, s) => {
      return sectionSum + (s.type === 'drawers' ? (s.drawers || 0) : 0);
    }, 0);
  }, 0) || 0;

  const railCount = configuration.carcasses?.reduce((sum, c) => {
    return sum + c.sections.filter(s => s.type === 'rail' || s.type === 'double_rail').length;
  }, 0) || 0;

  const shelfCount = configuration.carcasses?.reduce((sum, c) => {
    return sum + c.sections.reduce((sectionSum, s) => {
      return sectionSum + (s.type === 'shelves' ? (s.shelfCount || 0) : 0);
    }, 0);
  }, 0) || 0;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Review Your Configuration</h2>
        </div>
        <p className="text-gray-600">
          Review all the details of your wardrobe configuration before proceeding to material selection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dimensions */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Ruler className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Dimensions</h3>
          </div>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600">Width:</dt>
              <dd className="font-semibold text-gray-900">{configuration.width}mm</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Height:</dt>
              <dd className="font-semibold text-gray-900">{configuration.height}mm</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Depth:</dt>
              <dd className="font-semibold text-gray-900">{configuration.depth}mm</dd>
            </div>
          </dl>
        </div>

        {/* Carcass Layout */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Grid3x3 className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Carcass Layout</h3>
          </div>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600">Number of Carcasses:</dt>
              <dd className="font-semibold text-gray-900">{configuration.numCarcasses}</dd>
            </div>
            {configuration.carcassWidths?.map((width, index) => (
              <div key={index} className="flex justify-between text-sm">
                <dt className="text-gray-500">Carcass {index + 1}:</dt>
                <dd className="text-gray-700">{width}mm</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Interior Details */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Interior Components</h3>
          </div>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600">Total Sections:</dt>
              <dd className="font-semibold text-gray-900">{totalSections}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Internal Drawers:</dt>
              <dd className="font-semibold text-gray-900">{totalDrawers}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Hanging Rails:</dt>
              <dd className="font-semibold text-gray-900">{railCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Shelves:</dt>
              <dd className="font-semibold text-gray-900">{shelfCount}</dd>
            </div>
          </dl>
        </div>

        {/* External Appearance */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <DoorClosed className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">External Appearance</h3>
          </div>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600">Door Style:</dt>
              <dd className="font-semibold text-gray-900 capitalize">{configuration.doors?.style || 'None'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Number of Doors:</dt>
              <dd className="font-semibold text-gray-900">{configuration.doors?.count || 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">External Drawers:</dt>
              <dd className="font-semibold text-gray-900">{configuration.externalDrawers?.count || 0}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Detailed Carcass Breakdown */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Detailed Carcass Breakdown</h3>
        <div className="space-y-4">
          {configuration.carcasses?.map((carcass, index) => (
            <div key={index} className="border-l-4 border-primary-500 pl-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Carcass {index + 1} ({configuration.carcassWidths[index]}mm wide)
              </h4>
              <div className="space-y-1">
                {carcass.sections.map((section, sIndex) => (
                  <div key={sIndex} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-6 text-center">{sIndex + 1}.</span>
                    <span className="flex-1">
                      {section.type === 'drawers' && `${section.drawers} Drawer${section.drawers !== 1 ? 's' : ''}`}
                      {section.type === 'shelves' && `${section.shelfCount} Shelf/Shelves`}
                      {section.type === 'rail' && 'Hanging Rail'}
                      {section.type === 'double_rail' && 'Double Hanging Rail'}
                      {section.type === 'empty' && 'Empty Space'}
                    </span>
                    <span className="text-gray-400">{section.height}mm</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Message */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900 mb-1">Configuration Complete!</h3>
            <p className="text-sm text-green-700">
              Your wardrobe configuration is ready. Click "Complete Build" to proceed to material selection and pricing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
