/**
 * Drawer Component
 * A slide-in panel component built on Headless UI Dialog
 * Supports left and right positioning with multiple size variants
 */

import { Fragment, forwardRef, type ReactNode } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

const drawerVariants = cva(
  'fixed inset-y-0 flex flex-col bg-white shadow-xl',
  {
    variants: {
      position: {
        left: 'left-0',
        right: 'right-0',
      },
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
      },
    },
    defaultVariants: {
      position: 'right',
      size: 'md',
    },
  }
)

export interface DrawerProps extends VariantProps<typeof drawerVariants> {
  /**
   * Whether the drawer is open
   */
  open: boolean
  /**
   * Callback when drawer is closed
   */
  onClose: () => void
  /**
   * Drawer content
   */
  children: ReactNode
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Whether to show close button
   */
  showCloseButton?: boolean
  /**
   * Initial focus element ref
   */
  initialFocus?: React.MutableRefObject<HTMLElement | null>
}

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      open,
      onClose,
      children,
      position,
      size,
      className,
      showCloseButton = true,
      initialFocus,
    },
    ref
  ) => {
    const slideDirection = position === 'left' ? '-translate-x-full' : 'translate-x-full'

    return (
      <Transition appear show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={onClose}
          initialFocus={initialFocus}
        >
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          {/* Drawer panel */}
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className={cn(
                "pointer-events-none fixed inset-y-0 flex",
                position === 'right' ? 'right-0' : 'left-0'
              )}>
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom={slideDirection}
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo={slideDirection}
                >
                  <Dialog.Panel
                    ref={ref}
                    className={cn(
                      drawerVariants({ position, size }),
                      'pointer-events-auto w-screen',
                      className
                    )}
                  >
                    {showCloseButton && (
                      <div className="absolute right-4 top-4 z-10">
                        <button
                          type="button"
                          className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-gray-100 hover:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                          onClick={onClose}
                          aria-label="Close drawer"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                    {children}
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
  }
)

Drawer.displayName = 'Drawer'

// Drawer sub-components
export const DrawerHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'border-b-2 border-gray-200 px-6 py-4',
      className
    )}
    {...props}
  >
    {children}
  </div>
))
DrawerHeader.displayName = 'DrawerHeader'

export const DrawerTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    as="h3"
    className={cn('text-xl font-bold text-text-primary', className)}
    {...props}
  >
    {children}
  </Dialog.Title>
))
DrawerTitle.displayName = 'DrawerTitle'

export const DrawerContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 overflow-y-auto px-6 py-4', className)}
    {...props}
  >
    {children}
  </div>
))
DrawerContent.displayName = 'DrawerContent'

export const DrawerFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-end gap-3 border-t-2 border-gray-200 bg-gray-50 px-6 py-4',
      className
    )}
    {...props}
  >
    {children}
  </div>
))
DrawerFooter.displayName = 'DrawerFooter'
