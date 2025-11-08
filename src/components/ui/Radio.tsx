/**
 * Radio Component
 * Custom styled radio button with label support
 */

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const radioVariants = cva(
  'rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'border-gray-300 text-primary-600 focus:ring-primary-500 checked:bg-primary-600 checked:border-primary-600',
        success:
          'border-gray-300 text-success-600 focus:ring-success-500 checked:bg-success-600 checked:border-success-600',
        error:
          'border-error-300 text-error-600 focus:ring-error-500 checked:bg-error-600 checked:border-error-600',
      },
      size: {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof radioVariants> {
  /**
   * Label text
   */
  label?: string
  /**
   * Helper text shown below radio
   */
  helperText?: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    { className, variant, size, label, helperText, id, ...props },
    ref
  ) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            className={cn(radioVariants({ variant, size }), className)}
            {...props}
          />
        </div>
        {(label || helperText) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={radioId}
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                {label}
              </label>
            )}
            {helperText && (
              <p className="text-sm text-gray-500 mt-0.5">{helperText}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Radio.displayName = 'Radio'
