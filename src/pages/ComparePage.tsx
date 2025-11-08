/**
 * ComparePage Component
 * Side-by-side comparison of selected furniture builds with detailed metrics
 * Supports both wardrobes and desks with cost analysis and recommendations
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// @ts-ignore - buildsStore is JS file without type declarations
import { useBuildsStore } from '../store/buildsStore'
// @ts-ignore - formatters is JS file without type declarations
import { formatCurrency } from '../utils/formatters'
import {
  FileDown,
  Printer,
  X,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Build } from '@/components/builds/BuildCard'

/**
 * Comparison row props interface
 */
interface ComparisonRowProps {
  /** Row label displayed in left column */
  label: string
  /** Values to display in each column (one per build) */
  values: (string | number)[]
  /** Custom render function for cell content */
  renderCell?: (value: string | number, build: Build) => React.ReactNode
  /** Highlight lowest or highest values */
  highlight?: 'lowest' | 'highest'
  /** Array of builds being compared (required if highlight is used) */
  selectedBuilds?: Build[]
  /** Function to extract numeric value from build (required if highlight is used) */
  valueGetter?: (build: Build) => number
}

/**
 * Recommendation card props interface
 */
interface RecommendationCardProps {
  /** Recommendation title */
  title: string
  /** Recommendation description */
  description: string
  /** Icon or emoji */
  icon: string
  /** Color variant */
  variant: 'success' | 'primary' | 'warning'
}

