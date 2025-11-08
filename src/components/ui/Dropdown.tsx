/**
 * Dropdown Component
 * A flexible dropdown menu component built on Headless UI Menu
 * Supports customizable triggers, menu items with icons, disabled states, and dividers
 */

import { Fragment, forwardRef, type ReactNode } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const dropdownMenuVariants = cva(
  'absolute z-10 mt-2 rounded-lg bg-white shadow-lg ring-2 ring-gray-200 focus:outline-none',
  {
    variants: {
      width: {
        auto: 'w-auto min-w-[12rem]',
        sm: 'w-48',
        md: 'w-56',
        lg: 'w-64',
        full: 'w-full',
      },
    },
    defaultVariants: {
      width: 'auto',
    },
  }
)

const dropdownItemVariants = cva(
  'group flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors',
  {
    variants: {
      variant: {
        default: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
        danger: 'text-red-600 hover:bg-red-50 hover:text-red-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface DropdownProps extends VariantProps<typeof dropdownMenuVariants> {
  /**
   * Dropdown trigger element
   */
  children: ReactNode
  /**
   * Additional CSS classes
   */
  className?: string
}

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Menu as="div" ref={ref} className={cn('relative inline-block text-left', className)} {...props}>
        {children}
      </Menu>
    )
  }
)

Dropdown.displayName = 'Dropdown'

export interface DropdownTriggerProps {
  /**
   * Trigger content
   */
  children: ReactNode
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom render function for advanced use cases
   */
  as?: React.ElementType
}

export const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  ({ children, className, as, ...props }, ref) => {
    return (
      <Menu.Button
        ref={ref}
        as={as}
        className={cn(
          'inline-flex items-center justify-center gap-2 focus:outline-none',
          className
        )}
        {...props}
      >
        {children}
      </Menu.Button>
    )
  }
)

DropdownTrigger.displayName = 'DropdownTrigger'

export interface DropdownMenuProps extends VariantProps<typeof dropdownMenuVariants> {
  /**
   * Menu items
   */
  children: ReactNode
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Menu alignment
   */
  align?: 'left' | 'right'
}

export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ children, className, width, align = 'right', ...props }, ref) => {
    return (
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          ref={ref}
          className={cn(
            dropdownMenuVariants({ width }),
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
            'py-1',
            className
          )}
          {...props}
        >
          {children}
        </Menu.Items>
      </Transition>
    )
  }
)

DropdownMenu.displayName = 'DropdownMenu'

export interface DropdownItemProps extends VariantProps<typeof dropdownItemVariants> {
  /**
   * Item content
   */
  children: ReactNode
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Disabled state
   */
  disabled?: boolean
  /**
   * Icon to display before content
   */
  icon?: ReactNode
  /**
   * Show checkmark (for selected items)
   */
  selected?: boolean
  /**
   * Click handler
   */
  onClick?: () => void
}

export const DropdownItem = forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ children, className, variant, disabled, icon, selected, onClick, ...props }, ref) => {
    return (
      <Menu.Item disabled={disabled}>
        {({ active }) => (
          <button
            ref={ref}
            type="button"
            className={cn(
              dropdownItemVariants({ variant }),
              active && 'bg-gray-100',
              disabled && 'cursor-not-allowed opacity-50',
              className
            )}
            onClick={onClick}
            disabled={disabled}
            {...props}
          >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span className="flex-1 text-left">{children}</span>
            {selected && (
              <Check className="h-4 w-4 flex-shrink-0 text-primary-600" />
            )}
          </button>
        )}
      </Menu.Item>
    )
  }
)

DropdownItem.displayName = 'DropdownItem'

export interface DropdownDividerProps {
  /**
   * Additional CSS classes
   */
  className?: string
}

export const DropdownDivider = forwardRef<HTMLDivElement, DropdownDividerProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('my-1 h-px bg-gray-200', className)}
        role="separator"
        {...props}
      />
    )
  }
)

DropdownDivider.displayName = 'DropdownDivider'
