/**
 * ProgressStepper Component
 * A horizontal step indicator for wizard navigation
 * Shows completed, current, and upcoming steps with clickable navigation
 */

import { forwardRef, type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const stepperVariants = cva('flex w-full items-center justify-between', {
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
})

const stepVariants = cva(
  'flex items-center transition-all duration-200',
  {
    variants: {
      status: {
        completed: 'text-primary-600',
        current: 'text-primary-600',
        upcoming: 'text-text-tertiary',
      },
      orientation: {
        horizontal: 'flex-1',
        vertical: 'w-full',
      },
    },
    defaultVariants: {
      status: 'upcoming',
      orientation: 'horizontal',
    },
  }
)

const stepCircleVariants = cva(
  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 font-medium transition-all duration-200',
  {
    variants: {
      status: {
        completed: 'border-primary-600 bg-primary-600 text-white',
        current: 'border-primary-600 bg-white text-primary-600 ring-4 ring-primary-100',
        upcoming: 'border-gray-300 bg-white text-text-tertiary',
      },
      clickable: {
        true: 'cursor-pointer hover:border-primary-500',
        false: '',
      },
    },
    defaultVariants: {
      status: 'upcoming',
      clickable: false,
    },
  }
)

const stepLineVariants = cva('h-0.5 transition-all duration-200', {
  variants: {
    status: {
      completed: 'bg-primary-600',
      upcoming: 'bg-gray-300',
    },
    orientation: {
      horizontal: 'mx-4 flex-1',
      vertical: 'my-4 w-0.5 ml-5',
    },
  },
  defaultVariants: {
    status: 'upcoming',
    orientation: 'horizontal',
  },
})

export interface Step {
  /**
   * Step identifier
   */
  id: string | number
  /**
   * Step label
   */
  label: string
  /**
   * Optional step description
   */
  description?: string
}

export interface ProgressStepperProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stepperVariants> {
  /**
   * Array of steps
   */
  steps: Step[]
  /**
   * Current active step index
   */
  currentStep: number
  /**
   * Whether steps are clickable
   */
  clickable?: boolean
  /**
   * Callback when step is clicked
   */
  onStepClick?: (stepIndex: number) => void
  /**
   * Show step numbers instead of checkmarks for completed steps
   */
  showNumbers?: boolean
}

export const ProgressStepper = forwardRef<HTMLDivElement, ProgressStepperProps>(
  (
    {
      className,
      steps,
      currentStep,
      clickable = false,
      onStepClick,
      showNumbers = false,
      orientation,
      ...props
    },
    ref
  ) => {
    const getStepStatus = (index: number): 'completed' | 'current' | 'upcoming' => {
      if (index < currentStep) return 'completed'
      if (index === currentStep) return 'current'
      return 'upcoming'
    }

    const handleStepClick = (index: number) => {
      if (clickable && onStepClick) {
        onStepClick(index)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(stepperVariants({ orientation }), className)}
        {...props}
      >
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const isClickable = clickable && (status === 'completed' || status === 'current')
          const isLast = index === steps.length - 1

          return (
            <div
              key={step.id}
              className={cn(
                stepVariants({ status, orientation }),
                orientation === 'vertical' && !isLast && 'pb-8'
              )}
            >
              <div className={cn(
                'flex items-start gap-3',
                orientation === 'horizontal' ? 'flex-col items-center text-center' : 'flex-row'
              )}>
                {/* Step circle */}
                <button
                  type="button"
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    stepCircleVariants({ status, clickable: isClickable }),
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                  )}
                  aria-label={`Step ${index + 1}: ${step.label}`}
                  aria-current={status === 'current' ? 'step' : undefined}
                >
                  {status === 'completed' && !showNumbers ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </button>

                {/* Step label and description */}
                <div className={cn(
                  'flex flex-col',
                  orientation === 'horizontal' ? 'items-center' : 'items-start flex-1'
                )}>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      status === 'current' && 'font-semibold',
                      status === 'upcoming' && 'text-text-secondary'
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span
                      className={cn(
                        'mt-0.5 text-xs',
                        status === 'current' ? 'text-text-secondary' : 'text-text-secondary'
                      )}
                    >
                      {step.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Connecting line (not for last step in horizontal mode) */}
              {!isLast && orientation === 'horizontal' && (
                <div
                  className={cn(
                    stepLineVariants({
                      status: index < currentStep ? 'completed' : 'upcoming',
                      orientation,
                    })
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }
)

ProgressStepper.displayName = 'ProgressStepper'
