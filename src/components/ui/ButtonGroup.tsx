/**
 * ButtonGroup Component
 * Group of buttons for selecting from multiple options (like dimension buttons)
 */

import { forwardRef, type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonGroupVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50',
        selected:
          'border-2 border-primary-600 bg-primary-50 text-primary-700',
        success:
          'border-2 border-green-600 bg-green-50 text-green-700',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonGroupOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface ButtonGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof buttonGroupVariants> {
  /**
   * Options to display
   */
  options: ButtonGroupOption[]
  /**
   * Currently selected value
   */
  value?: string | number
  /**
   * Change handler
   */
  onChange?: (value: string | number) => void
  /**
   * Disabled state
   */
  disabled?: boolean
  /**
   * Use success variant for selected state
   */
  successOnSelect?: boolean
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      className,
      size,
      options,
      value,
      onChange,
      disabled,
      successOnSelect = false,
      ...props
    },
    ref
  ) => {
    const handleClick = (optionValue: string | number) => {
      if (!disabled && onChange) {
        onChange(optionValue)
      }
    }

    return (
      <div
        ref={ref}
        className={cn('inline-flex gap-2 flex-wrap', className)}
        {...props}
      >
        {options.map((option) => {
          const isSelected = value === option.value
          const variant = isSelected
            ? successOnSelect
              ? 'success'
              : 'selected'
            : 'default'

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleClick(option.value)}
              disabled={disabled || option.disabled}
              className={cn(buttonGroupVariants({ variant, size }))}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    )
  }
)

ButtonGroup.displayName = 'ButtonGroup'
