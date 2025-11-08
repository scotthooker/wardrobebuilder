/**
 * Modal Component
 * A flexible modal dialog component built on Headless UI with multiple size variants
 * Supports title, description, content, and footer sections with proper focus management
 */

import { Fragment, forwardRef, type ReactNode } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

const modalVariants = cva(
  'relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all',
  {
    variants: {
      size: {
        sm: 'w-full max-w-sm',
        md: 'w-full max-w-md',
        lg: 'w-full max-w-lg',
        xl: 'w-full max-w-xl',
        full: 'w-full max-w-7xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface ModalProps extends VariantProps<typeof modalVariants> {
  /**
   * Whether the modal is open
   */
  open: boolean
  /**
   * Callback when modal is closed
   */
  onClose: () => void
  /**
   * Modal content
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

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      children,
      size,
      className,
      showCloseButton = true,
      initialFocus,
    },
    ref
  ) => {
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

          {/* Modal container */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  ref={ref}
                  className={cn(modalVariants({ size }), className)}
                >
                  {showCloseButton && (
                    <button
                      type="button"
                      className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      onClick={onClose}
                      aria-label="Close modal"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                  {children}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
  }
)

Modal.displayName = 'Modal'

// Modal sub-components
export const ModalTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    as="h3"
    className={cn('text-xl font-bold text-gray-900', className)}
    {...props}
  >
    {children}
  </Dialog.Title>
))
ModalTitle.displayName = 'ModalTitle'

export const ModalDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={cn('mt-2 text-sm text-gray-600', className)}
    {...props}
  >
    {children}
  </Dialog.Description>
))
ModalDescription.displayName = 'ModalDescription'

export const ModalContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('p-6', className)} {...props}>
    {children}
  </div>
))
ModalContent.displayName = 'ModalContent'

export const ModalFooter = forwardRef<
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
ModalFooter.displayName = 'ModalFooter'
