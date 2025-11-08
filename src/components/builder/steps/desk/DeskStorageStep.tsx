/**
 * DeskStorageStep - TypeScript Component
 * Configure overhead storage and hutch options for desks
 */

import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/Checkbox'
import { ButtonGroup, type ButtonGroupOption } from '@/components/ui/ButtonGroup'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import {
  DESK_OVERHEAD_STORAGE,
  DESK_DEFAULTS,
  type StorageType,
} from '../../../../constants/deskSectionTypes'

interface OverheadConfig {
  enabled: boolean
  height: number
  type: string
}

interface BaseConfig {
  left?: {
    enabled: boolean
  }
  right?: {
    enabled: boolean
  }
}

interface Configuration {
  overhead?: OverheadConfig
  height?: number
  base?: BaseConfig
}

interface DeskStorageStepProps {
  configuration: Configuration
  updateConfiguration: (updates: Partial<Configuration>) => void
}

export function DeskStorageStep({ configuration, updateConfiguration }: DeskStorageStepProps) {
  const [overheadEnabled, setOverheadEnabled] = useState(
    configuration.overhead?.enabled || false
  )
  const [overheadHeight, setOverheadHeight] = useState(
    configuration.overhead?.height || DESK_DEFAULTS.OVERHEAD_DEFAULT_HEIGHT
  )
  const [selectedOverheadType, setSelectedOverheadType] = useState(
    configuration.overhead?.type || 'hutch_shelves'
  )

  useEffect(() => {
    updateConfiguration({
      overhead: {
        enabled: overheadEnabled,
        height: overheadHeight,
        type: selectedOverheadType,
      },
    })
  }, [overheadEnabled, overheadHeight, selectedOverheadType, updateConfiguration])

  // Prepare options for ButtonGroup
  const overheadTypeOptions: ButtonGroupOption[] = Object.values(DESK_OVERHEAD_STORAGE).map(
    (type: StorageType) => ({
      value: type.id,
      label: `${type.icon} ${type.name}`,
    })
  )

  const handleOverheadHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value)) {
      setOverheadHeight(value)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Storage Configuration</h2>
        <p className="text-gray-600">Configure overhead storage and hutch options</p>
      </div>

      {/* Overhead Storage Toggle */}
      <Card variant="default" padding="md">
        <Checkbox
          checked={overheadEnabled}
          onChange={(e) => setOverheadEnabled(e.target.checked)}
          label="Add Overhead Storage"
          helperText="Add cabinets, shelves, or hutch above the desktop"
          size="lg"
        />
      </Card>

      {/* Overhead Configuration */}
      {overheadEnabled && (
        <div className="space-y-6">
          {/* Overhead Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Overhead Type
            </label>
            <ButtonGroup
              options={overheadTypeOptions}
              value={selectedOverheadType}
              onChange={(value) => setSelectedOverheadType(value as string)}
              size="lg"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
            />
            <p className="text-xs text-gray-500 mt-2">
              {DESK_OVERHEAD_STORAGE[selectedOverheadType.toUpperCase() as keyof typeof DESK_OVERHEAD_STORAGE]?.description}
            </p>
          </div>

          {/* Overhead Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overhead Height (mm)
            </label>
            <Input
              type="number"
              value={overheadHeight}
              onChange={handleOverheadHeightChange}
              min={DESK_DEFAULTS.OVERHEAD_MIN_HEIGHT}
              max={DESK_DEFAULTS.OVERHEAD_MAX_HEIGHT}
              className="w-full md:w-64"
              helperText={`${DESK_DEFAULTS.OVERHEAD_MIN_HEIGHT}mm - ${DESK_DEFAULTS.OVERHEAD_MAX_HEIGHT}mm`}
            />
          </div>
        </div>
      )}

      {/* Preview */}
      <Card variant="glass" padding="md" className="border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4">Storage Preview</h3>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Overhead Storage:</span>
              <span className="font-medium">{overheadEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            {overheadEnabled && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overhead Type:</span>
                  <span className="font-medium">
                    {DESK_OVERHEAD_STORAGE[selectedOverheadType.toUpperCase() as keyof typeof DESK_OVERHEAD_STORAGE]?.name ||
                      selectedOverheadType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overhead Height:</span>
                  <span className="font-medium">{overheadHeight}mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Desk Height:</span>
                  <span className="font-medium">
                    {(configuration.height || 730) +
                      DESK_DEFAULTS.CLEARANCE_ABOVE_DESKTOP +
                      overheadHeight}
                    mm
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Note about lower storage */}
      <Card variant="glass" padding="md" className="border-blue-200 bg-blue-50">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Lower storage (drawers and cabinets) is configured based on
          your base type selection in the Layout step.
          {configuration.base?.left?.enabled || configuration.base?.right?.enabled
            ? ' Pedestals will include drawer configurations in the final review.'
            : ' Select pedestals or panel sides in the Layout step to add lower storage.'}
        </p>
      </Card>
    </div>
  )
}
