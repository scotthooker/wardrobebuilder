import { useState, useEffect } from 'react';
import { DoorClosed, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ButtonGroup, type ButtonGroupOption } from '@/components/ui/ButtonGroup';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// Types and Interfaces
type DoorStyle = 'hinged' | 'sliding' | 'none';

interface DoorStyleOption {
  id: DoorStyle;
  name: string;
  description: string;
  icon: string;
}

interface DoorZone {
  id: number;
  startCarcass: number;
  endCarcass: number;
  doorCount: number;
}

interface SectionDoorConfig {
  zones: DoorZone[];
}

interface DoorsConfig {
  style: DoorStyle;
  sectionConfigs: Record<number, SectionDoorConfig>;
}

interface InteriorSection {
  id: number;
  type: string;
  height: number;
  drawers?: number;
  shelfCount?: number;
  isExternal?: boolean;
}

interface Material {
  material: string;
  thickness: string;
  thicknessNum: number;
  price: number;
  sku: string;
}

interface Carcass {
  id: number;
  height: number;
  width: number;
  material?: Material;
  interiorSections?: InteriorSection[];
}

interface Section {
  id: number;
  width: number;
  carcasses: Carcass[];
}

interface Configuration {
  width: number;
  height: number;
  depth: number;
  sections: Section[];
  doors?: DoorsConfig;
}

interface DoorsDrawersStepProps {
  configuration: Configuration;
  updateConfiguration: (updates: Partial<Configuration>) => void;
}

// Constants
const DOOR_STYLES: DoorStyleOption[] = [
  { id: 'hinged', name: 'Hinged Doors', description: 'Traditional swing-open doors', icon: '🚪' },
  { id: 'sliding', name: 'Sliding Doors', description: 'Space-saving sliding panels', icon: '↔️' },
  { id: 'none', name: 'Open Front', description: 'No doors, open shelving', icon: '⬜' },
];

const DOUBLE_DOOR_WIDTH = 800; // Minimum width for double doors

