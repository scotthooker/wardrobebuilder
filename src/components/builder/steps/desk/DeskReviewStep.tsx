/**
 * Desk Review Step
 * Final step in the desk builder wizard - displays a summary of the desk configuration
 */

import { CheckCircle2, Ruler, Package, Layers, Wrench } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { DESK_SHAPES, DESK_BASE_TYPES, DESK_OVERHEAD_STORAGE, DESK_ACCESSORIES } from '@/constants/deskSectionTypes'

interface DeskConfiguration {
  deskShape?: string
  width?: number
  depth?: number
  height?: number
  base?: {
    type?: string
    left?: {
      enabled: boolean
      width?: number
    }
    right?: {
      enabled: boolean
      width?: number
    }
  }
  overhead?: {
    enabled: boolean
    type?: string
    height?: number
  }
  accessories?: Record<string, boolean>
}

interface DeskReviewStepProps {
  configuration: DeskConfiguration
}

export function DeskReviewStep({ configuration }: DeskReviewStepProps) {
  const shape = DESK_SHAPES[configuration.deskShape?.toUpperCase() || ''] || { name: 'Not configured' }
  const baseType = DESK_BASE_TYPES[configuration.base?.type?.toUpperCase() || ''] || { name: 'Not configured' }
  const overheadType = configuration.overhead?.enabled
    ? DESK_OVERHEAD_STORAGE[configuration.overhead?.type?.toUpperCase() || '']
    : null

  const selectedAccessories = Object.entries(configuration.accessories || {})
    .filter(([_, selected]) => selected)
    .map(([id]) => DESK_ACCESSORIES[id.toUpperCase()])
    .filter(Boolean)

  const totalHeight = configuration.overhead?.enabled
    ? (configuration.height || 0) + 50 + (configuration.overhead?.height || 0)
    : configuration.height || 0

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Review Your Desk Configuration</h2>
        </div>
        <p className="text-gray-600">
          Review all the details of your desk configuration before saving.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dimensions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-primary-600" />
              <CardTitle className="text-lg">Dimensions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600">Desk Shape:</dt>
                <dd className="text-base font-medium text-gray-900 mt-1 flex items-center gap-2">
                  <span className="text-xl">{shape.icon}</span>
                  {shape.name}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Desktop Size:</dt>
                <dd className="text-base font-medium text-gray-900 mt-1">
                  {configuration.width}mm W × {configuration.depth}mm D
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Desktop Height:</dt>
                <dd className="text-base font-medium text-gray-900 mt-1">{configuration.height}mm</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Total Height:</dt>
                <dd className="text-base font-medium text-gray-900 mt-1">
                  {totalHeight}mm
                  {configuration.overhead?.enabled && (
                    <Badge variant="blue" size="sm" className="ml-2">
                      Includes overhead
                    </Badge>
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Base Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary-600" />
              <CardTitle className="text-lg">Base Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600">Base Type:</dt>
                <dd className="text-base font-medium text-gray-900 mt-1 flex items-center gap-2">
                  <span className="text-xl">{baseType.icon}</span>
                  {baseType.name}
                </dd>
              </div>
              {configuration.base?.left?.enabled && (
                <div>
                  <dt className="text-sm text-gray-600">Left Pedestal:</dt>
                  <dd className="text-base font-medium text-gray-900 mt-1">
                    {configuration.base.left.width}mm wide
                  </dd>
                </div>
              )}
              {configuration.base?.right?.enabled && (
                <div>
                  <dt className="text-sm text-gray-600">Right Pedestal:</dt>
                  <dd className="text-base font-medium text-gray-900 mt-1">
                    {configuration.base.right.width}mm wide
                  </dd>
                </div>
              )}
              {!configuration.base?.left?.enabled && !configuration.base?.right?.enabled && (
                <div>
                  <dd className="text-sm text-gray-500 italic mt-1">
                    No pedestals configured
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Overhead Storage */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" />
              <CardTitle className="text-lg">Overhead Storage</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {configuration.overhead?.enabled ? (
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-600">Type:</dt>
                  <dd className="text-base font-medium text-gray-900 mt-1 flex items-center gap-2">
                    <span className="text-xl">{overheadType?.icon}</span>
                    {overheadType?.name || 'Unknown'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Height:</dt>
                  <dd className="text-base font-medium text-gray-900 mt-1">
                    {configuration.overhead.height}mm
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-gray-500 italic">No overhead storage</p>
            )}
          </CardContent>
        </Card>

        {/* Accessories */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary-600" />
              <CardTitle className="text-lg">
                Accessories
                <Badge variant="primary" size="sm" className="ml-2">
                  {selectedAccessories.length}
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {selectedAccessories.length > 0 ? (
              <ul className="space-y-2">
                {selectedAccessories.map((accessory) => (
                  <li key={accessory.id} className="flex items-center gap-2 text-sm">
                    <span className="text-2xl">{accessory.icon}</span>
                    <span className="text-gray-900">{accessory.name}</span>
                    <Badge variant="default" size="sm">
                      × {accessory.defaultQty}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No accessories selected</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configuration Data (for debugging) */}
      <details className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <summary className="cursor-pointer text-sm font-medium text-gray-700">
          View Full Configuration Data
        </summary>
        <pre className="mt-4 text-xs bg-white p-4 rounded border border-gray-200 overflow-auto max-h-96">
          {JSON.stringify(configuration, null, 2)}
        </pre>
      </details>

      {/* Ready to Save */}
      <Card variant="elevated" className="bg-green-50 border-2 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-1">Ready to Save!</h3>
              <p className="text-sm text-green-800">
                Your desk configuration is complete. Click "Complete Build" to save this desk to your database.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
