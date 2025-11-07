import { ChevronLeft } from 'lucide-react';

const SECTION_TYPES = {
  DRAWERS: { id: 'drawers', name: 'Drawers', icon: '🗄️' },
  RAIL: { id: 'rail', name: 'Hanging Rail', icon: '👔' },
  SHELVES: { id: 'shelves', name: 'Shelves', icon: '📚' },
  DOUBLE_RAIL: { id: 'double_rail', name: 'Double Rail', icon: '👔👔' },
  EMPTY: { id: 'empty', name: 'Empty Space', icon: '⬜' },
};

export function InteriorDesignStep({ configuration, updateConfiguration }) {
  if (!configuration.sections || configuration.sections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          Please complete the Carcass Layout step first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Interior Design Summary</h2>
        <p className="text-gray-600">
          All interior configurations were completed in the previous step. Review your setup below.
        </p>
      </div>

      {/* Visual Summary */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-8">
        <h3 className="font-semibold text-gray-900 mb-4">Wardrobe Layout with Interiors</h3>

        {/* Visual Grid */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6" style={{ minHeight: '500px' }}>
          <div className="flex gap-2 h-[500px]">
            {configuration.sections.map((section, sectionIdx) => (
              <div
                key={section.id}
                className="bg-gray-700 rounded flex flex-col gap-2 p-2"
                style={{ flex: `0 0 ${(section.width / configuration.width) * 100}%` }}
              >
                <div className="text-center text-white text-xs font-semibold mb-1">
                  Section {sectionIdx + 1}
                </div>
                {section.carcasses.map((carcass, carcassIdx) => (
                  <div
                    key={carcass.id}
                    className="rounded"
                    style={{ flex: `0 0 ${(carcass.height / configuration.height) * 100}%` }}
                  >
                    {carcass.interiorSections && carcass.interiorSections.length > 0 ? (
                      <div className="h-full flex flex-col">
                        {carcass.interiorSections.map((interior) => (
                          <div
                            key={interior.id}
                            className={`border-b border-gray-400 last:border-b-0 flex items-center justify-center relative ${
                              interior.isExternal ? 'border-2 border-amber-500' : ''
                            }`}
                            style={{
                              flex: `0 0 ${(interior.height / carcass.height) * 100}%`,
                              backgroundColor:
                                interior.type === 'drawers' ? '#fef3c7' :
                                interior.type === 'rail' ? '#dbeafe' :
                                interior.type === 'double_rail' ? '#bfdbfe' :
                                interior.type === 'shelves' ? '#fce7f3' : '#f3f4f6'
                            }}
                          >
                            {interior.isExternal && (
                              <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold text-[10px]">
                                EXT
                              </div>
                            )}
                            <span className="text-xl">{SECTION_TYPES[interior.type.toUpperCase()]?.icon}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full bg-white flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Empty</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Detail Summary */}
        <div className="bg-white rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Interior Components by Section</h4>
          <div className="space-y-4">
            {configuration.sections.map((section, sectionIdx) => (
              <div key={section.id} className="border-2 border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">
                  Section {sectionIdx + 1} ({section.width}mm wide)
                </h5>
                <div className="space-y-2">
                  {section.carcasses.map((carcass, carcassIdx) => (
                    <div key={carcass.id} className="pl-4 border-l-2 border-gray-300">
                      <div className="font-medium text-sm text-gray-700 mb-1">
                        Carcass {carcassIdx + 1} ({carcass.height}mm tall)
                        {carcass.material && (
                          <span className="ml-2 text-xs text-gray-600">
                            - {carcass.material.material} ({carcass.material.thickness})
                          </span>
                        )}
                      </div>
                      {carcass.interiorSections && carcass.interiorSections.length > 0 ? (
                        <div className="space-y-1 text-sm text-gray-600">
                          {carcass.interiorSections.map((interior, idx) => (
                            <div key={interior.id} className="flex items-center gap-2">
                              <span>{SECTION_TYPES[interior.type.toUpperCase()]?.icon}</span>
                              <span>{SECTION_TYPES[interior.type.toUpperCase()]?.name}</span>
                              <span className="text-gray-500">- {interior.height}mm</span>
                              {interior.drawers && (
                                <span className="text-gray-500">({interior.drawers} drawers)</span>
                              )}
                              {interior.shelfCount && (
                                <span className="text-gray-500">({interior.shelfCount} shelves)</span>
                              )}
                              {interior.isExternal && (
                                <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full font-semibold">
                                  EXTERNAL
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">Empty carcass</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">
              {configuration.sections.reduce((sum, s) =>
                sum + s.carcasses.reduce((cSum, c) =>
                  cSum + (c.interiorSections?.filter(i => i.type === 'drawers').length || 0), 0
                ), 0
              )}
            </div>
            <div className="text-sm text-blue-700">Drawer Sections</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">
              {configuration.sections.reduce((sum, s) =>
                sum + s.carcasses.reduce((cSum, c) =>
                  cSum + (c.interiorSections?.filter(i => i.type === 'shelves').length || 0), 0
                ), 0
              )}
            </div>
            <div className="text-sm text-green-700">Shelf Sections</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-900">
              {configuration.sections.reduce((sum, s) =>
                sum + s.carcasses.reduce((cSum, c) =>
                  cSum + (c.interiorSections?.filter(i => i.type === 'rail' || i.type === 'double_rail').length || 0), 0
                ), 0
              )}
            </div>
            <div className="text-sm text-purple-700">Hanging Rails</div>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-900">
              {configuration.sections.reduce((sum, s) =>
                sum + s.carcasses.filter(c => !c.interiorSections || c.interiorSections.length === 0).length, 0
              )}
            </div>
            <div className="text-sm text-amber-700">Empty Carcasses</div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded">
            <p className="text-sm text-amber-900">
              <strong>External Drawers:</strong> Drawers marked as "EXTERNAL" have visible fronts on the wardrobe exterior. These will affect door heights in the next step, as doors above or below them will be shortened to accommodate the drawer fronts.
            </p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> To make changes to any interior configuration, use the Back button to return to the Carcass Layout step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
