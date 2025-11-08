/**
 * FurnitureBuilder Component
 * Main wizard orchestrator for creating custom furniture (wardrobes and desks)
 *
 * Features:
 * - Type selection (wardrobe vs desk)
 * - Type-specific wizard steps (5 steps per furniture type)
 * - Progress stepper navigation
 * - Configuration state management
 * - Step validation
 */

import { useState, useMemo, type ComponentType } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// UI Components
import { ProgressStepper, type Step } from '@/components/ui/ProgressStepper'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

// Furniture type selection
import { FurnitureTypeStep } from './steps/FurnitureTypeStep'

// Wardrobe steps
import { DimensionsStep } from './steps/DimensionsStep'
import { CarcassLayoutStep } from './steps/CarcassLayoutStep'
import { InteriorDesignStep } from './steps/InteriorDesignStep'
import { DoorsDrawersStep } from './steps/DoorsDrawersStep'
import { ReviewStep } from './steps/ReviewStep'

// Desk steps
import { DeskDimensionsStep } from './steps/desk/DeskDimensionsStep'
import { DeskLayoutStep } from './steps/desk/DeskLayoutStep'
import { DeskStorageStep } from './steps/desk/DeskStorageStep'
import { DeskAccessoriesStep } from './steps/desk/DeskAccessoriesStep'
import { DeskReviewStep } from './steps/desk/DeskReviewStep'

// Types
// Use a flexible configuration object that can hold any furniture type data
export interface FurnitureConfiguration {
  furnitureType?: 'wardrobe' | 'desk'
  width?: number
  height?: number
  depth?: number
  budget?: number
  [key: string]: any
}

// Step component props - using 'any' for maximum flexibility with step components
export interface StepComponentProps {
  configuration: any
  updateConfiguration: (updates: any) => void
}

// Step definition
export interface WizardStep {
  id: string
  name: string
  component: ComponentType<StepComponentProps>
}

// Navigation state
export interface NavigationState {
  currentStep: number
  canProceed: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

// Component props
export interface FurnitureBuilderProps {
  onComplete: (configuration: FurnitureConfiguration) => void
  onCancel: () => void
}

// Step configurations for each furniture type
const FURNITURE_STEPS: Record<'wardrobe' | 'desk', WizardStep[]> = {
  wardrobe: [
    { id: 'dimensions', name: 'Dimensions', component: DimensionsStep },
    { id: 'carcasses', name: 'Carcass Layout', component: CarcassLayoutStep },
    { id: 'interior', name: 'Interior Design', component: InteriorDesignStep },
    { id: 'doors', name: 'Doors & Drawers', component: DoorsDrawersStep },
    { id: 'review', name: 'Review', component: ReviewStep },
  ],
  desk: [
    { id: 'dimensions', name: 'Desk Size', component: DeskDimensionsStep },
    { id: 'layout', name: 'Layout', component: DeskLayoutStep },
    { id: 'storage', name: 'Storage', component: DeskStorageStep },
    { id: 'accessories', name: 'Accessories', component: DeskAccessoriesStep },
    { id: 'review', name: 'Review', component: DeskReviewStep },
  ]
}

// Initial configuration for each furniture type
const INITIAL_CONFIGURATIONS: Record<'wardrobe' | 'desk', FurnitureConfiguration> = {
  wardrobe: {
    furnitureType: 'wardrobe' as const,
    width: 2400,
    height: 2400,
    depth: 600,
    sections: [],
    doors: {
      style: 'hinged',
      count: 3,
      configuration: []
    },
    externalDrawers: {
      count: 0,
      positions: []
    }
  },
  desk: {
    furnitureType: 'desk' as const,
    deskShape: 'straight',
    width: 1600,
    depth: 750,
    height: 730,
    sections: [],
    base: {
      type: 'pedestals',
      left: null,
      right: null
    },
    overhead: {
      enabled: false,
      sections: []
    },
    accessories: {}
  }
}

export function FurnitureBuilder({ onComplete, onCancel }: FurnitureBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [configuration, setConfiguration] = useState<FurnitureConfiguration>({
    furnitureType: undefined
  })

  // Determine which steps to show based on furniture type
  const steps = useMemo(() => {
    const typeStep: WizardStep = {
      id: 'type',
      name: 'Type',
      component: FurnitureTypeStep
    }

    if (!configuration.furnitureType) {
      return [typeStep]
    }

    const furnitureSteps = FURNITURE_STEPS[configuration.furnitureType] || []
    return [typeStep, ...furnitureSteps]
  }, [configuration.furnitureType])

  // Convert steps to ProgressStepper format
  const progressSteps: Step[] = useMemo(() =>
    steps.map(step => ({
      id: step.id,
      label: step.name
    })),
    [steps]
  )

  // Get current step component
  const CurrentStepComponent = steps[currentStep].component

  // Navigation state
  const navigationState: NavigationState = useMemo(() => ({
    currentStep,
    canProceed: currentStep !== 0 || !!configuration.furnitureType,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1
  }), [currentStep, configuration.furnitureType, steps.length])

  const handleNext = () => {
    // If we just selected furniture type in step 0, initialize the configuration
    if (currentStep === 0 && configuration.furnitureType) {
      const initialConfig = INITIAL_CONFIGURATIONS[configuration.furnitureType] || {}
      setConfiguration(prev => ({ ...prev, ...initialConfig }))
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Final step - complete configuration
      onComplete(configuration)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    // Allow jumping to previous steps, not future ones
    // Can't go back past type selection if type not selected
    if (stepIndex === 0 || (configuration.furnitureType && stepIndex <= currentStep)) {
      setCurrentStep(stepIndex)
    }
  }

  const updateConfiguration = (updates: any) => {
    setConfiguration(prev => ({ ...prev, ...updates }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Steps */}
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
            onClick={navigationState.isFirstStep ? onCancel : handleBack}
            leftIcon={<ChevronLeft className="w-5 h-5" />}
          >
            {navigationState.isFirstStep ? 'Cancel' : 'Back'}
          </Button>

          <Button
            variant="wizard"
            size="lg"
            onClick={handleNext}
            disabled={!navigationState.canProceed}
            rightIcon={<ChevronRight className="w-5 h-5" />}
          >
            {navigationState.isLastStep ? 'Complete Build' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
