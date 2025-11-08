/**
 * Button Component
 * A flexible button component with multiple variants, sizes, and states.
 * Supports 8 variants: primary, secondary, success, outline, ghost, icon, wizard, premium
 */

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-600 text-white border-2 border-primary-700 hover:bg-primary-700 hover:border-primary-800 focus:ring-primary-500 active:bg-primary-800',
        secondary:
          'bg-secondary-600 text-white border-2 border-secondary-700 hover:bg-secondary-700 hover:border-secondary-800 focus:ring-secondary-500 active:bg-secondary-800',
        success:
          'bg-green-600 text-white border-2 border-green-700 hover:bg-green-700 hover:border-green-800 focus:ring-green-500 active:bg-green-800',
        outline:
          'bg-white text-text-primary border-2 border-gray-400 hover:border-primary-600 hover:bg-primary-50 focus:ring-primary-500 active:bg-primary-100',
        ghost:
          'bg-transparent text-text-primary border-2 border-transparent hover:bg-gray-100 hover:text-text-primary focus:ring-primary-500 active:bg-gray-200',
        icon:
          'bg-white text-text-primary border-2 border-gray-400 hover:bg-primary-50 hover:border-primary-600 focus:ring-primary-500 active:bg-primary-100',
        wizard:
          'bg-primary-600 text-white border-2 border-primary-700 hover:bg-primary-700 hover:border-primary-800 focus:ring-primary-500 active:bg-primary-800 disabled:bg-gray-100 disabled:text-text-secondary disabled:border-gray-300',
        premium:
          'bg-gradient-to-r from-primary-600 to-secondary-600 text-white border-2 border-primary-700 hover:from-primary-700 hover:to-secondary-700 hover:shadow-premium focus:ring-primary-500 active:shadow-premium-lg',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        md: 'px-4 py-2 text-base gap-2',
        lg: 'px-6 py-3 text-lg gap-2',
        icon: 'p-2',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Loading state - shows spinner and disables interaction
   */
  loading?: boolean
  /**
   * Icon to display before children
   */
  leftIcon?: React.ReactNode
  /**
   * Icon to display after children
   */
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
        )}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'
