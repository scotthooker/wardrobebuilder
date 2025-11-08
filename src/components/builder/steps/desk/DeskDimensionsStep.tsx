import { useState, type ChangeEvent } from 'react'
import { PoundSterling } from 'lucide-react'
import { getDeskShapes, DESK_DEFAULTS } from '@/constants/deskSectionTypes'
import { ButtonGroup, type ButtonGroupOption } from '@/components/ui/ButtonGroup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'

const COMMON_BUDGETS = [3000, 4000, 5000, 6000, 7500, 10000]

interface DeskDimensionsConfiguration {
  deskShape?: string
  width?: number
  depth?: number
  height?: number
  budget?: number
}

interface DeskDimensionsStepProps {
  configuration: DeskDimensionsConfiguration
  updateConfiguration: (updates: Partial<DeskDimensionsConfiguration>) => void
}

export function DeskDimensionsStep({
  configuration,
  updateConfiguration
}: DeskDimensionsStepProps) {
  const [shape, setShape] = useState<string>(configuration.deskShape || 'straight')
  const [width, setWidth] = useState<string>(
    String(configuration.width || DESK_DEFAULTS.DEFAULT_DESKTOP_WIDTH)
  )
  const [depth, setDepth] = useState<string>(
    String(configuration.depth || DESK_DEFAULTS.DEFAULT_DESKTOP_DEPTH)
  )
  const [height, setHeight] = useState<string>(
    String(configuration.height || DESK_DEFAULTS.DEFAULT_DESKTOP_HEIGHT)
  )
  const [budget, setBudget] = useState<number>(configuration.budget || 5000)

  const deskShapes = getDeskShapes()

  const handleShapeChange = (newShape: string) => {
    setShape(newShape)
    updateConfiguration({ deskShape: newShape })
  }

  const handleDimensionChange = () => {
    updateConfiguration({
      width: parseInt(width),
      depth: parseInt(depth),
      height: parseInt(height)
    })
  }

  const handleBudgetChange = (newBudget: string | number) => {
    const budgetValue = typeof newBudget === 'string' ? parseFloat(newBudget) : newBudget
    setBudget(budgetValue)
    updateConfiguration({ budget: budgetValue })
  }

  const budgetOptions: ButtonGroupOption[] = COMMON_BUDGETS.map(budgetOption => ({
    value: budgetOption,
    label: `£${(budgetOption / 1000).toFixed(1)}k`
  }))

  const selectedShape = deskShapes.find(s => s.id === shape)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Desk Dimensions</h2>
        <p className="text-gray-600">Configure the size and shape of your desk</p>
      </div>

      {/* Desk Shape Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Desk Shape
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deskShapes.map((deskShape) => (
            <Card
              key={deskShape.id}
              variant={shape === deskShape.id ? 'elevated' : 'default'}
              padding="md"
              interactive
              onClick={() => handleShapeChange(deskShape.id)}
              className={`
                transition-all cursor-pointer
                ${shape === deskShape.id
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                }
              `}
            >
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl mb-2">{deskShape.icon}</div>
                  <div className="font-medium text-gray-900">{deskShape.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{deskShape.description}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          label="Width (mm)"
          helperText={`${DESK_DEFAULTS.MIN_DESKTOP_WIDTH}mm - ${DESK_DEFAULTS.MAX_DESKTOP_WIDTH}mm`}
        >
          <Input
            type="number"
            value={width}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setWidth(e.target.value)}
            onBlur={handleDimensionChange}
            min={DESK_DEFAULTS.MIN_DESKTOP_WIDTH}
            max={DESK_DEFAULTS.MAX_DESKTOP_WIDTH}
          />
        </FormField>

        <FormField
          label="Depth (mm)"
          helperText={`${DESK_DEFAULTS.MIN_DESKTOP_DEPTH}mm - ${DESK_DEFAULTS.MAX_DESKTOP_DEPTH}mm`}
        >
          <Input
            type="number"
            value={depth}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDepth(e.target.value)}
            onBlur={handleDimensionChange}
            min={DESK_DEFAULTS.MIN_DESKTOP_DEPTH}
            max={DESK_DEFAULTS.MAX_DESKTOP_DEPTH}
          />
        </FormField>

        <FormField
          label="Height from Floor (mm)"
          helperText="Standard: 730mm"
        >
          <Input
            type="number"
            value={height}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setHeight(e.target.value)}
            onBlur={handleDimensionChange}
            min={650}
            max={850}
          />
        </FormField>
      </div>

      {/* Budget Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <PoundSterling className="w-5 h-5 text-green-600" />
          Target Budget
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Set your target budget for this desk build. This will be used to calculate savings and compare costs.
        </p>

        <ButtonGroup
          options={budgetOptions}
          value={budget}
          onChange={handleBudgetChange}
          successOnSelect
          className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-4"
        />

        <FormField>
          <Input
            type="number"
            value={budget}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleBudgetChange(e.target.value)}
            leftIcon={<PoundSterling className="h-5 w-5" />}
            placeholder="Custom budget..."
            min={1000}
            max={50000}
            step={500}
          />
        </FormField>
      </div>

      {/* Preview */}
      <Card variant="glass" padding="md" className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-base font-medium text-gray-900 mb-4">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Shape:</span>
              <span className="font-medium">{selectedShape?.name || shape}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dimensions:</span>
              <span className="font-medium">{width}mm W × {depth}mm D × {height}mm H</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Budget:</span>
              <span className="font-bold text-green-900">£{budget.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
