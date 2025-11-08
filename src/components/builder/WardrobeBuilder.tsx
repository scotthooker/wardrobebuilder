/**
 * WardrobeBuilder Component
 * Wardrobe-specific wizard orchestrator that guides users through a 5-step configuration process
 * Uses the new UI component library for consistent styling and user experience
 */

import { useState, type ComponentType } from 'react'
import { DimensionsStep } from './steps/DimensionsStep'
import { CarcassLayoutStep } from './steps/CarcassLayoutStep'
import { InteriorDesignStep } from './steps/InteriorDesignStep'
import { DoorsDrawersStep } from './steps/DoorsDrawersStep'
import { ReviewStep } from './steps/ReviewStep'
import { ProgressStepper, type Step } from '@/components/ui/ProgressStepper'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Material configuration for carcass panels
 */
interface Material {
  material: string
  thickness: string
  thicknessNum: number
  price: number
  sku: string
}

/**
 * Interior section configuration
 * Defines the internal organization of a carcass
 */
interface InteriorSection {
  id: number
  type: 'rail' | 'double_rail' | 'shelves' | 'drawers' | 'empty'
  height: number
  shelfCount?: number | null
  drawers?: number | null
  railCount?: number | null
  isExternal?: boolean | null
}

/**
 * Carcass configuration
 * Represents a single vertical section of the wardrobe
 */
interface Carcass {
  id: number
  height: number
  width: number
  material: Material
  interiorSections: InteriorSection[]
}

/**
 * Section configuration
 * Vertical section containing one or more stacked carcasses
 */
interface Section {
  id: number
  width: number
  carcasses: Carcass[]
}

/**
 * Door zone configuration
 * Defines which carcasses are covered by a door group
 */
interface DoorZone {
  id: number
  startCarcass: number
  endCarcass: number
  doorCount: number
}

/**
 * Door configuration per section
 */
interface SectionDoorConfig {
  zones: DoorZone[]
}

/**
 * Doors configuration
 * Controls the external door appearance
 */
interface Doors {
  style: 'hinged' | 'sliding' | 'none'
  sectionConfigs: Record<string, SectionDoorConfig>
}

/**
 * External drawer position
 */
interface DrawerPosition {
  sectionId: number
  carcassId: number
}

/**
 * External drawers configuration
 */
interface ExternalDrawers {
  count: number
  positions: DrawerPosition[]
}

/**
 * Complete wardrobe configuration
 * This is the main state object that tracks the entire wardrobe design
 */
export interface WardrobeConfiguration {
  // Dimensions (Step 1)
  width: number // mm
  height: number // mm
  depth: number // mm
  budget?: number // GBP

  // Carcass layout (Step 2) - vertical sections with stacked carcasses
  sections: Section[]
  numCarcasses: number // Total number of carcasses
  carcassWidths?: number[] // Individual carcass widths for display

  // External appearance (Step 4)
  doors: Doors
  externalDrawers: ExternalDrawers
  carcasses?: Carcass[] // All carcasses across sections
}

/**
 * Wizard step definition
 */
interface WizardStep {
  id: string
  name: string
  component: ComponentType<StepComponentProps>
}

/**
 * Props passed to each step component
 */
interface StepComponentProps {
  configuration: WardrobeConfiguration
  updateConfiguration: (updates: Partial<WardrobeConfiguration>) => void
}

/**
 * WardrobeBuilder props
 */
export interface WardrobeBuilderProps {
  /**
   * Callback when the wizard is completed
   */
  onComplete: (configuration: WardrobeConfiguration) => void
  /**
   * Callback when the wizard is cancelled
   */
  onCancel: () => void
}

/**
 * Wizard steps configuration
 * Defines the 5-step flow for wardrobe configuration
 */
const STEPS: WizardStep[] = [
  { id: 'dimensions', name: 'Dimensions', component: DimensionsStep },
  { id: 'carcasses', name: 'Carcass Layout', component: CarcassLayoutStep as any },
  { id: 'interior', name: 'Interior Design', component: InteriorDesignStep as any },
  { id: 'doors', name: 'Doors & Drawers', component: DoorsDrawersStep as any },
  { id: 'review', name: 'Review', component: ReviewStep as any },
]

/**
 * WardrobeBuilder Component
 *
 * Orchestrates a 5-step wizard for designing custom wardrobes:
 * 1. Dimensions - Set overall width, height, depth
 * 2. Carcass Layout - Define vertical sections and carcass heights with material selection
 * 3. Interior Design - Configure interior organization (rails, shelves, drawers)
 * 4. Doors & Drawers - Add door zones and external drawer configurations
 * 5. Review - Summary and save to database
 *
 * @example
 * ```tsx
 * <WardrobeBuilder
 *   onComplete={(config) => saveToDatabase(config)}
 *   onCancel={() => navigate('/builds')}
 * />
 * ```
 */
export function WardrobeBuilder({ onComplete, onCancel }: WardrobeBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [configuration, setConfiguration] = useState<WardrobeConfiguration>({
    // Default dimensions
    width: 2400, // mm
    height: 2400, // mm
    depth: 600, // mm

    // Carcass layout - vertical sections (columns) with stacked carcasses
    sections: [], // Each section has: { id, width, carcasses: [{ id, height, interiorSections: [] }] }
    numCarcasses: 0, // Total number of carcasses

    // External appearance
    doors: {
      style: 'hinged', // hinged, sliding, none
      sectionConfigs: {} // Door assignments to carcasses
    },
    externalDrawers: {
      count: 0,
      positions: [] // Which carcass sections have external drawers
    }
  })

  // Get current step component
  const CurrentStepComponent = STEPS[currentStep].component

  /**
   * Navigate to next step or complete the wizard
   */
  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Final step - complete configuration
      onComplete(configuration)
    }
  }

  /**
   * Navigate to previous step
   */
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  /**
   * Handle step click navigation
   * Allows jumping to previous steps, but not future ones
   */
  const handleStepClick = (stepIndex: number) => {
    // Only allow navigation to completed or current steps
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex)
    }
  }

  /**
   * Update configuration state
   * Merges partial updates into the existing configuration
   */
  const updateConfiguration = (updates: Partial<WardrobeConfiguration>) => {
    setConfiguration(prev => ({ ...prev, ...updates }))
  }

  // Convert steps to ProgressStepper format
  const progressSteps: Step[] = STEPS.map((step) => ({
    id: step.id,
    label: step.name,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Stepper - Sticky header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ProgressStepper
            steps={progressSteps}
            currentStep={currentStep}
            clickable={true}
            onStepClick={handleStepClick}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="elevated" padding="lg">
          <CurrentStepComponent
            configuration={configuration}
            updateConfiguration={updateConfiguration}
          />
        </Card>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            size="lg"
            onClick={currentStep === 0 ? onCancel : handleBack}
            leftIcon={<ChevronLeft className="w-5 h-5" />}
          >
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>

          <Button
            variant="wizard"
            size="lg"
            onClick={handleNext}
            rightIcon={<ChevronRight className="w-5 h-5" />}
          >
            {currentStep === STEPS.length - 1 ? 'Complete Build' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
