import { useState, useEffect } from 'react';
import { DESK_BASE_TYPES, DESK_DEFAULTS } from '@/constants/deskSectionTypes';
import { ButtonGroup, type ButtonGroupOption } from '@/components/ui/ButtonGroup';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface PedestalConfig {
  enabled: boolean;
  width: number;
}

interface BaseConfig {
  type: string;
  left: PedestalConfig | null;
  right: PedestalConfig | null;
}

interface DeskConfiguration {
  base?: BaseConfig;
  [key: string]: any;
}

interface DeskLayoutStepProps {
  configuration: DeskConfiguration;
  updateConfiguration: (update: Partial<DeskConfiguration>) => void;
}

export function DeskLayoutStep({ configuration, updateConfiguration }: DeskLayoutStepProps) {
  const [baseType, setBaseType] = useState<string>(configuration.base?.type || 'pedestals');
  const [leftPedestal, setLeftPedestal] = useState<PedestalConfig>(configuration.base?.left || {
    enabled: true,
    width: DESK_DEFAULTS.PEDESTAL_DEFAULT_WIDTH
  });
  const [rightPedestal, setRightPedestal] = useState<PedestalConfig>(configuration.base?.right || {
    enabled: true,
    width: DESK_DEFAULTS.PEDESTAL_DEFAULT_WIDTH
  });

  useEffect(() => {
    updateConfiguration({
      base: {
        type: baseType,
        left: baseType === 'pedestals' || baseType === 'panel_sides' ? leftPedestal : null,
        right: baseType === 'pedestals' || baseType === 'panel_sides' ? rightPedestal : null
      }
    });
  }, [baseType, leftPedestal, rightPedestal]);

  const handleBaseTypeChange = (newType: string | number) => {
    setBaseType(newType as string);
  };

  const toggleLeftPedestal = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeftPedestal(prev => ({ ...prev, enabled: e.target.checked }));
  };

  const toggleRightPedestal = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRightPedestal(prev => ({ ...prev, enabled: e.target.checked }));
  };

  const updatePedestalWidth = (side: 'left' | 'right', value: string) => {
    const width = parseInt(value) || DESK_DEFAULTS.PEDESTAL_DEFAULT_WIDTH;
    if (side === 'left') {
      setLeftPedestal(prev => ({ ...prev, width }));
    } else {
      setRightPedestal(prev => ({ ...prev, width }));
    }
  };

  const requiresCarcass = DESK_BASE_TYPES[baseType.toUpperCase() as keyof typeof DESK_BASE_TYPES]?.requiresCarcass;

  // Convert base types to ButtonGroup options
  const baseTypeOptions: ButtonGroupOption[] = Object.values(DESK_BASE_TYPES).map((type) => ({
    value: type.id,
    label: `${type.icon} ${type.name}`
  }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Desk Layout</h2>
        <p className="text-text-secondary">Configure the base and support structure of your desk</p>
      </div>

      {/* Base Type Selection */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Base Type
        </label>
        <ButtonGroup
          options={baseTypeOptions}
          value={baseType}
          onChange={handleBaseTypeChange}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          size="lg"
        />
        <p className="text-sm text-text-secondary mt-2">
          {DESK_BASE_TYPES[baseType.toUpperCase() as keyof typeof DESK_BASE_TYPES]?.description}
        </p>
      </div>

      {/* Pedestal/Panel Configuration */}
      {requiresCarcass && (
        <div className="space-y-6">
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-text-primary mb-4">
              {baseType === 'pedestals' ? 'Pedestal Configuration' : 'Panel Configuration'}
            </h3>

            {/* Left Side */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <Checkbox
                  checked={leftPedestal.enabled}
                  onChange={toggleLeftPedestal}
                  label={`Left ${baseType === 'pedestals' ? 'Pedestal' : 'Panel'}`}
                />
                {leftPedestal.enabled && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-text-secondary">Width (mm):</label>
                    <Input
                      type="number"
                      value={leftPedestal.width}
                      onChange={(e) => updatePedestalWidth('left', e.target.value)}
                      min={DESK_DEFAULTS.PEDESTAL_MIN_WIDTH}
                      max={DESK_DEFAULTS.PEDESTAL_MAX_WIDTH}
                      inputSize="sm"
                      className="w-24"
                    />
                  </div>
                )}
              </div>
              {leftPedestal.enabled && (
                <div className="ml-6 text-xs text-text-secondary">
                  {DESK_DEFAULTS.PEDESTAL_MIN_WIDTH}mm - {DESK_DEFAULTS.PEDESTAL_MAX_WIDTH}mm
                </div>
              )}
            </div>

            {/* Right Side */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Checkbox
                  checked={rightPedestal.enabled}
                  onChange={toggleRightPedestal}
                  label={`Right ${baseType === 'pedestals' ? 'Pedestal' : 'Panel'}`}
                />
                {rightPedestal.enabled && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-text-secondary">Width (mm):</label>
                    <Input
                      type="number"
                      value={rightPedestal.width}
                      onChange={(e) => updatePedestalWidth('right', e.target.value)}
                      min={DESK_DEFAULTS.PEDESTAL_MIN_WIDTH}
                      max={DESK_DEFAULTS.PEDESTAL_MAX_WIDTH}
                      inputSize="sm"
                      className="w-24"
                    />
                  </div>
                )}
              </div>
              {rightPedestal.enabled && (
                <div className="ml-6 text-xs text-text-secondary">
                  {DESK_DEFAULTS.PEDESTAL_MIN_WIDTH}mm - {DESK_DEFAULTS.PEDESTAL_MAX_WIDTH}mm
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle className="text-lg">Layout Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Base Type:</span>
            <span className="font-medium">{DESK_BASE_TYPES[baseType.toUpperCase() as keyof typeof DESK_BASE_TYPES]?.name}</span>
          </div>
          {requiresCarcass && (
            <>
              <div className="flex justify-between">
                <span className="text-text-secondary">Left Side:</span>
                <span className="font-medium">
                  {leftPedestal.enabled ? `${leftPedestal.width}mm` : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Right Side:</span>
                <span className="font-medium">
                  {rightPedestal.enabled ? `${rightPedestal.width}mm` : 'None'}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
