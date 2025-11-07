import { Menu, Home, GitCompare, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelectedBuilds } from '../../hooks/useBuilds';

export function Header() {
  const { selectedCount } = useSelectedBuilds();

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
            <Link
              to="/"
              className="btn-premium flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-gray-400 hover:border-primary-500 hover:bg-primary-50 transition-all font-semibold text-gray-900 hover:text-primary-700 group shadow-md hover:shadow-lg"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">All Builds</span>
            </Link>

            {selectedCount > 0 && (
              <Link
                to="/compare"
                className="btn-premium flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold relative overflow-hidden transition-all duration-300"
                style={{
                  background: 'linear-gradient(to right, #4f46e5, #4338ca)',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3), 0 2px 8px rgba(79, 70, 229, 0.2)'
                }}
              >
                <GitCompare className="w-4 h-4" />
                <span>Compare ({selectedCount})</span>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-pulse-subtle"
                     style={{ backgroundColor: '#f59e0b', color: 'white' }}>
                  {selectedCount}
                </div>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