export function ComparePage() {
  const navigate = useNavigate()
  const { getSelectedBuilds, clearSelection } = useBuildsStore()
  const selectedBuilds = getSelectedBuilds() as Build[]

  useEffect(() => {
    // Redirect if no builds selected
    if (selectedBuilds.length === 0) {
      navigate('/')
    }
  }, [selectedBuilds.length, navigate])

  if (selectedBuilds.length === 0) {
    return null
  }

  /**
   * Count interior sections of a specific type in a build
   */
  const getInteriorTypeCount = (build: Build, type: string): number => {
    let count = 0
    const sections = (build as any).configuration?.sections

    if (!sections) return 0

    sections.forEach((section: any) => {
      section.carcasses?.forEach((carcass: any) => {
        carcass.interiorSections?.forEach((interior: any) => {
          if (
            interior.type === type ||
            (type === 'rail' && interior.type === 'double_rail')
          ) {
            count++
          }
        })
      })
    })

    return count
  }

  /**
   * Count total drawers in a build
   */
  const getTotalDrawers = (build: Build): number => {
    let count = 0
    const sections = (build as any).configuration?.sections

    if (!sections) return 0

    sections.forEach((section: any) => {
      section.carcasses?.forEach((carcass: any) => {
        carcass.interiorSections?.forEach((interior: any) => {
          if (interior.type === 'drawers') {
            count += interior.drawers || 0
          }
        })
      })
    })

    return count
  }

  /**
   * Count total shelves in a build
   */
  const getTotalShelves = (build: Build): number => {
    let count = 0
    const sections = (build as any).configuration?.sections

    if (!sections) return 0

    sections.forEach((section: any) => {
      section.carcasses?.forEach((carcass: any) => {
        carcass.interiorSections?.forEach((interior: any) => {
          if (interior.type === 'shelves') {
            count += interior.shelfCount || 0
          }
        })
      })
    })

    return count
  }

  /**
   * Export comparison data to CSV file
   */
  const exportToCSV = (): void => {
    const rows: (string | number)[][] = []

    // Header
    rows.push(['Comparison', ...selectedBuilds.map((b) => b.name)])
    rows.push(['']) // Empty row

    // Overview
    rows.push(['OVERVIEW', ...Array(selectedBuilds.length).fill('')])
    rows.push([
      'Cost',
      ...selectedBuilds.map((b) => formatCurrency(b.costs.grandTotal)),
    ])
    rows.push([
      'Savings vs Budget',
      ...selectedBuilds.map((b) => formatCurrency(b.costs.savingsVsBudget)),
    ])
    rows.push(['']) // Empty row

    // Dimensions
    rows.push(['DIMENSIONS', ...Array(selectedBuilds.length).fill('')])
    rows.push(['Width (mm)', ...selectedBuilds.map((b) => (b as any).width)])
    rows.push(['Height (mm)', ...selectedBuilds.map((b) => (b as any).height)])
    rows.push(['Depth (mm)', ...selectedBuilds.map((b) => (b as any).depth)])
    rows.push(['']) // Empty row

    // Configuration
    rows.push(['CONFIGURATION', ...Array(selectedBuilds.length).fill('')])
    rows.push([
      'Sections',
      ...selectedBuilds.map(
        (b) => (b as any).configuration?.sections?.length || 0
      ),
    ])
    rows.push([
      'Carcasses',
      ...selectedBuilds.map((b) => {
        return (
          (b as any).configuration?.sections?.reduce(
            (sum: number, s: any) => sum + (s.carcasses?.length || 0),
            0
          ) || 0
        )
      }),
    ])
    rows.push([
      'Door Style',
      ...selectedBuilds.map(
        (b) => (b as any).configuration?.doors?.style || 'N/A'
      ),
    ])
    rows.push([
      'Hanging Rails',
      ...selectedBuilds.map((b) => getInteriorTypeCount(b, 'rail')),
    ])
    rows.push(['Drawers', ...selectedBuilds.map((b) => getTotalDrawers(b))])
    rows.push(['Shelves', ...selectedBuilds.map((b) => getTotalShelves(b))])

    // Convert to CSV
    const csvContent = rows
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wardrobe-comparison-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Print the current page
   */
  const handlePrint = (): void => {
    window.print()
  }

  /**
   * Clear selection and return to home page
   */
  const handleClearAndReturn = (): void => {
    clearSelection()
    navigate('/')
  }

  return (
    <div className="min-h-screen py-8 animate-fade-in-up">
      {/* Header */}
      <Card variant="glass" padding="md" className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="icon"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Compare Builds
              </h1>
              <p className="text-gray-600 mt-1">
                Side-by-side comparison of {selectedBuilds.length} selected{' '}
                {selectedBuilds.length === 1 ? 'build' : 'builds'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="md"
              leftIcon={<FileDown className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="md"
              leftIcon={<Printer className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button
              onClick={handleClearAndReturn}
              variant="outline"
              size="md"
              leftIcon={<X className="w-4 h-4" />}
              className="hover:border-red-400 hover:bg-red-50 hover:text-red-700"
            >
              <span className="hidden sm:inline">Clear & Return</span>
            </Button>
          </div>
        </div>

        {/* Visual Comparison - Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {selectedBuilds.map((build) => (
            <div key={build.id} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300">
                {build.image ? (
                  <img
                    src={`/generated_images/${build.image}`}
                    alt={build.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="mt-2 text-center">
                <h3 className="font-bold text-gray-900">{build.name}</h3>
                <p className="text-sm text-gray-600">
                  {formatCurrency(build.costs.grandTotal)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Comparison Table */}
      <Card variant="glass" padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-primary-50 to-primary-100 border-b-2 border-primary-200">
              <tr>
                <th className="text-left p-4 font-bold text-primary-900 sticky left-0 bg-gradient-to-r from-primary-50 to-primary-100 z-10">
                  Category
                </th>
                {selectedBuilds.map((build) => (
                  <th
                    key={build.id}
                    className="text-center p-4 font-bold text-primary-900 min-w-[200px]"
                  >
                    {build.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* QUICK OVERVIEW */}
              <tr className="bg-gray-50">
                <td
                  colSpan={selectedBuilds.length + 1}
                  className="p-3 font-bold text-gray-900 text-sm uppercase tracking-wide"
                >
                  Quick Overview
                </td>
              </tr>

              <ComparisonRow
                label="Character"
                values={selectedBuilds.map((b) => b.character)}
              />

              <ComparisonRow
                label="Recommended For"
                values={selectedBuilds.map((b) => b.recommendedFor || 'N/A')}
              />

              {/* COST ANALYSIS */}
              <tr className="bg-gray-50">
                <td
                  colSpan={selectedBuilds.length + 1}
                  className="p-3 font-bold text-gray-900 text-sm uppercase tracking-wide"
                >
                  Cost Analysis
                </td>
              </tr>

              <ComparisonRow
                label="Total Cost"
                values={selectedBuilds.map((b) =>
                  formatCurrency(b.costs.grandTotal)
                )}
                renderCell={(value) => (
                  <span className="text-lg font-bold text-gray-900">
                    {value}
                  </span>
                )}
                highlight="lowest"
                selectedBuilds={selectedBuilds}
                valueGetter={(b) => b.costs.grandTotal}
              />

              <ComparisonRow
                label="vs £5,000 Budget"
                values={selectedBuilds.map((b) =>
                  formatCurrency(Math.abs(b.costs.savingsVsBudget))
                )}
                renderCell={(value, build) => (
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`text-lg font-bold ${
                        build.costs.savingsVsBudget >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {value}
                    </span>
                    <Badge
                      variant={
                        build.costs.savingsVsBudget >= 0 ? 'success' : 'error'
                      }
                      size="sm"
                    >
                      {build.costs.savingsVsBudget >= 0
                        ? 'under budget'
                        : 'over budget'}
                    </Badge>
                  </div>
                )}
                highlight="highest"
                selectedBuilds={selectedBuilds}
                valueGetter={(b) => b.costs.savingsVsBudget}
              />

              <ComparisonRow
                label="Materials"
                values={selectedBuilds.map((b) =>
                  formatCurrency(b.costs.materialTotal)
                )}
              />

              <ComparisonRow
                label="Doors & Drawers"
                values={selectedBuilds.map((b) =>
                  formatCurrency(b.costs.professionalDoorsDrawersTotal || 0)
                )}
              />

              <ComparisonRow
                label="Hardware"
                values={selectedBuilds.map((b) =>
                  formatCurrency(b.costs.hardwareTotal)
                )}
              />

              <ComparisonRow
                label="Extras"
                values={selectedBuilds.map((b) =>
                  formatCurrency(b.costs.extrasTotal || 0)
                )}
              />

              {/* DIMENSIONS */}
              <tr className="bg-gray-50">
                <td
                  colSpan={selectedBuilds.length + 1}
                  className="p-3 font-bold text-gray-900 text-sm uppercase tracking-wide"
                >
                  Physical Dimensions
                </td>
              </tr>

              <ComparisonRow
                label="Width"
                values={selectedBuilds.map((b) => `${(b as any).width}mm`)}
                renderCell={(value) => (
                  <span className="font-mono">{value}</span>
                )}
              />

              <ComparisonRow
                label="Height"
                values={selectedBuilds.map((b) => `${(b as any).height}mm`)}
                renderCell={(value) => (
                  <span className="font-mono">{value}</span>
                )}
              />

              <ComparisonRow
                label="Depth"
                values={selectedBuilds.map((b) => `${(b as any).depth}mm`)}
                renderCell={(value) => (
                  <span className="font-mono">{value}</span>
                )}
              />

              <ComparisonRow
                label="Total Volume"
                values={selectedBuilds.map((b) => {
                  const build = b as any
                  const volumeM3 =
                    (build.width * build.height * build.depth) / 1000000000
                  return `${volumeM3.toFixed(2)} m³`
                })}
              />

              {/* CONFIGURATION */}
              <tr className="bg-gray-50">
                <td
                  colSpan={selectedBuilds.length + 1}
                  className="p-3 font-bold text-gray-900 text-sm uppercase tracking-wide"
                >
                  Build Configuration
                </td>
              </tr>

              <ComparisonRow
                label="Sections"
                values={selectedBuilds.map(
                  (b) => (b as any).configuration?.sections?.length || 0
                )}
              />

              <ComparisonRow
                label="Total Carcasses"
                values={selectedBuilds.map((b) => {
                  return (
                    (b as any).configuration?.sections?.reduce(
                      (sum: number, s: any) => sum + (s.carcasses?.length || 0),
                      0
                    ) || 0
                  )
                })}
              />

              <ComparisonRow
                label="Door Style"
                values={selectedBuilds.map((b) => {
                  const style = (b as any).configuration?.doors?.style || 'none'
                  return style.charAt(0).toUpperCase() + style.slice(1)
                })}
                renderCell={(value) => (
                  <Badge variant="primary" size="sm">
                    {value}
                  </Badge>
                )}
              />

              {/* INTERIOR ORGANIZATION */}
              <tr className="bg-gray-50">
                <td
                  colSpan={selectedBuilds.length + 1}
                  className="p-3 font-bold text-gray-900 text-sm uppercase tracking-wide"
                >
                  Interior Organization
                </td>
              </tr>

              <ComparisonRow
                label="Hanging Rails"
                values={selectedBuilds.map((b) => getInteriorTypeCount(b, 'rail'))}
                highlight="highest"
                selectedBuilds={selectedBuilds}
                valueGetter={(b) => getInteriorTypeCount(b, 'rail')}
              />

              <ComparisonRow
                label="Total Drawers"
                values={selectedBuilds.map((b) => getTotalDrawers(b))}
                highlight="highest"
                selectedBuilds={selectedBuilds}
                valueGetter={(b) => getTotalDrawers(b)}
              />

              <ComparisonRow
                label="Total Shelves"
                values={selectedBuilds.map((b) => getTotalShelves(b))}
                highlight="highest"
                selectedBuilds={selectedBuilds}
                valueGetter={(b) => getTotalShelves(b)}
              />

              {/* SPECIAL CONSIDERATIONS */}
              <tr className="bg-gray-50">
                <td
                  colSpan={selectedBuilds.length + 1}
                  className="p-3 font-bold text-gray-900 text-sm uppercase tracking-wide"
                >
                  Special Considerations
                </td>
              </tr>

              <ComparisonRow
                label="Key Considerations"
                values={selectedBuilds.map(
                  (b) => b.considerations?.slice(0, 3).join('; ') || 'None'
                )}
                renderCell={(value) => (
                  <div className="text-sm text-gray-700 text-left">{value}</div>
                )}
              />

              <ComparisonRow
                label="Special Tools"
                values={selectedBuilds.map((b) =>
                  b.specialTools?.length && b.specialTools.length > 0
                    ? `${b.specialTools.length} required`
                    : 'Basic tools only'
                )}
              />
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recommendation Panel */}
      <Card variant="glass" padding="md" className="mt-8 print:hidden">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary-600" />
          Professional Recommendations
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Best Value */}
          <RecommendationCard
            title="Best Value"
            description={(() => {
              const bestValue = selectedBuilds.reduce((best, build) =>
                build.costs.savingsVsBudget > best.costs.savingsVsBudget
                  ? build
                  : best
              )
              return `${bestValue.name} offers the most savings at ${formatCurrency(
                bestValue.costs.savingsVsBudget
              )} under budget.`
            })()}
            icon="£"
            variant="success"
          />

          {/* Most Storage */}
          <RecommendationCard
            title="Most Storage"
            description={(() => {
              const mostStorage = selectedBuilds.reduce((best, build) => {
                const storage =
                  getTotalDrawers(build) +
                  getTotalShelves(build) +
                  getInteriorTypeCount(build, 'rail')
                const bestStorage =
                  getTotalDrawers(best) +
                  getTotalShelves(best) +
                  getInteriorTypeCount(best, 'rail')
                return storage > bestStorage ? build : best
              })
              return `${mostStorage.name} maximizes organization with ${getTotalDrawers(
                mostStorage
              )} drawers, ${getTotalShelves(
                mostStorage
              )} shelves, and ${getInteriorTypeCount(mostStorage, 'rail')} rails.`
            })()}
            icon="📦"
            variant="primary"
          />

          {/* Premium Choice */}
          <RecommendationCard
            title="Premium Choice"
            description={(() => {
              const premiumChoice = selectedBuilds.reduce((best, build) =>
                build.costs.grandTotal > best.costs.grandTotal ? build : best
              )
              return `${premiumChoice.name} represents the highest quality with premium materials and craftsmanship.`
            })()}
            icon="⭐"
            variant="warning"
          />
        </div>
      </Card>
    </div>
  )
}

/**
 * Reusable comparison row component
 * Displays a single row in the comparison table with optional highlighting
 */
function ComparisonRow({
  label,
  values,
  renderCell,
  highlight,
  selectedBuilds,
  valueGetter,
}: ComparisonRowProps) {
  // Determine which cells to highlight
  let highlightedIndices: number[] = []
  if (highlight && selectedBuilds && valueGetter) {
    const numericValues = selectedBuilds.map(valueGetter)
    if (highlight === 'lowest') {
      const minValue = Math.min(...numericValues)
      highlightedIndices = numericValues
        .map((v, i) => (v === minValue ? i : -1))
        .filter((i) => i !== -1)
    } else if (highlight === 'highest') {
      const maxValue = Math.max(...numericValues)
      highlightedIndices = numericValues
        .map((v, i) => (v === maxValue ? i : -1))
        .filter((i) => i !== -1)
    }
  }

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10 border-r border-gray-200">
        {label}
      </td>
      {values.map((value, index) => {
        const isHighlighted = highlightedIndices.includes(index)
        const build = selectedBuilds?.[index]

        return (
          <td
            key={index}
            className={`p-4 text-center ${
              isHighlighted ? 'bg-primary-50 font-semibold' : ''
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {renderCell && build ? renderCell(value, build) : value}
              {isHighlighted && (
                <CheckCircle className="w-4 h-4 text-primary-600" />
              )}
            </div>
          </td>
        )
      })}
    </tr>
  )
}

/**
 * Recommendation card component
 * Displays a highlighted recommendation with icon and description
 */
function RecommendationCard({
  title,
  description,
  icon,
  variant,
}: RecommendationCardProps) {
  const colorClasses = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-500',
      titleText: 'text-green-900',
      descText: 'text-green-800',
    },
    primary: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-500',
      titleText: 'text-blue-900',
      descText: 'text-blue-800',
    },
    warning: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      iconBg: 'bg-purple-500',
      titleText: 'text-purple-900',
      descText: 'text-purple-800',
    },
  }

  const colors = colorClasses[variant]

  return (
    <div className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 ${colors.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
        >
          <span className="text-white font-bold text-lg">{icon}</span>
        </div>
        <div>
          <h3 className={`font-bold ${colors.titleText} mb-1`}>{title}</h3>
          <p className={`text-sm ${colors.descText}`}>{description}</p>
        </div>
      </div>
    </div>
  )
}
