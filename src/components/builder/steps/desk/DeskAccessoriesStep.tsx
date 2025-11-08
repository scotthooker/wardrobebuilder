/**
 * Desk Accessories Step (TypeScript)
 * Step 4: Select desk accessories and hardware options
 */

import { useState, useEffect } from 'react'
import { DESK_ACCESSORIES } from '../../../../constants/deskSectionTypes'
import { Checkbox } from '../../../ui/Checkbox'
import { Card, CardHeader, CardTitle, CardContent } from '../../../ui/Card'

interface DeskConfiguration {
  accessories?: Record<string, boolean>
  [key: string]: any
}

interface DeskAccessoriesStepProps {
  configuration: DeskConfiguration
  updateConfiguration: (updates: Partial<DeskConfiguration>) => void
}

interface AccessoryOption {
  id: string
  name: string
  icon: string
  description: string
  hardwareKey: string
  defaultQty: number
}

export function DeskAccessoriesStep({
  configuration,
  updateConfiguration
}: DeskAccessoriesStepProps) {
  const [selectedAccessories, setSelectedAccessories] = useState<Record<string, boolean>>(
    configuration.accessories || {}
  )

  useEffect(() => {
    updateConfiguration({ accessories: selectedAccessories })
  }, [selectedAccessories])

  const toggleAccessory = (accessoryId: string) => {
    setSelectedAccessories(prev => ({
      ...prev,
      [accessoryId]: !prev[accessoryId]
    }))
  }

  const isSelected = (accessoryId: string): boolean => !!selectedAccessories[accessoryId]

  const selectedCount = Object.keys(selectedAccessories).filter(
    key => selectedAccessories[key]
  ).length

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Accessories & Hardware</h2>
        <p className="text-gray-600">Select desk accessories and hardware options</p>
      </div>

      {/* Accessories Checkbox Grid */}
      <div className="space-y-4">
        {Object.values(DESK_ACCESSORIES).map((accessory: AccessoryOption) => (
          <div
            key={accessory.id}
            className={`
              p-6 rounded-lg border-2 transition-all
              ${isSelected(accessory.id)
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
              }
            `}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 text-3xl pt-1">
                {accessory.icon}
              </div>

              {/* Checkbox and Content */}
              <div className="flex-1">
                <Checkbox
                  id={`accessory-${accessory.id}`}
                  checked={isSelected(accessory.id)}
                  onChange={() => toggleAccessory(accessory.id)}
                  label={accessory.name}
                  helperText={accessory.description}
                  size="lg"
                />
              </div>

              {/* Quantity Badge */}
              {isSelected(accessory.id) && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-600 text-white">
                    × {accessory.defaultQty}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Accessories Summary */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg">Selected Accessories</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedCount > 0 ? (
            <ul className="space-y-2">
              {Object.entries(DESK_ACCESSORIES).map(([_key, accessory]: [string, AccessoryOption]) => {
                if (!selectedAccessories[accessory.id]) return null
                return (
                  <li key={accessory.id} className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-green-600 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      {accessory.name} <span className="text-gray-500">× {accessory.defaultQty}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No accessories selected</p>
          )}
        </CardContent>
      </Card>

      {/* Helpful Tip */}
      <Card variant="glass" className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Accessories can be added or removed later. These items will be included in your final cost calculation.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
