/**
 * FormField Component
 * Wraps form inputs with label, helper text, and error messages
 */

import { forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface FormFieldProps {
  /**
   * Label text for the input
   */
  label?: string
  /**
   * Helper text shown below the input
   */
  helperText?: string
  /**
   * Error message - overrides helperText when present
   */
  error?: string
  /**
   * Mark field as required
   */
  required?: boolean
  /**
   * ID for the input element (for label association)
   */
  htmlFor?: string
  /**
   * The input/select/textarea component
   */
  children: ReactNode
  /**
   * Additional CSS classes
   */
  className?: string
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  (
    { label, helperText, error, required, htmlFor, children, className },
    ref
  ) => {
    const hasError = !!error

    return (
      <div ref={ref} className={cn('w-full', className)}>
        {label && (
          <label
            htmlFor={htmlFor}
            className="block text-sm font-medium text-text-primary mb-2"
          >
            {label}
            {required && <span className="text-error-600 ml-1">*</span>}
          </label>
        )}

        {children}

        {(error || helperText) && (
          <p
            className={cn(
              'mt-1.5 text-sm',
              hasError ? 'text-error-600' : 'text-text-secondary'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'
