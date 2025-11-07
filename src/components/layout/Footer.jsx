import { Heart, Github, Mail } from 'lucide-react';

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
            <span className="text-sm">© 2025</span>
          </div>

          <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            Premium custom wardrobe designs crafted with precision
            <br />
            <span className="text-xs text-gray-500">3100mm × 2370mm standard sizes</span>
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <a
              href="mailto:contact@example.com"
              className="btn-premium p-2 rounded-lg hover:bg-primary-50 text-gray-600 hover:text-primary-600 transition-all"
              title="Contact us"
            >
              <Mail className="w-4 h-4" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium p-2 rounded-lg hover:bg-primary-50 text-gray-600 hover:text-primary-600 transition-all"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>

          <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse-subtle" /> for woodworking enthusiasts
          </div>
        </div>
      </div>
    </footer>
  );
}
