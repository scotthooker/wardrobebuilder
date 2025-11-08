import { Ruler, PoundSterling } from 'lucide-react'
import { ButtonGroup, type ButtonGroupOption } from '@/components/ui/ButtonGroup'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import type { ChangeEvent } from 'react'

const COMMON_HEIGHTS = [2100, 2400, 2700, 3000]
const COMMON_WIDTHS = [1200, 1800, 2400, 3000, 3600]
const COMMON_DEPTHS = [450, 550, 600, 650]
const COMMON_BUDGETS = [3000, 4000, 5000, 6000, 7500, 10000]

interface Configuration {
  width: number
  height: number
  depth: number
  budget?: number
}

interface DimensionsStepProps {
  configuration: Configuration
  updateConfiguration: (updates: Partial<Configuration>) => void
}

export function DimensionsStep({ configuration, updateConfiguration }: DimensionsStepProps) {
  const handleDimensionChange = (dimension: keyof Configuration, value: string | number) => {
    const numValue = typeof value === 'string' ? parseInt(value) : value
    updateConfiguration({ [dimension]: numValue })
  }

  const handleBudgetChange = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    updateConfiguration({ budget: numValue })
  }

  const handleInputChange = (dimension: keyof Configuration) => (e: ChangeEvent<HTMLInputElement>) => {
    handleDimensionChange(dimension, e.target.value)
  }

  // Convert arrays to ButtonGroup options
  const widthOptions: ButtonGroupOption[] = COMMON_WIDTHS.map(width => ({
    value: width,
    label: `${width}mm`
  }))

  const heightOptions: ButtonGroupOption[] = COMMON_HEIGHTS.map(height => ({
    value: height,
    label: `${height}mm`
  }))

  const depthOptions: ButtonGroupOption[] = COMMON_DEPTHS.map(depth => ({
    value: depth,
    label: `${depth}mm`
  }))

  const budgetOptions: ButtonGroupOption[] = COMMON_BUDGETS.map(budget => ({
    value: budget,
    label: `£${(budget / 1000).toFixed(1)}k`
  }))

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wardrobe Dimensions</h2>
        <p className="text-gray-600">
          Select the overall dimensions of your wardrobe. You can choose from common sizes or enter custom measurements.
        </p>
      </div>

      {/* Visual Preview */}
      <Card variant="glass" padding="lg" className="bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Width Selection */}
      <FormField label="Width (mm)">
        <div className="space-y-4">
          <ButtonGroup
            options={widthOptions}
            value={configuration.width}
            onChange={(value) => handleDimensionChange('width', value)}
            className="grid grid-cols-2 sm:grid-cols-5 gap-3"
          />
          <Input
            type="number"
            value={configuration.width}
            onChange={handleInputChange('width')}
            placeholder="Custom width..."
            min={600}
            max={6000}
            step={100}
          />
        </div>
      </FormField>

      {/* Height Selection */}
      <FormField label="Height (mm)">
        <div className="space-y-4">
          <ButtonGroup
            options={heightOptions}
            value={configuration.height}
            onChange={(value) => handleDimensionChange('height', value)}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          />
          <Input
            type="number"
            value={configuration.height}
            onChange={handleInputChange('height')}
            placeholder="Custom height..."
            min={1800}
            max={3600}
            step={100}
          />
        </div>
      </FormField>

      {/* Depth Selection */}
      <FormField label="Depth (mm)">
        <div className="space-y-4">
          <ButtonGroup
            options={depthOptions}
            value={configuration.depth}
            onChange={(value) => handleDimensionChange('depth', value)}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          />
          <Input
            type="number"
            value={configuration.depth}
            onChange={handleInputChange('depth')}
            placeholder="Custom depth..."
            min={400}
            max={800}
            step={50}
          />
        </div>
      </FormField>

      {/* Budget Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <PoundSterling className="w-5 h-5 text-green-600" />
          Target Budget
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Set your target budget for this build. This will be used to calculate savings and compare costs.
        </p>
        <div className="space-y-4">
          <ButtonGroup
            options={budgetOptions}
            value={configuration.budget}
            onChange={(value) => handleBudgetChange(value)}
            successOnSelect
            className="grid grid-cols-2 sm:grid-cols-6 gap-3"
          />
          <Input
            type="number"
            value={configuration.budget || 5000}
            onChange={(e) => handleBudgetChange(e.target.value)}
            leftIcon={<PoundSterling className="h-5 w-5" />}
            placeholder="Custom budget..."
            min={1000}
            max={50000}
            step={500}
          />
        </div>
      </div>

      {/* Summary Box */}
      <Card variant="outline" padding="md" className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-blue-900 mb-3">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
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
            <div>
              <span className="text-green-700">Budget:</span>
              <div className="text-lg font-bold text-green-900">£{(configuration.budget || 5000).toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
