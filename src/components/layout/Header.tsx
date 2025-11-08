/**
 * Header Component
 * Main navigation header with logo, title, and navigation buttons
 * Displays selected builds count and compare button when builds are selected
 */

import { Menu, Home, GitCompare, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
// @ts-ignore - useBuilds is a JS module, will be migrated to TS later
import { useSelectedBuilds } from '../../hooks/useBuilds'
import { Button } from '@/components/ui/Button'

export function Header() {
  const { selectedCount } = useSelectedBuilds() as { selectedCount: number }

  return (
    <header className="glass-effect sticky top-0 z-30 animate-fade-in-down">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white p-3 rounded-2xl shadow-lg shadow-primary-200 transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              <Menu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Wardrobe Builder
              </h1>
              <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-accent-600" />
                Premium Custom Builds
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-3">
            <Link to="/">
              <Button
                variant="outline"
                size="md"
                leftIcon={<Home className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                className="group shadow-md hover:shadow-lg"
              >
                <span className="hidden sm:inline">All Builds</span>
              </Button>
            </Link>

            {selectedCount > 0 && (
              <Link to="/compare">
                <Button
                  variant="premium"
                  size="md"
                  leftIcon={<GitCompare className="w-4 h-4" />}
                  className="relative overflow-hidden"
                >
                  <span>Compare ({selectedCount})</span>
                  <div
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-pulse-subtle"
                    style={{ backgroundColor: '#f59e0b', color: 'white' }}
                  >
                    {selectedCount}
                  </div>
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
