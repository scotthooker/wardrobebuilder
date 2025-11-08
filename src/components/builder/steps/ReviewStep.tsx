/**
 * ReviewStep Component
 * Final step for reviewing wardrobe configuration before saving
 */

import { CheckCircle2, Ruler, Grid3x3, Package, DoorClosed } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface Section {
  type: 'drawers' | 'shelves' | 'rail' | 'double_rail' | 'empty'
  height: number
  drawers?: number
  shelfCount?: number
}

interface Carcass {
  sections: Section[]
}

interface Doors {
  style?: string
  count?: number
}

interface ExternalDrawers {
  count?: number
}

interface Configuration {
  width: number
  height: number
  depth: number
  numCarcasses: number
  carcassWidths?: number[]
  carcasses?: Carcass[]
  doors?: Doors
  externalDrawers?: ExternalDrawers
}

interface ReviewStepProps {
  configuration: Configuration
}

export function ReviewStep({ configuration }: ReviewStepProps) {
  const totalSections = configuration.carcasses?.reduce((sum, c) => sum + c.sections.length, 0) || 0

  const totalDrawers = configuration.carcasses?.reduce((sum, c) => {
    return sum + c.sections.reduce((sectionSum, s) => {
      return sectionSum + (s.type === 'drawers' ? (s.drawers || 0) : 0)
    }, 0)
  }, 0) || 0

  const railCount = configuration.carcasses?.reduce((sum, c) => {
    return sum + c.sections.filter(s => s.type === 'rail' || s.type === 'double_rail').length
  }, 0) || 0

  const shelfCount = configuration.carcasses?.reduce((sum, c) => {
    return sum + c.sections.reduce((sectionSum, s) => {
      return sectionSum + (s.type === 'shelves' ? (s.shelfCount || 0) : 0)
    }, 0)
  }, 0) || 0

  const getSectionLabel = (section: Section): string => {
    switch (section.type) {
      case 'drawers':
        return `${section.drawers} Drawer${section.drawers !== 1 ? 's' : ''}`
      case 'shelves':
        return `${section.shelfCount} Shelf/Shelves`
      case 'rail':
        return 'Hanging Rail'
      case 'double_rail':
        return 'Double Hanging Rail'
      case 'empty':
        return 'Empty Space'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-text-primary">Review Your Configuration</h2>
        </div>
        <p className="text-text-secondary">
          Review all the details of your wardrobe configuration before proceeding to material selection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dimensions Card */}
        <Card variant="default" padding="md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Ruler className="w-5 h-5 text-primary-600" />
              <CardTitle className="text-base font-semibold text-text-primary">Dimensions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-text-secondary">Width:</dt>
                <dd className="font-semibold text-text-primary">{configuration.width}mm</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Height:</dt>
                <dd className="font-semibold text-text-primary">{configuration.height}mm</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Depth:</dt>
                <dd className="font-semibold text-text-primary">{configuration.depth}mm</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Carcass Layout Card */}
        <Card variant="default" padding="md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Grid3x3 className="w-5 h-5 text-primary-600" />
              <CardTitle className="text-base font-semibold text-text-primary">Carcass Layout</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-text-secondary">Number of Carcasses:</dt>
                <dd className="font-semibold text-text-primary">{configuration.numCarcasses}</dd>
              </div>
              {configuration.carcassWidths?.map((width, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <dt className="text-text-secondary">Carcass {index + 1}:</dt>
                  <dd className="text-text-primary">{width}mm</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Interior Components Card */}
        <Card variant="default" padding="md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary-600" />
              <CardTitle className="text-base font-semibold text-text-primary">Interior Components</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-text-secondary">Total Sections:</dt>
                <dd className="font-semibold text-text-primary">
                  <Badge variant="primary" size="sm">{totalSections}</Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Internal Drawers:</dt>
                <dd className="font-semibold text-text-primary">
                  <Badge variant="blue" size="sm">{totalDrawers}</Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Hanging Rails:</dt>
                <dd className="font-semibold text-text-primary">
                  <Badge variant="green" size="sm">{railCount}</Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Shelves:</dt>
                <dd className="font-semibold text-text-primary">
                  <Badge variant="orange" size="sm">{shelfCount}</Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* External Appearance Card */}
        <Card variant="default" padding="md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <DoorClosed className="w-5 h-5 text-primary-600" />
              <CardTitle className="text-base font-semibold text-text-primary">External Appearance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-text-secondary">Door Style:</dt>
                <dd className="font-semibold text-text-primary capitalize">
                  {configuration.doors?.style || 'None'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Number of Doors:</dt>
                <dd className="font-semibold text-text-primary">
                  <Badge variant="default" size="sm">{configuration.doors?.count || 0}</Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">External Drawers:</dt>
                <dd className="font-semibold text-text-primary">
                  <Badge variant="default" size="sm">{configuration.externalDrawers?.count || 0}</Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Carcass Breakdown */}
      <Card variant="default" padding="md">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-text-primary mb-4">
            Detailed Carcass Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configuration.carcasses?.map((carcass, index) => (
              <div key={index} className="border-l-4 border-primary-500 pl-4">
                <h4 className="font-medium text-text-primary mb-2">
                  Carcass {index + 1} ({configuration.carcassWidths?.[index]}mm wide)
                </h4>
                <div className="space-y-1">
                  {carcass.sections.map((section, sIndex) => (
                    <div key={sIndex} className="text-sm text-text-secondary flex items-center gap-2">
                      <span className="w-6 text-center">{sIndex + 1}.</span>
                      <span className="flex-1">
                        {getSectionLabel(section)}
                      </span>
                      <Badge variant="default" size="sm">{section.height}mm</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      <Card variant="default" padding="md" className="bg-green-50 border-green-200">
        <CardContent>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Configuration Complete!</h3>
              <p className="text-sm text-green-700">
                Your wardrobe configuration is ready. Click "Complete Build" to proceed to material selection and pricing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
