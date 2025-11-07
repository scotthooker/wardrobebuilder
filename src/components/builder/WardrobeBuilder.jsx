import { useState } from 'react';
import { DimensionsStep } from './steps/DimensionsStep';
import { CarcassLayoutStep } from './steps/CarcassLayoutStep';
import { InteriorDesignStep } from './steps/InteriorDesignStep';
import { DoorsDrawersStep } from './steps/DoorsDrawersStep';
import { ReviewStep } from './steps/ReviewStep';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const STEPS = [
  { id: 'dimensions', name: 'Dimensions', component: DimensionsStep },
  { id: 'carcasses', name: 'Carcass Layout', component: CarcassLayoutStep },
  { id: 'interior', name: 'Interior Design', component: InteriorDesignStep },
  { id: 'doors', name: 'Doors & Drawers', component: DoorsDrawersStep },
  { id: 'review', name: 'Review', component: ReviewStep },
];

export function WardrobeBuilder({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [configuration, setConfiguration] = useState({
    // Dimensions
    width: 2400, // mm
    height: 2400, // mm
    depth: 600, // mm

    // Carcass layout - vertical sections (columns) with stacked carcasses
    sections: [], // Each section has: { id, width, carcasses: [{ id, height, interiorSections: [] }] }

    // External appearance
    doors: {
      style: 'hinged', // hinged, sliding, none
      count: 3,
      configuration: [] // Door assignments to carcasses
    },
    externalDrawers: {
      count: 0,
      positions: [] // Which carcass sections have external drawers
    }
  });

  const CurrentStepComponent = STEPS[currentStep].component;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - complete configuration
      onComplete(configuration);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex) => {
    // Allow jumping to previous steps, not future ones
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const updateConfiguration = (updates) => {
    setConfiguration(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-between items-center py-4">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center cursor-pointer"
                onClick={() => handleStepClick(index)}
              >
                <div className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${index === currentStep
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : index < currentStep
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                    }
                  `}>
                    {index < currentStep ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      index === currentStep ? 'text-primary-600' :
                      index < currentStep ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`hidden sm:block w-12 md:w-20 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <CurrentStepComponent
            configuration={configuration}
            updateConfiguration={updateConfiguration}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={currentStep === 0 ? onCancel : handleBack}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
          >
            {currentStep === STEPS.length - 1 ? 'Complete Build' : 'Next'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
