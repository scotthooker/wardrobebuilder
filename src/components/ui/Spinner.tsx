/**
 * Spinner Component
 * Loading spinner with multiple sizes and variants
 */

import { forwardRef, type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const spinnerVariants = cva('animate-spin', {
  variants: {
    variant: {
      default: 'text-primary-600',
      white: 'text-white',
      gray: 'text-gray-600',
      success: 'text-success-600',
      error: 'text-error-600',
    },
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

export interface SpinnerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Label for screen readers
   */
  label?: string
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, variant, size, label = 'Loading', ...props }, ref) => {
    return (
      <div ref={ref} className={cn('inline-flex', className)} {...props}>
        <svg
          className={cn(spinnerVariants({ variant, size }))}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          role="status"
          aria-label={label}
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="sr-only">{label}</span>
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'