export function DoorsDrawersStep({ configuration, updateConfiguration }: DoorsDrawersStepProps) {
  const [doorStyle, setDoorStyle] = useState<DoorStyle>(configuration.doors?.style || 'hinged');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionDoorConfigs, setSectionDoorConfigs] = useState<Record<number, SectionDoorConfig>>({});

  // Initialize door configurations from existing data or create defaults
  useEffect(() => {
    if (!configuration.sections) return;

    const configs: Record<number, SectionDoorConfig> = {};
    configuration.sections.forEach((section, sectionIdx) => {
      // Check if this section already has a door config
      if (configuration.doors?.sectionConfigs?.[sectionIdx]) {
        configs[sectionIdx] = configuration.doors.sectionConfigs[sectionIdx];
      } else {
        // Create default door zones based on external drawers
        configs[sectionIdx] = createDefaultDoorZones(section);
      }
    });

    setSectionDoorConfigs(configs);
  }, [configuration.sections]);

  const createDefaultDoorZones = (section: Section): SectionDoorConfig => {
    const zones: DoorZone[] = [];
    let currentZoneStart = 0;

    section.carcasses.forEach((carcass, carcassIdx) => {
      const hasExternalDrawers = carcass.interiorSections?.some(
        interior => interior.type === 'drawers' && interior.isExternal
      );

      if (hasExternalDrawers) {
        // If we have accumulated carcasses, create a door zone
        if (carcassIdx > currentZoneStart) {
          zones.push({
            id: zones.length,
            startCarcass: currentZoneStart,
            endCarcass: carcassIdx - 1,
            doorCount: section.width >= DOUBLE_DOOR_WIDTH ? 2 : 1
          });
        }

        // External drawer zone - no doors
        zones.push({
          id: zones.length,
          startCarcass: carcassIdx,
          endCarcass: carcassIdx,
          doorCount: 0 // No doors for external drawers
        });

        currentZoneStart = carcassIdx + 1;
      }
    });

    // Create zone for remaining carcasses
    if (currentZoneStart < section.carcasses.length) {
      zones.push({
        id: zones.length,
        startCarcass: currentZoneStart,
        endCarcass: section.carcasses.length - 1,
        doorCount: section.width >= DOUBLE_DOOR_WIDTH ? 2 : 1
      });
    }

    return { zones };
  };

  const handleDoorStyleChange = (style: DoorStyle) => {
    setDoorStyle(style);
    updateConfiguration({
      doors: {
        ...configuration.doors!,
        style,
        sectionConfigs: sectionDoorConfigs
      }
    });
  };

  const updateSectionConfig = (sectionIdx: number, newConfig: SectionDoorConfig) => {
    const updated = {
      ...sectionDoorConfigs,
      [sectionIdx]: newConfig
    };
    setSectionDoorConfigs(updated);

    updateConfiguration({
      doors: {
        ...configuration.doors!,
        style: doorStyle,
        sectionConfigs: updated
      }
    });
  };

  const addDoorZone = (sectionIdx: number) => {
    const config = sectionDoorConfigs[sectionIdx];
    const section = configuration.sections[sectionIdx];

    // Find the last zone's end
    const lastZone = config.zones[config.zones.length - 1];
    if (!lastZone || lastZone.endCarcass >= section.carcasses.length - 1) return;

    const newZone: DoorZone = {
      id: config.zones.length,
      startCarcass: lastZone.endCarcass + 1,
      endCarcass: section.carcasses.length - 1,
      doorCount: section.width >= DOUBLE_DOOR_WIDTH ? 2 : 1
    };

    updateSectionConfig(sectionIdx, {
      zones: [...config.zones, newZone]
    });
  };

  const removeDoorZone = (sectionIdx: number, zoneId: number) => {
    const config = sectionDoorConfigs[sectionIdx];
    if (config.zones.length <= 1) return;

    updateSectionConfig(sectionIdx, {
      zones: config.zones.filter(z => z.id !== zoneId)
    });
  };

  const updateZoneCarcassRange = (sectionIdx: number, zoneId: number, field: 'startCarcass' | 'endCarcass', value: string) => {
    const config = sectionDoorConfigs[sectionIdx];
    const updated = config.zones.map(zone => {
      if (zone.id === zoneId) {
        return { ...zone, [field]: parseInt(value) };
      }
      return zone;
    });

    updateSectionConfig(sectionIdx, { zones: updated });
  };

  const updateZoneDoorCount = (sectionIdx: number, zoneId: number, count: number) => {
    const config = sectionDoorConfigs[sectionIdx];
    const updated = config.zones.map(zone => {
      if (zone.id === zoneId) {
        return { ...zone, doorCount: count };
      }
      return zone;
    });

    updateSectionConfig(sectionIdx, { zones: updated });
  };

  const getCarcassHeight = (sectionIdx: number, startCarcass: number, endCarcass: number): number => {
    const section = configuration.sections[sectionIdx];
    return section.carcasses
      .slice(startCarcass, endCarcass + 1)
      .reduce((sum, c) => sum + c.height, 0);
  };

  if (!configuration.sections || configuration.sections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please complete the previous steps first.</p>
      </div>
    );
  }

  const currentSection = configuration.sections[currentSectionIndex];
  const currentConfig = sectionDoorConfigs[currentSectionIndex];

  // Convert door count options to ButtonGroup
  const doorCountOptions: ButtonGroupOption[] = [
    { value: 0, label: 'None' },
    { value: 1, label: '1' },
    { value: 2, label: '2' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Doors & Front Configuration</h2>
        <p className="text-gray-600">
          Configure doors for each section. Sections with external drawers cannot have doors over those carcasses.
        </p>
      </div>

      {/* Door Style Selection */}
      <Card variant="default" padding="md">
        <CardHeader>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Door Style
          </label>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DOOR_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => handleDoorStyleChange(style.id)}
                className={`p-6 rounded-lg border-2 transition text-left ${
                  doorStyle === style.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="text-4xl mb-3">{style.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{style.name}</h3>
                <p className="text-sm text-gray-600">{style.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {doorStyle !== 'none' && (
        <>
          {/* Section Navigation */}
          <Card variant="glass" padding="md" className="bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">
                    Configure Section {currentSectionIndex + 1} of {configuration.sections.length}
                  </h3>
                  <Badge variant="primary" size="sm">
                    Section {currentSectionIndex + 1}
                  </Badge>
                </div>
                <ButtonGroup
                  size="sm"
                  options={[
                    { value: 'prev', label: '<', disabled: currentSectionIndex === 0 },
                    { value: 'next', label: '>', disabled: currentSectionIndex === configuration.sections.length - 1 }
                  ]}
                  value={undefined}
                  onChange={(value) => {
                    if (value === 'prev') {
                      setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1));
                    } else if (value === 'next') {
                      setCurrentSectionIndex(Math.min(configuration.sections.length - 1, currentSectionIndex + 1));
                    }
                  }}
                />
              </div>

              <div className="text-sm text-gray-600 mb-4">
                Section Width: {currentSection.width}mm • {currentSection.carcasses.length} Carcass{currentSection.carcasses.length !== 1 ? 'es' : ''}
              </div>

              {/* Visual Preview of Current Section */}
              <div className="bg-gray-800 rounded-lg p-4 mb-6" style={{ height: '400px' }}>
                <div className="h-full flex flex-col gap-1 relative">
                  {currentConfig?.zones.map((zone) => {
                    const zoneHeight = getCarcassHeight(currentSectionIndex, zone.startCarcass, zone.endCarcass);
                    const zoneHeightPercent = (zoneHeight / configuration.height) * 100;
                    const isExternalDrawerZone = zone.doorCount === 0;

                    return (
                      <div
                        key={zone.id}
                        className="relative"
                        style={{ flex: `0 0 ${zoneHeightPercent}%` }}
                      >
                        {isExternalDrawerZone ? (
                          <div className="h-full bg-amber-200 border-4 border-amber-500 rounded flex items-center justify-center">
                            <div className="text-center text-amber-900">
                              <div className="text-2xl mb-2">🗄️</div>
                              <div className="text-sm font-semibold">External Drawers</div>
                              <div className="text-xs">Carcass {zone.startCarcass + 1}</div>
                            </div>
                          </div>
                        ) : zone.doorCount === 1 ? (
                          <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-gray-400 rounded flex items-center justify-center">
                            <div className="text-center">
                              <DoorClosed className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                              <div className="text-sm text-gray-700 font-semibold">1 Door</div>
                              <div className="text-xs text-gray-600">Carcass {zone.startCarcass + 1}{zone.endCarcass !== zone.startCarcass ? ` - ${zone.endCarcass + 1}` : ''}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex gap-1">
                            <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-gray-400 rounded flex items-center justify-center">
                              <div className="text-center">
                                <DoorClosed className="w-8 h-8 text-gray-600 mx-auto mb-1" />
                                <div className="text-xs text-gray-700 font-semibold">Door 1</div>
                              </div>
                            </div>
                            <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-gray-400 rounded flex items-center justify-center">
                              <div className="text-center">
                                <DoorClosed className="w-8 h-8 text-gray-600 mx-auto mb-1" />
                                <div className="text-xs text-gray-700 font-semibold">Door 2</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Door Zone Configuration */}
              <Card variant="default" padding="md">
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Door Zones</h4>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={() => addDoorZone(currentSectionIndex)}
                    >
                      Add Zone
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {currentConfig?.zones.map((zone, idx) => {
                      const isExternalDrawerZone = zone.doorCount === 0;

                      return (
                        <Card
                          key={zone.id}
                          variant={isExternalDrawerZone ? 'outline' : 'default'}
                          padding="sm"
                          className={isExternalDrawerZone ? 'border-amber-200 bg-amber-50' : ''}
                        >
                          <CardContent>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-gray-900">Zone {idx + 1}</h5>
                                {isExternalDrawerZone && (
                                  <Badge variant="orange" size="sm">
                                    External Drawers
                                  </Badge>
                                )}
                              </div>
                              {currentConfig.zones.length > 1 && !isExternalDrawerZone && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeDoorZone(currentSectionIndex, zone.id)}
                                >
                                  <X className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Start Carcass</label>
                                <select
                                  value={zone.startCarcass}
                                  onChange={(e) => updateZoneCarcassRange(currentSectionIndex, zone.id, 'startCarcass', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  disabled={isExternalDrawerZone}
                                >
                                  {currentSection.carcasses.map((_, i) => (
                                    <option key={i} value={i}>Carcass {i + 1}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs text-gray-600 mb-1">End Carcass</label>
                                <select
                                  value={zone.endCarcass}
                                  onChange={(e) => updateZoneCarcassRange(currentSectionIndex, zone.id, 'endCarcass', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  disabled={isExternalDrawerZone}
                                >
                                  {currentSection.carcasses.map((_, i) => (
                                    <option key={i} value={i} disabled={i < zone.startCarcass}>
                                      Carcass {i + 1}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Door Count</label>
                                <ButtonGroup
                                  size="sm"
                                  options={doorCountOptions.map(opt => ({
                                    ...opt,
                                    disabled: isExternalDrawerZone || (opt.value === 2 && currentSection.width < DOUBLE_DOOR_WIDTH)
                                  }))}
                                  value={zone.doorCount}
                                  onChange={(value) => updateZoneDoorCount(currentSectionIndex, zone.id, Number(value))}
                                />
                                {currentSection.width < DOUBLE_DOOR_WIDTH && (
                                  <p className="text-xs text-gray-500 mt-1">Section too narrow for 2 doors</p>
                                )}
                              </div>
                            </div>

                            <div className="mt-2 text-xs text-gray-600">
                              Height: {getCarcassHeight(currentSectionIndex, zone.startCarcass, zone.endCarcass)}mm
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </>
      )}

      {/* Summary */}
      <Card variant="default" padding="md" className="bg-blue-50 border-2 border-blue-200">
        <CardContent>
          <h3 className="font-semibold text-blue-900 mb-3">Configuration Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Door Style:</span>
              <div className="text-lg font-bold text-blue-900">
                {DOOR_STYLES.find(s => s.id === doorStyle)?.name}
              </div>
            </div>
            <div>
              <span className="text-blue-700">Total Sections:</span>
              <div className="text-lg font-bold text-blue-900">{configuration.sections.length}</div>
            </div>
            <div>
              <span className="text-blue-700">Total Doors:</span>
              <div className="text-lg font-bold text-blue-900">
                {Object.values(sectionDoorConfigs).reduce((sum, config) =>
                  sum + (config?.zones || []).reduce((zoneSum, zone) => zoneSum + zone.doorCount, 0), 0
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
