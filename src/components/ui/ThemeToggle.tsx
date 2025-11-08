import { forwardRef } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../lib/utils'

export interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(
  ({ className, showLabel = false }, ref) => {
    const { mode, toggleMode } = useTheme()

    return (
      <button
        ref={ref}
        onClick={toggleMode}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors',
          'border-2 border-walnut-500 dark:border-maple-400',
          'bg-white dark:bg-surface text-espresso dark:text-maple-50',
          'hover:bg-maple-50 dark:hover:bg-secondary-300',
          'focus:outline-none focus:ring-2 focus:ring-brass-500 dark:focus:ring-copper-500',
          className
        )}
        aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
      >
        {mode === 'light' ? (
          <>
            <Moon className="h-5 w-5" />
            {showLabel && <span className="text-sm font-medium">Dark</span>}
          </>
        ) : (
          <>
            <Sun className="h-5 w-5" />
            {showLabel && <span className="text-sm font-medium">Light</span>}
          </>
        )}
      </button>
    )
  }
)

ThemeToggle.displayName = 'ThemeToggle'
