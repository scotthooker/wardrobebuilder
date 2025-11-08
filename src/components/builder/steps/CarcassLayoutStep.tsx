/**
 * CarcassLayoutStep Component
 * Wizard step for configuring carcass layout with sections and material selection
 * Uses the new UI component library for consistent styling
 */

import { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft, Plus } from 'lucide-react';
// @ts-ignore - useMaterials is a JS file, will be migrated separately
import { useMaterials } from '../../../hooks/useMaterials';
import { Button } from '../../ui/Button';
import { ButtonGroup } from '../../ui/ButtonGroup';
import { Input } from '../../ui/Input';
import { Card, CardContent } from '../../ui/Card';

// Types and Interfaces
export interface MaterialOption {
  material?: string;
  thickness: string;
  thicknessNum?: number;
  price: number;
  sku?: string;
}

export interface Material {
  id?: number;
  name: string;
  category?: string;
  type?: string;
  recommended?: boolean;
  description?: string;
  usage?: string;
  image?: string | null;
  options: MaterialOption[];
}

export interface InteriorSection {
  id: number;
  type: 'drawers' | 'rail' | 'shelves' | 'double_rail' | 'empty';
  height: number;
  drawers?: number | null;
  shelfCount?: number | null;
  railCount?: number | null;
  isExternal?: boolean | null;
}

export interface Carcass {
  id: number;
  height: number;
  width: number;
  material: MaterialOption;
  interiorSections: InteriorSection[];
}

export interface Section {
  id: number;
  width: number;
  carcasses: Carcass[];
}

export interface Configuration {
  width: number;
  height: number;
  depth: number;
  sections?: Section[];
}

export interface CarcassLayoutStepProps {
  configuration: Configuration;
  updateConfiguration: (updates: Partial<Configuration>) => void;
}

interface SectionType {
  id: string;
  name: string;
  icon: string;
  minHeight: number;
  defaultCount: number;
}

const SECTION_TYPES: Record<string, SectionType> = {
  DRAWERS: { id: 'drawers', name: 'Drawers', icon: '🗄️', minHeight: 150, defaultCount: 3 },
  RAIL: { id: 'rail', name: 'Hanging Rail', icon: '👔', minHeight: 800, defaultCount: 1 },
  SHELVES: { id: 'shelves', name: 'Shelves', icon: '📚', minHeight: 300, defaultCount: 4 },
  DOUBLE_RAIL: { id: 'double_rail', name: 'Double Rail', icon: '👔👔', minHeight: 1600, defaultCount: 2 },
  EMPTY: { id: 'empty', name: 'Empty Space', icon: '⬜', minHeight: 100, defaultCount: 1 },
};

type WizardStep = 'SELECT_COLUMNS' | 'SET_CARCASS_HEIGHT' | 'CONFIGURE_CARCASS' | 'REVIEW';

