/**
 * Input Component
 * A flexible input component supporting text, number, and currency inputs with icons
 */

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'w-full rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100',
  {
    variants: {
      variant: {
        default:
          'border-gray-300 bg-white text-text-primary placeholder:text-text-tertiary focus:border-primary-500 focus:ring-primary-500',
        error:
          'border-error-300 bg-white text-text-primary placeholder:text-text-tertiary focus:border-error-500 focus:ring-error-500',
        success:
          'border-success-300 bg-white text-text-primary placeholder:text-text-tertiary focus:border-success-500 focus:ring-success-500',
      },
      inputSize: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
)

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * Icon to display before input
   */
  leftIcon?: React.ReactNode
  /**
   * Icon to display after input
   */
  rightIcon?: React.ReactNode
  /**
   * Helper text or error message
   */
  helperText?: string
  /**
   * Show error state
   */
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant: variantProp,
      inputSize,
      leftIcon,
      rightIcon,
      helperText,
      error,
      ...props
    },
    ref
  ) => {
    const variant = error ? 'error' : variantProp

    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-text-tertiary">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              inputVariants({ variant, inputSize }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-text-tertiary">
              {rightIcon}
            </div>
          )}
        </div>

        {helperText && (
          <p
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-error-600' : 'text-text-secondary'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
