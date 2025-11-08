/**
 * Footer Component
 * Application footer with branding, contact links, and attribution
 */

import { Heart, Github, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function Footer() {
  return (
    <footer className="glass-effect border-t border-gray-200/50 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <span className="font-bold text-gray-900">
              Wardrobe Builder
            </span>
            <span className="text-gray-400">•</span>
            <Badge variant="default" size="sm">
              © 2025
            </Badge>
          </div>

          <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            Premium custom wardrobe designs crafted with precision
            <br />
            <Badge variant="primary" size="sm" className="mt-2">
              3100mm × 2370mm standard sizes
            </Badge>
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Button
              variant="icon"
              size="icon"
              onClick={() => window.location.href = 'mailto:contact@example.com'}
              title="Contact us"
              aria-label="Contact us via email"
            >
              <Mail className="w-4 h-4" />
            </Button>
            <Button
              variant="icon"
              size="icon"
              onClick={() => window.open('https://github.com', '_blank', 'noopener,noreferrer')}
              title="GitHub"
              aria-label="Visit our GitHub repository"
            >
              <Github className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse-subtle" /> for woodworking enthusiasts
          </div>
        </div>
      </div>
    </footer>
  )
}
