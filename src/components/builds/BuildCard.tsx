/**
 * BuildCard Component
 * Displays a furniture build (wardrobe or desk) with image carousel, cost summary, and action buttons
 */

import { FileText, Edit, ChevronRight, Check, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
// @ts-ignore - formatters is JS file without type declarations
import { formatCurrency, getSavingsColor } from '@/utils/formatters'
import { useState } from 'react'
import { BuildImageCarousel } from '../BuildImageCarousel'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { FURNITURE_TYPES } from '@/constants/furnitureTypes'

// Type definitions
export interface GalleryImage {
  url: string
  prompt?: string
}

export interface BuildCosts {
  materials?: Array<{
    component: string
    material: string
    thickness: string
    sheets: number
    pricePerSheet: number
    subtotal: number
    sku?: string
    fullName?: string
    note?: string
    area?: string
  }>
  materialTotal: number
  professionalDoorsDrawers?: Record<string, {
    desc: string
    qty: number
    estimate: number
    total: number
  }>
  professionalDoorsDrawersTotal?: number
  hardware?: Array<{
    item: string
    description?: string
    qty: number
    unitPrice: number
    total: number
  }>
  hardwareTotal: number
  extras?: Array<{
    item: string
    desc: string
    estimate: number
  }>
  extrasTotal?: number
  accessories?: Array<{
    item: string
    description?: string
    qty: number
    unitPrice: number
    total: number
  }>
  accessoriesTotal?: number
  grandTotal: number
  savingsVsBudget: number
  savingsPercent?: number
}

export interface Build {
  id: string | number
  name: string
  character: string
  image?: string
  image_gallery?: GalleryImage[] | string
  furnitureType?: typeof FURNITURE_TYPES.WARDROBE.id | typeof FURNITURE_TYPES.DESK.id
  costs: BuildCosts
  materials?: Record<string, {
    material: string
    thickness: string
    sheets: number
    note?: string
    finish?: string
  }>
  extras?: Record<string, {
    desc: string
    estimate: number
  }>
  specialTools?: string[]
  considerations?: string[]
  recommendedFor?: string
}

export interface BuildCardProps {
  build: Build
  isSelected?: boolean
  onToggleSelect?: (id: string | number) => void
  onEdit?: (id: string | number) => void
}

export function BuildCard({
  build,
  isSelected = false,
  onToggleSelect,
  onEdit
}: BuildCardProps) {
  const savingsColor = getSavingsColor(build.costs.savingsVsBudget)
  const [isHovered, setIsHovered] = useState(false)

  // Get the gallery for this build
  const gallery = build.image_gallery || []
  const hasImages = Array.isArray(gallery) ? gallery.length > 0 : false

  // Get furniture type with fallback
  const furnitureType = build.furnitureType || 'wardrobe'
  const isDesk = furnitureType === 'desk'

  return (
    <Card
      variant="premium"
      padding="none"
      interactive
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group animate-fade-in-up
        overflow-hidden
        ${isSelected
          ? 'border-primary-500 ring-4 ring-primary-100 shadow-glow-primary'
          : 'border-gray-100 hover:border-primary-200'
        }
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

          {/* Furniture Type Badge */}
          <Badge
            variant={isDesk ? 'green' : 'blue'}
            size="sm"
            icon={<span>{isDesk ? '🖥️' : '👔'}</span>}
            className="absolute bottom-3 left-3 shadow-lg z-10 bg-gradient-to-r from-current to-current"
          >
            {isDesk ? 'Desk' : 'Wardrobe'}
          </Badge>

          {/* Premium Badge */}
          {build.costs.savingsVsBudget >= 1000 && (
            <Badge
              variant="orange"
              size="sm"
              icon={<Sparkles className="w-3 h-3" />}
              className="absolute top-3 right-3 shadow-lg animate-slide-in-left z-10 bg-gradient-to-r from-accent-500 to-accent-600 text-white border-accent-200"
            >
              Best Value
            </Badge>
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

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-auto">
            {onToggleSelect && (
              <Button
                onClick={() => onToggleSelect(build.id)}
                variant={isSelected ? 'premium' : 'outline'}
                size="md"
                leftIcon={isSelected ? <Check className="w-4 h-4" /> : undefined}
              >
                {isSelected ? 'Selected' : 'Select'}
              </Button>
            )}

            {onEdit && (
              <Button
                onClick={() => onEdit(build.id)}
                variant="icon"
                size="md"
                title="Edit build"
              >
                <Edit className="w-5 h-5" />
              </Button>
            )}

            <Link
              to={`/build/${build.id}`}
              className="flex-1 md:flex-initial"
            >
              <Button
                variant="premium"
                size="md"
                fullWidth
                rightIcon={
                  <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                    isHovered ? 'translate-x-1' : 'translate-x-0'
                  }`} />
                }
              >
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}
