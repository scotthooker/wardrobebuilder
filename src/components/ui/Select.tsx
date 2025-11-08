/**
 * Select Component
 * Dropdown select with optgroup support for categorized options
 */

import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const selectVariants = cva(
  'w-full rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 bg-white appearance-none',
  {
    variants: {
      variant: {
        default:
          'border-gray-300 text-text-primary focus:border-primary-500 focus:ring-primary-500',
        error:
          'border-error-300 text-text-primary focus:border-error-500 focus:ring-error-500',
      },
      selectSize: {
        sm: 'px-3 py-1.5 pr-10 text-sm',
        md: 'px-4 py-2 pr-10 text-base',
        lg: 'px-5 py-3 pr-12 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      selectSize: 'md',
    },
  }
)

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectOptGroup {
  label: string
  options: SelectOption[]
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  /**
   * Simple options array
   */
  options?: SelectOption[]
  /**
   * Grouped options
   */
  groups?: SelectOptGroup[]
  /**
   * Placeholder text
   */
  placeholder?: string
  /**
   * Helper text or error message
   */
  helperText?: string
  /**
   * Show error state
   */
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant: variantProp,
      selectSize,
      options,
      groups,
      placeholder,
      helperText,
      error,
      children,
      ...props
    },
    ref
  ) => {
    const variant = error ? 'error' : variantProp

    return (
      <div className="w-full">
        <div className="relative">
          <select
            ref={ref}
            className={cn(selectVariants({ variant, selectSize }), className)}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {/* Render simple options */}
            {options &&
              options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))}

            {/* Render grouped options */}
            {groups &&
              groups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))}

            {/* Render children if provided */}
            {children}
          </select>

          {/* Chevron icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-text-tertiary">
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
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

Select.displayName = 'Select'
