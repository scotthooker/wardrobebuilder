import { FileText, Edit, ChevronRight, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, getSavingsColor } from '../../utils/formatters';
import { useState } from 'react';
import { BuildImageCarousel } from '../BuildImageCarousel';

export function BuildCard({ build, isSelected, onToggleSelect, onEdit }) {
  const savingsColor = getSavingsColor(build.costs.savingsVsBudget);
  const [isHovered, setIsHovered] = useState(false);

  // Get the gallery for this build
  const gallery = build.image_gallery || [];
  const hasImages = gallery.length > 0;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group card-premium animate-fade-in-up
        bg-white rounded-2xl shadow-premium border-2
        ${isSelected
          ? 'border-primary-500 ring-4 ring-primary-100 shadow-glow-primary'
          : 'border-gray-100 hover:border-primary-200'
        }
        overflow-hidden
      `}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Section with Carousel */}
        <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {hasImages ? (
            <BuildImageCarousel
              gallery={gallery}
              className="w-full h-full"
            />
          ) : build.image ? (
            <img
              src={`/generated_images/${build.image}`}
              alt={build.name}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-wood-100 via-wood-200 to-wood-300">
              <FileText className={`w-16 h-16 text-wood-500 transition-transform duration-500 ${
                isHovered ? 'scale-110 rotate-3' : 'scale-100 rotate-0'
              }`} />
            </div>
          )}

          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-primary-900 to-transparent transition-opacity duration-300 pointer-events-none ${
            isHovered ? 'opacity-30' : 'opacity-0'
          }`} />

          {/* Selection indicator */}
          {isSelected && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-2 rounded-full shadow-lg animate-scale-in z-10">
              <Check className="w-5 h-5" />
            </div>
          )}

          {/* Premium Badge */}
          {build.costs.savingsVsBudget >= 1000 && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-slide-in-left flex items-center gap-1 z-10">
              <Sparkles className="w-3 h-3" />
              Best Value
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Title and Description */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold mb-2 text-gray-900">
              {build.name}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {build.character}
            </p>
          </div>


          {/* Cost Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-xl p-5 mb-4 border border-gray-200 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(build.costs.grandTotal)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">vs Budget</p>
                <p className={`text-2xl font-bold ${savingsColor}`}>
                  {formatCurrency(Math.abs(build.costs.savingsVsBudget))}
                  <span className="text-sm ml-1 font-medium">{build.costs.savingsVsBudget >= 0 ? 'under' : 'over'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Spacious and Clear */}
          <div className="flex flex-wrap gap-3 mt-auto">
            <button
              onClick={() => onToggleSelect(build.id)}
              className={`
                btn-premium px-5 py-2.5 rounded-xl font-semibold transition-all duration-300
                ${isSelected
                  ? ''
                  : 'bg-gray-100 border-2 border-gray-300 text-gray-800 hover:border-primary-400 hover:text-primary-700 hover:bg-primary-100'
                }
              `}
              style={isSelected ? {
                background: 'linear-gradient(to right, #4f46e5, #4338ca)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3), 0 2px 8px rgba(79, 70, 229, 0.2)'
              } : {}}
            >
              {isSelected ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Selected
                </span>
              ) : 'Select'}
            </button>

            <button
              onClick={() => onEdit(build.id)}
              className="btn-premium px-4 py-2.5 bg-gray-100 border-2 border-gray-300 rounded-xl hover:border-primary-400 hover:bg-primary-100 transition-all group"
              title="Edit build"
            >
              <Edit className="w-5 h-5 text-gray-700 group-hover:text-primary-700 transition-colors" />
            </button>

            <Link
              to={`/build/${build.id}`}
              className="btn-premium px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 flex-1 justify-center md:flex-initial transition-all duration-300"
              style={{
                background: 'linear-gradient(to right, #4f46e5, #4338ca)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3), 0 2px 8px rgba(79, 70, 229, 0.2)'
              }}
            >
              View Details
              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                isHovered ? 'translate-x-1' : 'translate-x-0'
              }`} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