export function CarcassLayoutStep({ configuration, updateConfiguration }: CarcassLayoutStepProps) {
  // Materials hook
  const { materials, isLoading: materialsLoading, getDefaultMaterialOption } = useMaterials();

  // Wizard state
  const [wizardStep, setWizardStep] = useState<WizardStep>('SELECT_COLUMNS');
  const [numberOfColumns, setNumberOfColumns] = useState(1);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const [currentCarcassIndex, setCurrentCarcassIndex] = useState(0);
  const [currentCarcassHeight, setCurrentCarcassHeight] = useState(0);
  const [currentCarcassMaterial, setCurrentCarcassMaterial] = useState<MaterialOption | null>(null);

  // Initialize default material when materials load
  useEffect(() => {
    if (!materialsLoading && !currentCarcassMaterial) {
      const defaultOption = getDefaultMaterialOption();
      if (defaultOption) {
        setCurrentCarcassMaterial(defaultOption);
      }
    }
  }, [materialsLoading, currentCarcassMaterial, getDefaultMaterialOption]);

  // Restore from existing config
  useEffect(() => {
    if (configuration.sections && configuration.sections.length > 0) {
      setNumberOfColumns(configuration.sections.length);
      setWizardStep('REVIEW');
    }
  }, []);

  // Start configuring columns
  const handleColumnsSelected = () => {
    setWizardStep('SET_CARCASS_HEIGHT');
    setCurrentColumnIndex(0);
    setCurrentCarcassIndex(0);

    // Calculate initial carcass height suggestion
    const remainingHeight = configuration.height;
    setCurrentCarcassHeight(remainingHeight);
  };

  // Move from height selection to interior configuration
  const handleHeightSelected = () => {
    setWizardStep('CONFIGURE_CARCASS');
  };

  // Save current carcass interior and move to next
  const handleCarcassComplete = (interiorSections: InteriorSection[], addAnother = false) => {
    const sections = configuration.sections || [];
    const columnWidth = Math.floor(configuration.width / numberOfColumns);

    // Initialize or update the current section
    if (!sections[currentColumnIndex]) {
      sections[currentColumnIndex] = {
        id: currentColumnIndex,
        width: columnWidth,
        carcasses: []
      };
    }

    // Add or update the current carcass
    sections[currentColumnIndex].carcasses[currentCarcassIndex] = {
      id: currentCarcassIndex,
      height: currentCarcassHeight,
      width: columnWidth,
      interiorSections: interiorSections,
      material: currentCarcassMaterial!
    };

    updateConfiguration({ sections: [...sections] });

    // Calculate remaining height in this column
    const usedHeight = sections[currentColumnIndex].carcasses.reduce((sum, c) => sum + c.height, 0);
    const remainingHeight = configuration.height - usedHeight;

    if (addAnother && remainingHeight >= 300) {
      // Add another carcass to this column
      setCurrentCarcassIndex(currentCarcassIndex + 1);
      setCurrentCarcassHeight(remainingHeight);
      setWizardStep('SET_CARCASS_HEIGHT');
    } else if (currentColumnIndex < numberOfColumns - 1) {
      // Move to next column
      setCurrentColumnIndex(currentColumnIndex + 1);
      setCurrentCarcassIndex(0);
      setCurrentCarcassHeight(configuration.height);
      setWizardStep('SET_CARCASS_HEIGHT');
    } else {
      // All done
      setWizardStep('REVIEW');
    }
  };

  // Skip carcass configuration (empty carcass)
  const handleSkipCarcass = () => {
    handleCarcassComplete([]);
  };

  // Go back in wizard
  const handleBack = () => {
    if (wizardStep === 'CONFIGURE_CARCASS') {
      setWizardStep('SET_CARCASS_HEIGHT');
    } else if (wizardStep === 'SET_CARCASS_HEIGHT' && currentCarcassIndex > 0) {
      // Go back to previous carcass in same column
      setCurrentCarcassIndex(currentCarcassIndex - 1);
      const previousCarcass = configuration.sections?.[currentColumnIndex]?.carcasses?.[currentCarcassIndex - 1];
      if (previousCarcass) {
        setCurrentCarcassHeight(previousCarcass.height);
        setWizardStep('CONFIGURE_CARCASS');
      }
    } else if (wizardStep === 'SET_CARCASS_HEIGHT' && currentCarcassIndex === 0 && currentColumnIndex > 0) {
      // Go back to previous column
      setCurrentColumnIndex(currentColumnIndex - 1);
      const previousColumn = configuration.sections?.[currentColumnIndex - 1];
      if (previousColumn) {
        setCurrentCarcassIndex(previousColumn.carcasses.length - 1);
        const lastCarcass = previousColumn.carcasses[previousColumn.carcasses.length - 1];
        setCurrentCarcassHeight(lastCarcass.height);
        setWizardStep('CONFIGURE_CARCASS');
      }
    } else if (wizardStep === 'SET_CARCASS_HEIGHT' && currentCarcassIndex === 0 && currentColumnIndex === 0) {
      setWizardStep('SELECT_COLUMNS');
    } else if (wizardStep === 'REVIEW') {
      const lastColumn = configuration.sections![configuration.sections!.length - 1];
      setCurrentColumnIndex(configuration.sections!.length - 1);
      setCurrentCarcassIndex(lastColumn.carcasses.length - 1);
      const lastCarcass = lastColumn.carcasses[lastColumn.carcasses.length - 1];
      setCurrentCarcassHeight(lastCarcass.height);
      setWizardStep('CONFIGURE_CARCASS');
    }
  };

  // Edit specific column/carcass from review
  const handleEdit = (columnIdx: number, carcassIdx: number) => {
    setCurrentColumnIndex(columnIdx);
    setCurrentCarcassIndex(carcassIdx);
    const carcass = configuration.sections![columnIdx].carcasses[carcassIdx];
    setCurrentCarcassHeight(carcass.height);
    setWizardStep('CONFIGURE_CARCASS');
  };

  // Calculate remaining height for current column
  const getRemainingHeight = () => {
    const currentSection = configuration.sections?.[currentColumnIndex];
    if (!currentSection) return configuration.height;

    const usedHeight = currentSection.carcasses
      .slice(0, currentCarcassIndex)
      .reduce((sum, c) => sum + c.height, 0);
    return configuration.height - usedHeight;
  };

  // Render current wizard step
  const renderContent = () => {
    if (wizardStep === 'SELECT_COLUMNS') {
      return <SelectColumnsView
        numberOfColumns={numberOfColumns}
        setNumberOfColumns={setNumberOfColumns}
        onNext={handleColumnsSelected}
        wardrobeWidth={configuration.width}
      />;
    }

    if (wizardStep === 'SET_CARCASS_HEIGHT') {
      const remainingHeight = getRemainingHeight();
      return <SetCarcassHeightView
        columnIndex={currentColumnIndex}
        carcassIndex={currentCarcassIndex}
        totalColumns={numberOfColumns}
        carcassHeight={currentCarcassHeight}
        setCarcassHeight={setCurrentCarcassHeight}
        remainingHeight={remainingHeight}
        onNext={handleHeightSelected}
        onBack={handleBack}
        wardrobeHeight={configuration.height}
        materials={materials}
        materialsLoading={materialsLoading}
        selectedMaterial={currentCarcassMaterial}
        onMaterialChange={setCurrentCarcassMaterial}
      />;
    }

    if (wizardStep === 'CONFIGURE_CARCASS') {
      const currentCarcass = configuration.sections?.[currentColumnIndex]?.carcasses?.[currentCarcassIndex];
      const remainingHeight = getRemainingHeight();
      const canAddAnother = (remainingHeight - currentCarcassHeight) >= 300;

      return <ConfigureCarcassView
        columnIndex={currentColumnIndex}
        carcassIndex={currentCarcassIndex}
        totalColumns={numberOfColumns}
        currentInterior={currentCarcass?.interiorSections || []}
        carcassHeight={currentCarcassHeight}
        canAddAnother={canAddAnother}
        onComplete={handleCarcassComplete}
        onSkip={handleSkipCarcass}
        onBack={handleBack}
      />;
    }

    if (wizardStep === 'REVIEW') {
      return <ReviewView
        sections={configuration.sections!}
        wardrobeWidth={configuration.width}
        wardrobeHeight={configuration.height}
        onEdit={handleEdit}
        onBack={handleBack}
      />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="bg-white border-2 border-primary-200 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <div className={`flex items-center gap-2 ${wizardStep === 'SELECT_COLUMNS' ? 'text-primary-600 font-semibold' : 'text-green-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${wizardStep === 'SELECT_COLUMNS' ? 'bg-primary-600 text-white' : 'bg-green-600 text-white'}`}>
              {wizardStep === 'SELECT_COLUMNS' ? '1' : '✓'}
            </div>
            <span>Columns</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mx-4" />
          <div className={`flex items-center gap-2 ${wizardStep === 'SET_CARCASS_HEIGHT' || wizardStep === 'CONFIGURE_CARCASS' || wizardStep === 'REVIEW' ? 'text-primary-600 font-semibold' : 'text-text-tertiary'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${wizardStep === 'REVIEW' ? 'bg-green-600 text-white' : wizardStep === 'SET_CARCASS_HEIGHT' || wizardStep === 'CONFIGURE_CARCASS' ? 'bg-primary-600 text-white' : 'bg-gray-300 text-text-secondary'}`}>
              {wizardStep === 'REVIEW' ? '✓' : '2'}
            </div>
            <span>Configure Carcasses</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mx-4" />
          <div className={`flex items-center gap-2 ${wizardStep === 'REVIEW' ? 'text-primary-600 font-semibold' : 'text-text-tertiary'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${wizardStep === 'REVIEW' ? 'bg-primary-600 text-white' : 'bg-gray-300 text-text-secondary'}`}>
              3
            </div>
            <span>Review</span>
          </div>
        </div>

        {(wizardStep === 'SET_CARCASS_HEIGHT' || wizardStep === 'CONFIGURE_CARCASS') && (
          <div className="mt-4 text-center text-sm text-text-secondary">
            Section {currentColumnIndex + 1} of {numberOfColumns} • Carcass {currentCarcassIndex + 1}
          </div>
        )}
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
}

// Step 1: Select number of columns
interface SelectColumnsViewProps {
  numberOfColumns: number;
  setNumberOfColumns: (value: number) => void;
  onNext: () => void;
  wardrobeWidth: number;
}

function SelectColumnsView({ numberOfColumns, setNumberOfColumns, onNext, wardrobeWidth }: SelectColumnsViewProps) {
  const maxColumns = Math.floor(wardrobeWidth / 400); // Minimum 400mm per column

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-text-primary mb-2">How many vertical sections?</h2>
      <p className="text-text-secondary mb-6">
        Divide your {wardrobeWidth}mm wide wardrobe into vertical sections (columns). Each section must be at least 400mm wide.
      </p>

      <Card className="mb-6">
        <CardContent className="p-6">
          <label className="block text-lg font-semibold text-text-primary mb-4">
            Number of Sections: {numberOfColumns}
          </label>
          <input
            type="range"
            min="1"
            max={maxColumns}
            value={numberOfColumns}
            onChange={(e) => setNumberOfColumns(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-sm text-text-secondary mt-2">
            <span>1 section</span>
            <span>{maxColumns} sections</span>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              Each section will be approximately <strong>{Math.floor(wardrobeWidth / numberOfColumns)}mm wide</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Visual Preview */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6" style={{ minHeight: '200px' }}>
        <div className="flex gap-2 h-48">
          {Array.from({ length: numberOfColumns }).map((_, idx) => (
            <div
              key={idx}
              className="bg-gray-600 rounded flex items-center justify-center text-white font-semibold"
              style={{ flex: 1 }}
            >
              Section {idx + 1}
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={onNext}
        variant="wizard"
        size="lg"
        fullWidth
        rightIcon={<ChevronRight className="w-6 h-6" />}
      >
        Continue to Configure Sections
      </Button>
    </div>
  );
}

// Step 2: Set height for current carcass
interface SetCarcassHeightViewProps {
  columnIndex: number;
  carcassIndex: number;
  totalColumns: number;
  carcassHeight: number;
  setCarcassHeight: (value: number) => void;
  remainingHeight: number;
  onNext: () => void;
  onBack: () => void;
  wardrobeHeight: number;
  materials: Material[];
  materialsLoading: boolean;
  selectedMaterial: MaterialOption | null;
  onMaterialChange: (material: MaterialOption) => void;
}

function SetCarcassHeightView({
  columnIndex,
  carcassIndex,
  carcassHeight,
  setCarcassHeight,
  remainingHeight,
  onNext,
  onBack,
  wardrobeHeight,
  materials,
  materialsLoading,
  selectedMaterial,
  onMaterialChange
}: SetCarcassHeightViewProps) {
  // Group materials by name for display
  const materialsByName = materials.reduce((acc, mat) => {
    if (!acc[mat.name]) {
      acc[mat.name] = mat;
    }
    return acc;
  }, {} as Record<string, Material>);

  const handleMaterialSelect = (materialName: string, thicknessOption: MaterialOption) => {
    onMaterialChange({
      ...thicknessOption,
      material: materialName
    });
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-text-primary mb-2">
        Section {columnIndex + 1}, Carcass {carcassIndex + 1}: Set Height & Material
      </h2>
      <p className="text-text-secondary mb-6">
        Choose the carcass material and set the height. Minimum 300mm required.
      </p>

      {/* Material Selection */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Carcass Material</h3>

          {materialsLoading ? (
            <p className="text-text-secondary">Loading materials...</p>
          ) : (
            <div className="space-y-4">
              {Object.values(materialsByName).map((material) => (
                <div key={material.name} className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-500 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-text-primary">{material.name}</h4>
                      {material.recommended && (
                        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded mt-1">
                          Recommended
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary mb-3">{material.description}</p>

                  {/* Thickness Options */}
                  <ButtonGroup
                    options={material.options.map((option) => ({
                      value: option.sku || '',
                      label: `${option.thickness}\n£${option.price}`,
                    }))}
                    value={selectedMaterial?.sku || ''}
                    onChange={(sku) => {
                      const option = material.options.find(o => o.sku === sku);
                      if (option) handleMaterialSelect(material.name, option);
                    }}
                    size="md"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Height Selection */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <label className="block text-lg font-semibold text-text-primary mb-4">
            Carcass Height: {carcassHeight}mm (External)
          </label>
          <input
            type="range"
            min="300"
            max={remainingHeight}
            value={carcassHeight}
            onChange={(e) => setCarcassHeight(parseInt(e.target.value))}
            step="50"
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-sm text-text-secondary mt-2">
            <span>300mm (minimum)</span>
            <span>{remainingHeight}mm (maximum)</span>
          </div>

          {selectedMaterial && selectedMaterial.thicknessNum && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
              <p className="text-sm text-amber-900">
                <strong>Material thickness:</strong> {selectedMaterial.thicknessNum}mm (×2 = {selectedMaterial.thicknessNum * 2}mm for top + bottom)
                <br/>
                <strong>Internal usable height:</strong> {carcassHeight - (selectedMaterial.thicknessNum * 2)}mm
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>Remaining height:</strong> {remainingHeight - carcassHeight}mm
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                <strong>External height:</strong> {carcassHeight}mm
                {selectedMaterial && selectedMaterial.thicknessNum && (
                  <>
                    <br/>
                    <strong>Internal height:</strong> {carcassHeight - (selectedMaterial.thicknessNum * 2)}mm
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Preview */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6" style={{ height: '400px' }}>
        <div className="flex flex-col gap-2 h-full">
          <div
            className="bg-green-400 rounded flex flex-col border-2 border-green-600"
            style={{ height: `${(carcassHeight / wardrobeHeight) * 100}%` }}
          >
            {selectedMaterial && selectedMaterial.thicknessNum && (
              <>
                <div className="bg-amber-600 text-white text-xs font-semibold text-center py-1" style={{ height: `${(selectedMaterial.thicknessNum / carcassHeight) * 100}%` }}>
                  Top Panel ({selectedMaterial.thicknessNum}mm)
                </div>
                <div className="flex-1 flex items-center justify-center text-text-primary font-semibold">
                  Internal Space<br/>{carcassHeight - (selectedMaterial.thicknessNum * 2)}mm
                </div>
                <div className="bg-amber-600 text-white text-xs font-semibold text-center py-1" style={{ height: `${(selectedMaterial.thicknessNum / carcassHeight) * 100}%` }}>
                  Bottom Panel ({selectedMaterial.thicknessNum}mm)
                </div>
              </>
            )}
            {!selectedMaterial && (
              <div className="flex items-center justify-center text-text-primary font-semibold h-full">
                This Carcass<br/>{carcassHeight}mm
              </div>
            )}
          </div>
          {(remainingHeight - carcassHeight) > 0 && (
            <div
              className="bg-gray-600 rounded flex items-center justify-center text-white text-sm"
              style={{ height: `${((remainingHeight - carcassHeight) / wardrobeHeight) * 100}%` }}
            >
              Remaining Space<br/>{remainingHeight - carcassHeight}mm
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          fullWidth
          leftIcon={<ChevronLeft className="w-6 h-6" />}
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          variant="wizard"
          size="lg"
          fullWidth
          rightIcon={<ChevronRight className="w-6 h-6" />}
        >
          Continue to Interior
        </Button>
      </div>
    </div>
  );
}

// Step 3: Configure interior of current carcass
interface ConfigureCarcassViewProps {
  columnIndex: number;
  carcassIndex: number;
  totalColumns: number;
  currentInterior: InteriorSection[];
  carcassHeight: number;
  canAddAnother: boolean;
  onComplete: (sections: InteriorSection[], addAnother: boolean) => void;
  onSkip: () => void;
  onBack: () => void;
}

function ConfigureCarcassView({
  columnIndex,
  carcassIndex,
  totalColumns,
  currentInterior,
  carcassHeight,
  canAddAnother,
  onComplete,
  onSkip,
  onBack
}: ConfigureCarcassViewProps) {
  const [interiorSections, setInteriorSections] = useState<InteriorSection[]>(
    currentInterior.length > 0 ? currentInterior : []
  );

  const addInteriorSection = (type: string) => {
    const usedHeight = interiorSections.reduce((sum, s) => sum + s.height, 0);
    const remainingHeight = carcassHeight - usedHeight;

    const sectionType = SECTION_TYPES[type.toUpperCase()];
    if (remainingHeight < sectionType.minHeight) {
      alert(`Not enough space. Need at least ${sectionType.minHeight}mm`);
      return;
    }

    const newSection: InteriorSection = {
      id: interiorSections.length,
      type: type as InteriorSection['type'],
      height: Math.min(remainingHeight, sectionType.minHeight * 2),
      drawers: type === 'drawers' ? sectionType.defaultCount : null,
      shelfCount: type === 'shelves' ? sectionType.defaultCount : null,
      railCount: type === 'rail' || type === 'double_rail' ? sectionType.defaultCount : null,
      isExternal: type === 'drawers' ? false : null
    };

    setInteriorSections([...interiorSections, newSection]);
  };

  const removeInteriorSection = (index: number) => {
    setInteriorSections(interiorSections.filter((_, i) => i !== index));
  };

  const updateInteriorHeight = (index: number, height: string) => {
    const updated = [...interiorSections];
    updated[index] = { ...updated[index], height: parseInt(height) || 0 };
    setInteriorSections(updated);
  };

  const updateInteriorCount = (index: number, field: string, count: string | boolean) => {
    const updated = [...interiorSections];
    updated[index] = {
      ...updated[index],
      [field]: typeof count === 'boolean' ? count : (parseInt(count as string) || 1)
    };
    setInteriorSections(updated);
  };

  const usedHeight = interiorSections.reduce((sum, s) => sum + s.height, 0);
  const remainingHeight = carcassHeight - usedHeight;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Section {columnIndex + 1}, Carcass {carcassIndex + 1}: Configure Interior
        </h2>
        <p className="text-text-secondary">
          Configure the interior of this carcass ({carcassHeight}mm tall).
          Section {columnIndex + 1} of {totalColumns}.
        </p>
        <div className="mt-2 text-sm text-text-secondary">
          Unused interior height: <span className="font-semibold">{remainingHeight}mm</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Controls */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-text-primary mb-4">Add Interior Components</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(SECTION_TYPES).map((type) => (
                  <Button
                    key={type.id}
                    onClick={() => addInteriorSection(type.id)}
                    disabled={remainingHeight < type.minHeight}
                    variant="outline"
                    className="h-auto flex-col py-4"
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="text-sm font-medium text-text-primary">{type.name}</div>
                    <div className="text-xs text-text-secondary mt-1">Min: {type.minHeight}mm</div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interior sections list */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-text-primary mb-4">Interior Configuration</h3>
              {interiorSections.length === 0 ? (
                <p className="text-text-secondary text-sm">No components added yet. Add components above.</p>
              ) : (
                <div className="space-y-3">
                  {interiorSections.map((section, idx) => (
                    <Card key={section.id} variant="outline">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{SECTION_TYPES[section.type.toUpperCase()].icon}</span>
                            <span className="font-medium">{SECTION_TYPES[section.type.toUpperCase()].name}</span>
                          </div>
                          <Button
                            onClick={() => removeInteriorSection(idx)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <label className="block text-text-secondary mb-1">Height (mm)</label>
                              <Input
                                type="number"
                                value={section.height}
                                onChange={(e) => updateInteriorHeight(idx, e.target.value)}
                                inputSize="sm"
                                min={SECTION_TYPES[section.type.toUpperCase()].minHeight}
                              />
                            </div>

                            {section.type === 'drawers' && (
                              <div>
                                <label className="block text-text-secondary mb-1">Drawer Count</label>
                                <Input
                                  type="number"
                                  value={section.drawers || 1}
                                  onChange={(e) => updateInteriorCount(idx, 'drawers', e.target.value)}
                                  inputSize="sm"
                                  min="1"
                                  max="10"
                                />
                              </div>
                            )}

                            {section.type === 'shelves' && (
                              <div>
                                <label className="block text-text-secondary mb-1">Shelf Count</label>
                                <Input
                                  type="number"
                                  value={section.shelfCount || 1}
                                  onChange={(e) => updateInteriorCount(idx, 'shelfCount', e.target.value)}
                                  inputSize="sm"
                                  min="1"
                                  max="20"
                                />
                              </div>
                            )}
                          </div>

                          {section.type === 'drawers' && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={section.isExternal || false}
                                  onChange={(e) => updateInteriorCount(idx, 'isExternal', e.target.checked)}
                                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-text-primary">External Drawers</span>
                              </label>
                              <p className="text-xs text-text-secondary mt-1 ml-6">
                                External drawers show on the wardrobe front and affect door sizing
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-text-primary mb-4">Preview</h3>
            <div className="bg-gray-800 rounded-lg p-4" style={{ height: '500px' }}>
              <div className="bg-gray-700 rounded h-full flex flex-col gap-1 p-2">
                {interiorSections.length === 0 ? (
                  <div className="flex-1 bg-gray-600 rounded flex items-center justify-center text-text-tertiary">
                    Empty Carcass
                  </div>
                ) : (
                  interiorSections.map((section) => (
                    <div
                      key={section.id}
                      className={`rounded flex flex-col items-center justify-center text-sm font-medium relative ${
                        section.isExternal ? 'border-4 border-amber-500' : ''
                      }`}
                      style={{
                        flex: `0 0 ${(section.height / carcassHeight) * 100}%`,
                        backgroundColor:
                          section.type === 'drawers' ? '#fef3c7' :
                          section.type === 'rail' ? '#dbeafe' :
                          section.type === 'double_rail' ? '#bfdbfe' :
                          section.type === 'shelves' ? '#fce7f3' : '#f3f4f6'
                      }}
                    >
                      {section.isExternal && (
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          EXT
                        </div>
                      )}
                      <span className="text-2xl mb-1">{SECTION_TYPES[section.type.toUpperCase()].icon}</span>
                      <span className="text-text-primary">{section.height}mm</span>
                      {section.drawers && <span className="text-xs text-text-secondary">{section.drawers} drawers</span>}
                      {section.isExternal && <span className="text-xs text-amber-700 font-semibold">External</span>}
                      {section.shelfCount && <span className="text-xs text-text-secondary">{section.shelfCount} shelves</span>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            leftIcon={<ChevronLeft className="w-5 h-5" />}
          >
            Back
          </Button>
          <Button
            onClick={onSkip}
            variant="outline"
            fullWidth
          >
            Skip (Leave Empty)
          </Button>
        </div>

        {canAddAnother && (
          <Button
            onClick={() => onComplete(interiorSections, true)}
            variant="success"
            size="lg"
            fullWidth
            leftIcon={<Plus className="w-6 h-6" />}
          >
            Save & Add Another Carcass to This Section
          </Button>
        )}

        <Button
          onClick={() => onComplete(interiorSections, false)}
          variant="wizard"
          size="lg"
          fullWidth
          rightIcon={<ChevronRight className="w-6 h-6" />}
        >
          {canAddAnother ? 'Save & Move to Next Section' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
}

// Step 4: Review all configuration
interface ReviewViewProps {
  sections: Section[];
  wardrobeWidth: number;
  wardrobeHeight: number;
  onEdit: (columnIdx: number, carcassIdx: number) => void;
  onBack: () => void;
}

function ReviewView({ sections, wardrobeWidth, wardrobeHeight, onEdit, onBack }: ReviewViewProps) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-text-primary mb-2">Review Your Configuration</h2>
      <p className="text-text-secondary mb-6">
        Review your wardrobe layout. Click any carcass to edit its interior configuration.
      </p>

      {/* Visual Grid */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6" style={{ minHeight: '500px' }}>
        <div className="flex gap-2 h-[500px]">
          {sections.map((section, sectionIdx) => (
            <div
              key={section.id}
              className="bg-gray-700 rounded flex flex-col gap-2 p-2"
              style={{ flex: `0 0 ${(section.width / wardrobeWidth) * 100}%` }}
            >
              <div className="text-center text-white text-xs font-semibold mb-1">
                Section {sectionIdx + 1}
              </div>
              {section.carcasses.map((carcass, carcassIdx) => (
                <div
                  key={carcass.id}
                  onClick={() => onEdit(sectionIdx, carcassIdx)}
                  className="rounded cursor-pointer hover:ring-2 hover:ring-primary-400 transition"
                  style={{ flex: `0 0 ${(carcass.height / wardrobeHeight) * 100}%` }}
                >
                  {carcass.interiorSections && carcass.interiorSections.length > 0 ? (
                    <div className="h-full flex flex-col">
                      {carcass.interiorSections.map((interior) => (
                        <div
                          key={interior.id}
                          className={`border-b border-gray-400 last:border-b-0 flex items-center justify-center relative ${
                            interior.isExternal ? 'border-2 border-amber-500' : ''
                          }`}
                          style={{
                            flex: `0 0 ${(interior.height / carcass.height) * 100}%`,
                            backgroundColor:
                              interior.type === 'drawers' ? '#fef3c7' :
                              interior.type === 'rail' ? '#dbeafe' :
                              interior.type === 'double_rail' ? '#bfdbfe' :
                              interior.type === 'shelves' ? '#fce7f3' : '#f3f4f6'
                          }}
                        >
                          {interior.isExternal && (
                            <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold text-[10px]">
                              EXT
                            </div>
                          )}
                          <span className="text-xl">{SECTION_TYPES[interior.type.toUpperCase()]?.icon}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full bg-white flex items-center justify-center">
                      <span className="text-text-tertiary text-xs">Empty</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-text-primary mb-4">Configuration Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{sections.length}</div>
              <div className="text-blue-700">Sections</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">
                {sections.reduce((sum, s) => sum + s.carcasses.length, 0)}
              </div>
              <div className="text-green-700">Total Carcasses</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">
                {sections.reduce((sum, s) =>
                  sum + s.carcasses.filter(c => c.interiorSections?.length > 0).length, 0
                )}
              </div>
              <div className="text-purple-700">Configured Carcasses</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Carcass List with Materials */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-text-primary mb-4">Carcass Details</h3>
          <div className="space-y-4">
            {sections.map((section, sectionIdx) => (
              <div key={section.id} className="border-2 border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-3">
                  Section {sectionIdx + 1} ({section.width}mm wide)
                </h4>
                <div className="space-y-3">
                  {section.carcasses.map((carcass, carcassIdx) => (
                    <div key={carcass.id} className="pl-4 border-l-2 border-primary-300 bg-gray-50 p-3 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-text-primary">
                          Carcass {carcassIdx + 1}
                        </span>
                        <Button
                          onClick={() => onEdit(sectionIdx, carcassIdx)}
                          variant="ghost"
                          size="sm"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          Edit
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-text-primary mb-2">
                        <div>
                          <strong>External Height:</strong> {carcass.height}mm
                        </div>
                        {carcass.material && carcass.material.thicknessNum && (
                          <>
                            <div>
                              <strong>Internal Height:</strong> {carcass.height - (carcass.material.thicknessNum * 2)}mm
                            </div>
                            <div className="col-span-2 mt-1">
                              <strong>Material:</strong> {carcass.material.material} ({carcass.material.thickness})
                              {' '}@ £{carcass.material.price}
                            </div>
                          </>
                        )}
                      </div>
                      {carcass.interiorSections && carcass.interiorSections.length > 0 && (
                        <div className="mt-2 text-xs text-text-secondary">
                          <strong>Interior:</strong>{' '}
                          {carcass.interiorSections.map((interior, idx) => (
                            <span key={interior.id}>
                              {SECTION_TYPES[interior.type.toUpperCase()]?.name}
                              {interior.isExternal && ' (External)'}
                              {idx < carcass.interiorSections.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-900">
          <strong>External Drawers:</strong> Carcasses with external drawers are marked with an "EXT" badge and amber border. These drawer fronts will be visible on the wardrobe exterior and will affect door sizing.
        </p>
        <p className="text-sm text-amber-900 mt-2">
          <strong>Material Thickness:</strong> The external height includes the top and bottom panels. Internal usable height is calculated as: External Height - (Material Thickness × 2).
        </p>
      </div>

      <Button
        onClick={onBack}
        variant="outline"
        leftIcon={<ChevronLeft className="w-5 h-5" />}
      >
        Back to Edit Last Carcass
      </Button>
    </div>
  );
}
