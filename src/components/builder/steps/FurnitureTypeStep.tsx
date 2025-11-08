import { getFurnitureTypes, type FurnitureType } from '../../../constants/furnitureTypes'
import { Card, CardContent } from '@/components/ui/Card'

interface Configuration {
  furnitureType?: string
}

interface FurnitureTypeStepProps {
  configuration: Configuration
  updateConfiguration: (updates: Partial<Configuration>) => void
}

export function FurnitureTypeStep({ configuration, updateConfiguration }: FurnitureTypeStepProps) {
  const furnitureTypes = getFurnitureTypes()

  const handleSelectType = (furnitureType: FurnitureType) => {
    updateConfiguration({ furnitureType: furnitureType.id })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-primary mb-2">
          Choose Furniture Type
        </h2>
        <p className="text-text-secondary">
          Select the type of built-in furniture you want to create
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {furnitureTypes.map((type) => {
          const isSelected = configuration.furnitureType === type.id

          return (
            <Card
              key={type.id}
              variant={isSelected ? 'elevated' : 'default'}
              padding="lg"
              interactive
              onClick={() => handleSelectType(type)}
              className={`
                relative transition-all duration-200
                ${isSelected
                  ? `border-${type.color}-600 bg-${type.color}-50 shadow-lg transform scale-105`
                  : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                }
              `}
            >
              <CardContent>
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icon */}
                  <div className={`
                    text-6xl w-24 h-24 flex items-center justify-center rounded-full
                    ${isSelected
                      ? `bg-${type.color}-100`
                      : 'bg-gray-100'
                    }
                  `}>
                    {type.icon}
                  </div>

                  {/* Name */}
                  <h3 className={`
                    text-2xl font-bold
                    ${isSelected
                      ? `text-${type.color}-900`
                      : 'text-text-primary'
                    }
                  `}>
                    {type.name}
                  </h3>

                  {/* Description */}
                  <p className={`
                    text-sm leading-relaxed
                    ${isSelected
                      ? `text-${type.color}-700`
                      : 'text-text-secondary'
                    }
                  `}>
                    {type.description}
                  </p>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className={`
                      absolute top-4 right-4 w-8 h-8 rounded-full
                      bg-${type.color}-600 text-white flex items-center justify-center
                    `}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {configuration.furnitureType && (
        <Card variant="glass" padding="md" className="mt-8 border-blue-200 bg-blue-50">
          <p className="text-sm text-blue-800 text-center">
            <strong>{getFurnitureTypes().find(t => t.id === configuration.furnitureType)?.name}</strong> selected.
            Click "Next" to continue with configuration.
          </p>
        </Card>
      )}
    </div>
  )
}
