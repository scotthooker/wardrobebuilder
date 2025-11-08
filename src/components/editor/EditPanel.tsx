import { useState, useEffect } from 'react';
import { useBuildsStore } from '../../store/buildsStore';
import { Save, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { ImageGallery } from './ImageGallery';
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerContent,
  DrawerFooter,
} from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

// ===========================
// TYPE DEFINITIONS
// ===========================

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Material pricing data structure
interface PricingDataItem {
  'Product Name': string;
  'Thickness': string;
  'Price Ex VAT (£)': string;
}

// Material metadata structures
interface MaterialInfo {
  type: string;
  category?: string;
  recommended?: boolean;
  description?: string;
  usage?: string;
  image?: string;
  commonWidths?: string[];
}

interface MaterialCategory {
  name: string;
  description: string;
  required?: boolean;
  conditionallyRequired?: string;
  recommendedThickness?: string;
  note?: string;
}

interface MaterialsMetadata {
  materials: Record<string, MaterialInfo>;
  categories: Record<string, MaterialCategory>;
}

// Build material structure
interface BuildMaterial {
  component: string;
  material: string;
  thickness: string;
  sheets: number;
  pricePerSheet: number;
  subtotal: number;
  category?: string;
  isEdging?: boolean;
  dimensionType?: 'width' | 'thickness';
}

// Hardware structure
interface HardwareItem {
  desc: string;
  qty: number;
  unitPrice: number;
  total: number;
  category?: string;
}

// Extra structure
interface ExtraItem {
  item: string;
  desc: string;
  estimate: number;
  category?: string;
}

// Image gallery structure
interface GalleryImage {
  url: string;
  prompt?: string;
  is_primary?: boolean;
  created_at?: string;
}

// Professional doors/drawers structure
interface ProfessionalDoorsDrawers {
  desc: string;
  qty: number;
  unitPrice: number;
  total: number;
}

// Costs structure
interface BuildCosts {
  materials: BuildMaterial[];
  materialTotal: number;
  professionalDoorsDrawers?: ProfessionalDoorsDrawers[];
  professionalDoorsDrawersTotal: number;
  hardware: Record<string, HardwareItem>;
  hardwareTotal: number;
  extras: ExtraItem[];
  extrasTotal: number;
  grandTotal: number;
  savingsVsBudget: number;
}

// Interior section structure
interface InteriorSection {
  id: number;
  type: 'rail' | 'shelves' | 'drawers' | 'double_rail';
  height: number;
  shelfCount?: number;
  drawers?: number;
  isExternal?: boolean;
}

// Carcass structure
interface Carcass {
  id: number;
  height: number;
  width: number;
  material?: {
    material: string;
    thickness: string;
    thicknessNum: number;
    price: number;
    sku: string;
  };
  interiorSections?: InteriorSection[];
}

// Door zone structure
interface DoorZone {
  id: number;
  startCarcass: number;
  endCarcass: number;
  doorCount: number;
}

// Door configuration structure
interface DoorConfig {
  style: 'hinged' | 'sliding' | 'none';
  sectionConfigs?: Record<string, {
    zones: DoorZone[];
  }>;
}

// Configuration section structure
interface ConfigurationSection {
  id: number;
  width: number;
  carcasses?: Carcass[];
}

// Build configuration structure
interface BuildConfiguration {
  width: number;
  height: number;
  depth: number;
  sections?: ConfigurationSection[];
  doors?: DoorConfig;
}

// Complete build structure
interface Build {
  id: string | number;
  name: string;
  character?: string;
  image?: string;
  budget?: number;
  furnitureType?: 'wardrobe' | 'desk';
  costs: BuildCosts;
  configuration?: BuildConfiguration;
  image_gallery?: GalleryImage[];
  generatedImage?: string;
  generatedPrompt?: string;
}

// Category definitions
type ItemType = 'MATERIAL' | 'HARDWARE' | 'EXTRA';

interface CategoryDefinition {
  name: string;
  required?: boolean;
}

// ===========================
// HELPER FUNCTIONS
// ===========================

// Helper function to get price from pricing data
function getPriceForMaterial(
  pricingData: PricingDataItem[] | null,
  productName: string,
  thickness: string
): number {
  if (!pricingData || !Array.isArray(pricingData)) return 0;

  const match = pricingData.find(item =>
    item['Product Name'] === productName && item['Thickness'] === thickness
  );

  return match ? parseFloat(match['Price Ex VAT (£)']) || 0 : 0;
}

// ===========================
// MAIN COMPONENT
// ===========================

export function EditPanel() {
  const { builds, isEditing, editingBuildId, stopEditing, updateBuild, pricingData } = useBuildsStore();

  // State management
  const [editedBuild, setEditedBuild] = useState<Build | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<ItemType | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedThickness, setSelectedThickness] = useState<string>('');
  const [materialsMetadata, setMaterialsMetadata] = useState<MaterialsMetadata | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<string>('');
  const [isGeneratingMockup, setIsGeneratingMockup] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [mockupError, setMockupError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Get available dimensions based on selection
  const getAvailableDimensions = (): string[] => {
    if (!selectedItem || selectedItemType !== 'MATERIAL' || !materialsMetadata) return [];

    const materialInfo = materialsMetadata.materials[selectedItem];

    // For EDGING materials, use commonWidths from metadata (no pricing data)
    if (materialInfo && materialInfo.type === 'EDGING') {
      return materialInfo.commonWidths || [];
    }

    // For other materials, get from pricing data
    if (pricingData) {
      return Array.from(new Set(pricingData.filter((item: any) => item['Product Name'] === selectedItem).map((item: any) => item['Thickness'])));
    }

    return [];
  };

  const availableThicknesses = getAvailableDimensions();
  const selectedMaterialInfo = selectedItem && materialsMetadata ? materialsMetadata.materials[selectedItem] : null;
  const isEdgingMaterial = selectedMaterialInfo && selectedMaterialInfo.type === 'EDGING';
  const dimensionLabel = isEdgingMaterial ? 'Width' : 'Thickness';

  // Get categories based on item type
  const getCategories = (): Record<string, CategoryDefinition> => {
    if (selectedItemType === 'MATERIAL') {
      return materialsMetadata?.categories || {};
    } else if (selectedItemType === 'HARDWARE') {
      return {
        'HINGES': { name: 'Hinges & Soft Close' },
        'HANDLES': { name: 'Handles & Knobs' },
        'RAILS': { name: 'Drawer Rails' },
        'ORGANIZERS': { name: 'Internal Organizers' },
        'OTHER': { name: 'Other Hardware' }
      };
    } else if (selectedItemType === 'EXTRA') {
      return {
        'FINISH': { name: 'Paint & Finishes' },
        'HARDWARE': { name: 'Premium Hardware' },
        'LIGHTING': { name: 'LED Lighting' },
        'ACCESSORIES': { name: 'Accessories' },
        'OTHER': { name: 'Other Extras' }
      };
    }
    return {};
  };

  // Get items based on category
  const getItems = (): string[] => {
    if (selectedItemType === 'MATERIAL' && selectedCategory && materialsMetadata) {
      // Filter materials by their type matching the selected category
      const materials = materialsMetadata.materials || {};
      return Object.keys(materials).filter(materialName => {
        const material = materials[materialName];
        return material.type === selectedCategory;
      });
    }
    // For hardware and extras, they're custom items entered by user
    return [];
  };

  // Group materials by subcategory for better organization
  const getGroupedMaterials = (): Record<string, string[]> => {
    const items = getItems();
    if (!items.length || !materialsMetadata) return {};

    const grouped: Record<string, string[]> = {};
    items.forEach(materialName => {
      const material = materialsMetadata.materials[materialName];
      const subcategory = material.category || 'Other';
      if (!grouped[subcategory]) {
        grouped[subcategory] = [];
      }
      grouped[subcategory].push(materialName);
    });

    // Sort materials within each group: recommended first, then alphabetically
    Object.keys(grouped).forEach(subcategory => {
      grouped[subcategory].sort((a, b) => {
        const matA = materialsMetadata.materials[a];
        const matB = materialsMetadata.materials[b];
        if (matA.recommended && !matB.recommended) return -1;
        if (!matA.recommended && matB.recommended) return 1;
        return a.localeCompare(b);
      });
    });

    return grouped;
  };

  // Find the build being edited
  useEffect(() => {
    if (isEditing && editingBuildId) {
      const build = builds.find((b: any) => b.id === editingBuildId);
      if (build) {
        // Create a deep copy for editing
        setEditedBuild(JSON.parse(JSON.stringify(build)) as Build);
      }
    } else {
      setEditedBuild(null);
    }
  }, [isEditing, editingBuildId, builds]);

  // Load materials metadata
  useEffect(() => {
    fetch('/data/materials-metadata.json')
      .then(res => res.json())
      .then((data: MaterialsMetadata) => setMaterialsMetadata(data))
      .catch(err => console.error('Failed to load materials metadata:', err));
  }, []);

  // Debug: Log build structure when editing starts
  useEffect(() => {
    if (editedBuild) {
      console.log('=== EDIT PANEL DEBUG ===');
      console.log('Build ID:', editedBuild.id);
      console.log('Build name:', editedBuild.name);
      console.log('Costs structure:', {
        hasCosts: !!editedBuild.costs,
        hasHardware: !!editedBuild.costs?.hardware,
        hardwareType: typeof editedBuild.costs?.hardware,
        hardwareKeys: editedBuild.costs?.hardware ? Object.keys(editedBuild.costs.hardware) : [],
        hasExtras: !!editedBuild.costs?.extras,
        extrasType: typeof editedBuild.costs?.extras,
        extrasIsArray: Array.isArray(editedBuild.costs?.extras),
        extrasLength: editedBuild.costs?.extras?.length
      });
    }
  }, [editedBuild]);

  if (!isEditing || !editedBuild || !editedBuild.costs) {
    return null;
  }

  // Helper functions for material categorization
  const getMaterialMetadata = (materialName: string): MaterialInfo | null => {
    if (!materialsMetadata) return null;
    return materialsMetadata.materials[materialName] || null;
  };

  const getMaterialsByCategory = (category: string): BuildMaterial[] => {
    if (!editedBuild.costs.materials || !materialsMetadata) return [];

    return editedBuild.costs.materials.filter(mat => {
      // Use the stored category field (from new interface)
      if (mat.category !== undefined) {
        return mat.category === category;
      }

      // Backward compatibility: infer category from component name for old builds
      const componentName = (mat.component || '').toLowerCase();
      if (componentName.includes('carcass') || componentName.includes('backing') || componentName.includes('back panel')) {
        return category === 'CARCASS';
      }
      if (componentName.includes('drawer')) {
        return category === 'DRAWER';
      }
      if (componentName.includes('lining')) {
        return category === 'LINING';
      }
      if (componentName.includes('edging') || componentName.includes('edge')) {
        return category === 'EDGING';
      }

      // Final fallback: use metadata type
      const metadata = getMaterialMetadata(mat.material);
      return metadata && metadata.type === category;
    });
  };

  const hasRequiredMaterials = (): boolean => {
    if (!materialsMetadata) return true; // If metadata not loaded, don't block

    // For desk builds, skip wardrobe-specific material validation
    if (editedBuild.furnitureType === 'desk') {
      // Desks just need at least one material (desktop)
      return editedBuild.costs.materials && editedBuild.costs.materials.length > 0;
    }

    const categories = materialsMetadata.categories;
    const requiredCategories = Object.keys(categories).filter(key => {
      const category = categories[key];

      // DRAWER materials are only required if the wardrobe configuration has drawers
      if (key === 'DRAWER') {
        const hasDrawers = editedBuild.configuration?.sections?.some(s =>
          s.carcasses?.some(c =>
            c.interiorSections?.some(i => i.type === 'drawers')
          )
        );
        return category.required && hasDrawers;
      }

      return category.required;
    });

    return requiredCategories.every(category => getMaterialsByCategory(category).length > 0);
  };

  const handleMaterialUpdate = (index: number, field: keyof BuildMaterial, value: string | number) => {
    setEditedBuild(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.costs = { ...prev.costs };
      updated.costs.materials = [...prev.costs.materials];
      updated.costs.materials[index] = { ...prev.costs.materials[index], [field]: value };

      // Recalculate subtotal for this material
      const mat = updated.costs.materials[index];
      mat.subtotal = mat.sheets * mat.pricePerSheet;

      // Recalculate material total
      const materialTotal = updated.costs.materials.reduce((sum, m) => sum + m.subtotal, 0);
      updated.costs.materialTotal = materialTotal;
      updated.costs.grandTotal = materialTotal + prev.costs.professionalDoorsDrawersTotal + prev.costs.hardwareTotal + prev.costs.extrasTotal;
      updated.costs.savingsVsBudget = (updated.budget || 5000) - updated.costs.grandTotal;

      return updated;
    });
  };

  const handleExtraUpdate = (index: number, field: keyof ExtraItem, value: string | number) => {
    setEditedBuild(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.costs = { ...prev.costs };
      updated.costs.extras = [...prev.costs.extras];
      updated.costs.extras[index] = { ...prev.costs.extras[index], [field]: value };

      // Recalculate totals
      const extrasTotal = updated.costs.extras.reduce((sum, extra) => sum + (parseFloat(String(extra.estimate)) || 0), 0);
      updated.costs.extrasTotal = extrasTotal;
      updated.costs.grandTotal = prev.costs.materialTotal + prev.costs.professionalDoorsDrawersTotal + prev.costs.hardwareTotal + extrasTotal;
      updated.costs.savingsVsBudget = (updated.budget || 5000) - updated.costs.grandTotal;

      return updated;
    });
  };

  const handleAddItem = () => {
    if (!selectedItemType) {
      alert('Please select an item type');
      return;
    }
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    if (selectedItemType === 'MATERIAL') {
      if (!selectedItem) {
        alert('Please select a material');
        return;
      }

      // Check if dimension is required (materials with pricing data)
      if (availableThicknesses.length > 0 && !selectedThickness) {
        alert(`Please select ${dimensionLabel.toLowerCase()}`);
        return;
      }

      const materialInfo = materialsMetadata?.materials[selectedItem];
      const categoryInfo = materialsMetadata?.categories[selectedCategory];

      // For EDGING materials, use price 0 and quantity-based pricing
      const isEdging = materialInfo && materialInfo.type === 'EDGING';
      const pricePerSheet = isEdging ? 0 : getPriceForMaterial(pricingData, selectedItem, selectedThickness);

      setEditedBuild(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        updated.costs = { ...prev.costs };
        updated.costs.materials = [...prev.costs.materials, {
          component: categoryInfo?.name || 'New Component',
          material: selectedItem,
          thickness: selectedThickness || (isEdging ? '22mm' : ''), // Default width for edging
          sheets: isEdging ? 10 : 1, // Use "sheets" as meters for edging
          pricePerSheet,
          subtotal: pricePerSheet,
          category: selectedCategory,
          isEdging: isEdging,
          dimensionType: isEdging ? 'width' : 'thickness'
        }];

        // Recalculate totals
        const materialTotal = updated.costs.materials.reduce((sum, m) => sum + m.subtotal, 0);
        updated.costs.materialTotal = materialTotal;
        updated.costs.grandTotal = materialTotal + prev.costs.professionalDoorsDrawersTotal + prev.costs.hardwareTotal + prev.costs.extrasTotal;
        updated.costs.savingsVsBudget = (updated.budget || 5000) - updated.costs.grandTotal;

        return updated;
      });
    } else if (selectedItemType === 'HARDWARE') {
      const newKey = `custom_${Date.now()}`;
      const categoryName = getCategories()[selectedCategory]?.name || 'Hardware';

      setEditedBuild(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        updated.costs = { ...prev.costs };
        updated.costs.hardware = {
          ...prev.costs.hardware,
          [newKey]: {
            desc: `New ${categoryName}`,
            qty: 1,
            unitPrice: 0,
            total: 0,
            category: selectedCategory
          }
        };
        return updated;
      });
    } else if (selectedItemType === 'EXTRA') {
      const categoryName = getCategories()[selectedCategory]?.name || 'Extra';

      setEditedBuild(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        updated.costs = { ...prev.costs };
        updated.costs.extras = [...prev.costs.extras, {
          item: `New ${categoryName}`,
          desc: 'Description',
          estimate: 0,
          category: selectedCategory
        }];
        return updated;
      });
    }

    // Reset selections
    setSelectedItemType('');
    setSelectedCategory('');
    setSelectedItem('');
    setSelectedThickness('');
  };

  const handleRemoveMaterial = (index: number) => {
    setEditedBuild(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.costs = { ...prev.costs };
      updated.costs.materials = prev.costs.materials.filter((_, i) => i !== index);

      // Recalculate totals
      const materialTotal = updated.costs.materials.reduce((sum, m) => sum + m.subtotal, 0);
      updated.costs.materialTotal = materialTotal;
      updated.costs.grandTotal = materialTotal + prev.costs.professionalDoorsDrawersTotal + prev.costs.hardwareTotal + prev.costs.extrasTotal;
      updated.costs.savingsVsBudget = (updated.budget || 5000) - updated.costs.grandTotal;

      return updated;
    });
  };

  const handleRemoveHardware = (key: string) => {
    setEditedBuild(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.costs = { ...prev.costs };
      const { [key]: removed, ...remainingHardware } = prev.costs.hardware;
      updated.costs.hardware = remainingHardware;

      // Recalculate totals
      const hardwareTotal = Object.values(updated.costs.hardware).reduce((sum, hw) => sum + hw.total, 0);
      updated.costs.hardwareTotal = hardwareTotal;
      updated.costs.grandTotal = prev.costs.materialTotal + prev.costs.professionalDoorsDrawersTotal + hardwareTotal + prev.costs.extrasTotal;
      updated.costs.savingsVsBudget = (updated.budget || 5000) - updated.costs.grandTotal;

      return updated;
    });
  };

  const handleRemoveExtra = (index: number) => {
    setEditedBuild(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.costs = { ...prev.costs };
      updated.costs.extras = prev.costs.extras.filter((_, i) => i !== index);

      // Recalculate totals
      const extrasTotal = updated.costs.extras.reduce((sum, extra) => sum + (parseFloat(String(extra.estimate)) || 0), 0);
      updated.costs.extrasTotal = extrasTotal;
      updated.costs.grandTotal = prev.costs.materialTotal + prev.costs.professionalDoorsDrawersTotal + prev.costs.hardwareTotal + extrasTotal;
      updated.costs.savingsVsBudget = (updated.budget || 5000) - updated.costs.grandTotal;

      return updated;
    });
  };

  const handleHardwareUpdate = (key: string, field: keyof HardwareItem, value: string | number) => {
    setEditedBuild(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.costs = { ...prev.costs };
      updated.costs.hardware = { ...prev.costs.hardware };
      updated.costs.hardware[key] = { ...prev.costs.hardware[key], [field]: value };

      // Recalculate hardware item total
      const item = updated.costs.hardware[key];
      item.total = (parseFloat(String(item.qty)) || 0) * (parseFloat(String(item.unitPrice)) || 0);

      // Recalculate hardware total
      const hardwareTotal = Object.values(updated.costs.hardware).reduce((sum, hw) => sum + hw.total, 0);
      updated.costs.hardwareTotal = hardwareTotal;
      updated.costs.grandTotal = prev.costs.materialTotal + prev.costs.professionalDoorsDrawersTotal + hardwareTotal + prev.costs.extrasTotal;
      updated.costs.savingsVsBudget = (updated.budget || 5000) - updated.costs.grandTotal;

      return updated;
    });
  };

  const handleGenerateMockup = async () => {
    setIsGeneratingMockup(true);
    setMockupError(null);
    setGeneratedPrompt(null);
    setEditedPrompt('');

    try {
      const response = await fetch(`${API_URL}/api/generate-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          materials: editedBuild.costs.materials,
          buildName: editedBuild.name,
          buildCharacter: editedBuild.character,
          hardware: editedBuild.costs.hardware,
          doors: editedBuild.costs.professionalDoorsDrawers,
          furnitureType: editedBuild.furnitureType || 'wardrobe',
          configuration: editedBuild.configuration
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const data = await response.json();
      setGeneratedPrompt(data.prompt);
      setEditedPrompt(data.prompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
      setMockupError((error as Error).message || 'Failed to generate prompt. Make sure the server is running with: npm run server');
    } finally {
      setIsGeneratingMockup(false);
    }
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    setImageError(null);
    setGeneratedImageUrl(null);

    const promptToUse = editedPrompt || generatedPrompt;

    if (!promptToUse) {
      setImageError('Please generate a prompt first');
      setIsGeneratingImage(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: promptToUse,
          buildId: editedBuild.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();

      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);

        // Refresh the build to get updated gallery
        const updatedBuild = await fetch(`${API_URL}/api/builds/${editedBuild.id}`);
        if (updatedBuild.ok) {
          const buildData = await updatedBuild.json();
          setEditedBuild(prev => prev ? ({
            ...prev,
            image_gallery: buildData.image_gallery,
            generatedPrompt: promptToUse
          }) : prev);
        }
      } else {
        throw new Error('No image URL returned from server');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setImageError((error as Error).message || 'Failed to generate image. Make sure your OpenRouter API key is set in .env');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGalleryUpdate = (newGallery: GalleryImage[]) => {
    setEditedBuild(prev => prev ? ({
      ...prev,
      image_gallery: newGallery
    }) : prev);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      // First update in-memory state
      updateBuild(editedBuild.id, editedBuild);

      // Then save to database
      const buildData = {
        name: editedBuild.name,
        character: editedBuild.character,
        image: editedBuild.image,
        costs_json: JSON.stringify(editedBuild.costs),
        materials_json: editedBuild.costs.materials ? JSON.stringify(editedBuild.costs.materials) : null,
        extras_json: editedBuild.costs.extras ? JSON.stringify(editedBuild.costs.extras) : null,
        generated_image: editedBuild.generatedImage || null,
        generated_prompt: editedBuild.generatedPrompt || null
      };

      const response = await fetch(`${API_URL}/api/builds/${editedBuild.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildData)
      });

      if (!response.ok) {
        throw new Error('Failed to save build to database');
      }

      console.log('Build saved successfully to database');
      stopEditing();
    } catch (error) {
      console.error('Error saving build:', error);
      setSaveError((error as Error).message || 'Failed to save build. Changes saved locally only.');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedBuild(null);
    stopEditing();
  };

  return (
    <Drawer
      open={isEditing}
      onClose={handleCancel}
      position="right"
      size="xl"
      className="w-full sm:w-[90%] md:w-[600px] lg:w-[650px] xl:w-[700px]"
    >
      {/* Header */}
      <DrawerHeader className="sticky top-0 bg-gradient-to-b from-white to-gray-50/50 border-b border-gray-200 px-6 py-5 z-10 backdrop-blur-sm shadow-sm">
        <div className="flex-1">
          <DrawerTitle className="text-2xl font-bold text-gray-900 mb-1">Edit Build</DrawerTitle>
          <p className="text-sm text-gray-600 font-medium">{editedBuild.name}</p>
        </div>
      </DrawerHeader>

      {/* Cost Summary */}
      <div className="bg-gradient-to-br from-primary-50 via-primary-50/80 to-white border-b border-primary-100 px-6 py-5 shadow-inner-premium">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-primary-900 uppercase tracking-wide">Current Total</span>
          <span className="text-3xl font-bold text-primary-900">
            {formatCurrency(editedBuild.costs.grandTotal)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-primary-200/50">
          <span className="text-sm text-primary-700 font-medium">vs {formatCurrency(editedBuild.budget || 5000)} Budget</span>
          <span className={`text-xl font-bold ${editedBuild.costs.savingsVsBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(editedBuild.costs.savingsVsBudget))}
            <span className="text-base font-semibold ml-1">
              {editedBuild.costs.savingsVsBudget >= 0 ? 'under' : 'over'}
            </span>
          </span>
        </div>
      </div>

      {/* Content */}
      <DrawerContent className="px-6 py-6 pb-24">
        <div className="space-y-6">
          {/* Validation Alert */}
          {!hasRequiredMaterials() && (
            <Card variant="outline" padding="md" className="bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">Missing Required Materials</h4>
                  <p className="text-sm text-red-700">
                    {editedBuild.furnitureType === 'desk'
                      ? 'Please add materials to complete your desk build.'
                      : 'Please add required materials (Carcass, and Drawer if applicable) to complete your build.'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Unified Add Item Section */}
          <Card variant="outline" padding="md" className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Build Item
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* 1. Item Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Type:</label>
                <Select
                  value={selectedItemType}
                  onChange={(e) => {
                    setSelectedItemType(e.target.value as ItemType | '');
                    setSelectedCategory('');
                    setSelectedItem('');
                    setSelectedThickness('');
                  }}
                  placeholder="Select type..."
                >
                  <option value="MATERIAL">📦 Material</option>
                  <option value="HARDWARE">🔧 Hardware</option>
                  <option value="EXTRA">✨ Extra</option>
                </Select>
              </div>

              {/* 2. Category */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Category:</label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedItem('');
                    setSelectedThickness('');
                  }}
                  disabled={!selectedItemType}
                  placeholder="Select category..."
                >
                  {Object.entries(getCategories()).map(([key, cat]) => (
                    <option key={key} value={key}>
                      {cat.name} {cat.required ? '*' : ''}
                    </option>
                  ))}
                </Select>
              </div>

              {/* 3. Item/Material (only for materials) */}
              {selectedItemType === 'MATERIAL' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Material:</label>
                  <Select
                    value={selectedItem}
                    onChange={(e) => {
                      setSelectedItem(e.target.value);
                      setSelectedThickness('');
                    }}
                    disabled={!selectedCategory}
                    placeholder="Select material..."
                    groups={Object.entries(getGroupedMaterials()).map(([subcategory, materials]) => ({
                      label: subcategory,
                      options: materials.map(name => ({
                        value: name,
                        label: `${name} ${getMaterialMetadata(name)?.recommended ? '⭐' : ''}`
                      }))
                    }))}
                  />
                </div>
              )}

              {/* 4. Dimension (Thickness/Width - only for materials) */}
              {selectedItemType === 'MATERIAL' && availableThicknesses.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{dimensionLabel}:</label>
                  <Select
                    value={selectedThickness}
                    onChange={(e) => setSelectedThickness(e.target.value)}
                    disabled={!selectedItem}
                    placeholder={`Select ${dimensionLabel.toLowerCase()}...`}
                    options={availableThicknesses.map(thick => ({
                      value: thick,
                      label: thick
                    }))}
                  />
                </div>
              )}

              {/* 5. Add Button */}
              <div className="flex items-end">
                <Button
                  onClick={handleAddItem}
                  disabled={
                    !selectedItemType ||
                    !selectedCategory ||
                    (selectedItemType === 'MATERIAL' && (!selectedItem || (availableThicknesses.length > 0 && !selectedThickness)))
                  }
                  variant="premium"
                  fullWidth
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Material Preview (only for materials) */}
            {selectedItemType === 'MATERIAL' && selectedItem && getMaterialMetadata(selectedItem) && (
              <Card variant="default" padding="sm" className="mt-4 border-blue-200">
                <div className="flex gap-3">
                  {getMaterialMetadata(selectedItem)?.image && (
                    <img
                      src={getMaterialMetadata(selectedItem)!.image}
                      alt={selectedItem}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{getMaterialMetadata(selectedItem)?.description}</p>
                    <p className="text-xs text-blue-600 mt-1">{getMaterialMetadata(selectedItem)?.usage}</p>
                  </div>
                </div>
              </Card>
            )}
          </Card>

          {/* Material Categories */}
          {materialsMetadata && Object.entries(materialsMetadata.categories).map(([categoryKey, category]) => {
            const categoryMaterials = getMaterialsByCategory(categoryKey);

            // Check if DRAWER is conditionally required
            const hasDrawers = editedBuild.configuration?.sections?.some(s =>
              s.carcasses?.some(c =>
                c.interiorSections?.some(i => i.type === 'drawers')
              )
            );
            const isDrawerCategory = categoryKey === 'DRAWER';
            const isConditionallyRequired = isDrawerCategory && category.required;
            const isActuallyRequired = isConditionallyRequired ? hasDrawers : category.required;

            return (
              <Card key={categoryKey} variant="default" padding="none" className="overflow-hidden">
                <div className={`p-4 ${isActuallyRequired ? 'bg-orange-50 border-b-2 border-orange-200' : 'bg-gray-50 border-b-2 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{category.name}</h3>
                      {isActuallyRequired ? (
                        <Badge variant="orange" size="sm">Required</Badge>
                      ) : isConditionallyRequired ? (
                        <Badge variant="blue" size="sm">Conditional</Badge>
                      ) : (
                        <Badge variant="default" size="sm">Optional</Badge>
                      )}
                      {categoryMaterials.length > 0 && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{categoryMaterials.length} item(s)</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  {isConditionallyRequired && !hasDrawers && (
                    <p className="text-xs text-blue-600 mt-1 italic">{category.conditionallyRequired}</p>
                  )}
                  {category.recommendedThickness && (
                    <p className="text-xs text-gray-500 mt-1">Recommended: {category.recommendedThickness}</p>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  {categoryMaterials.length === 0 ? (
                    <p className="text-sm text-gray-500 italic text-center py-4">
                      No materials added yet. {category.note}
                    </p>
                  ) : (
                    categoryMaterials.map((mat) => {
                      const globalIndex = editedBuild.costs.materials.findIndex(m => m === mat);
                      const metadata = getMaterialMetadata(mat.material);

                      return (
                        <Card key={globalIndex} variant="default" padding="md">
                          <div className="flex gap-4">
                            {metadata?.image && (
                              <img
                                src={metadata.image}
                                alt={mat.material}
                                className="w-24 h-24 object-cover rounded flex-shrink-0"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{mat.material}</h4>
                                  <p className="text-sm text-gray-600">{mat.thickness} • {formatCurrency(mat.pricePerSheet)}/sheet</p>
                                  {metadata?.description && (
                                    <p className="text-xs text-gray-500 mt-1">{metadata.description}</p>
                                  )}
                                </div>
                                <Button
                                  onClick={() => handleRemoveMaterial(globalIndex)}
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700 w-16">Sheets:</label>
                                <Input
                                  type="number"
                                  value={mat.sheets}
                                  onChange={(e) => {
                                    const sheets = parseFloat(e.target.value) || 0;
                                    handleMaterialUpdate(globalIndex, 'sheets', sheets);
                                  }}
                                  inputSize="md"
                                  min={0}
                                  step={0.5}
                                />
                                <span className="text-sm font-bold text-gray-900 w-24 text-right">
                                  {formatCurrency(mat.subtotal)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </Card>
            );
          })}

          <Card variant="default" padding="md" className="bg-primary-50">
            <div className="flex justify-between items-center">
              <span className="font-bold text-primary-900">Material Total:</span>
              <span className="text-xl font-bold text-primary-900">
                {formatCurrency(editedBuild.costs.materialTotal)}
              </span>
            </div>
          </Card>

          {/* Generate Mockup Section */}
          {hasRequiredMaterials() && (
            <Card variant="outline" padding="md" className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                <span>🎨</span>
                AI-Generated {editedBuild.furnitureType === 'desk' ? 'Desk' : 'Wardrobe'} Visualization
              </h4>
              <p className="text-sm text-purple-700 mb-4">
                Generate a photorealistic visualization of your {editedBuild.furnitureType === 'desk' ? 'desk' : 'wardrobe'} using AI image generation.
              </p>

              {/* Step 1: Generate Prompt */}
              <Button
                onClick={handleGenerateMockup}
                loading={isGeneratingMockup}
                disabled={isGeneratingMockup}
                variant="premium"
                fullWidth
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {isGeneratingMockup ? (
                  'Generating Prompt...'
                ) : (
                  <>
                    <span>✨</span>
                    Step 1: Generate Design Prompt
                  </>
                )}
              </Button>

              {mockupError && (
                <Card variant="outline" padding="sm" className="mt-4 bg-red-50 border-red-200">
                  <p className="text-sm text-red-700">{mockupError}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Tip: Run <code className="bg-red-100 px-1 rounded">npm run server</code> in a new terminal
                  </p>
                </Card>
              )}

              {/* Step 2: Edit Prompt */}
              {generatedPrompt && (
                <div className="mt-4 space-y-3">
                  <Card variant="default" padding="md" className="border-purple-300">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-purple-900">Step 2: Edit Prompt (Optional)</h5>
                      <Button
                        onClick={() => navigator.clipboard.writeText(editedPrompt)}
                        variant="ghost"
                        size="sm"
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200"
                      >
                        📋 Copy
                      </Button>
                    </div>
                    <textarea
                      value={editedPrompt}
                      onChange={(e) => setEditedPrompt(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[120px] text-sm"
                      placeholder="Edit the generated prompt..."
                    />
                  </Card>

                  {/* Step 3: Generate Image */}
                  <Button
                    onClick={handleGenerateImage}
                    loading={isGeneratingImage}
                    disabled={isGeneratingImage}
                    variant="success"
                    fullWidth
                    className="bg-gradient-to-r from-green-600 to-teal-600"
                  >
                    {isGeneratingImage ? (
                      'Generating Image...'
                    ) : (
                      <>
                        <span>🖼️</span>
                        Step 3: Generate Image
                      </>
                    )}
                  </Button>

                  {imageError && (
                    <Card variant="outline" padding="sm" className="mt-2 bg-red-50 border-red-200">
                      <p className="text-sm text-red-700">{imageError}</p>
                      <p className="text-xs text-red-600 mt-1">
                        Make sure your OpenRouter API key is set in the .env file
                      </p>
                    </Card>
                  )}

                  {/* Display Generated Image */}
                  {generatedImageUrl && (
                    <Card variant="default" padding="md" className="mt-4 border-green-300">
                      <p className="text-sm font-semibold text-green-900 mb-2">
                        ✓ New image added to gallery!
                      </p>
                      <p className="text-xs text-green-600">
                        You can generate more variations by clicking "Generate Image" again.
                      </p>
                    </Card>
                  )}

                  <p className="text-xs text-purple-600">
                    💡 Generate multiple image variations. Click "Generate Image" again for new variations.
                  </p>
                </div>
              )}

              {/* Image Gallery */}
              {editedBuild.image_gallery && editedBuild.image_gallery.length > 0 && (
                <Card variant="default" padding="md" className="mt-6 border-gray-200">
                  <ImageGallery
                    buildId={editedBuild.id}
                    gallery={editedBuild.image_gallery}
                    onGalleryUpdate={handleGalleryUpdate}
                  />
                </Card>
              )}
            </Card>
          )}

          {/* Hardware Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              🔧 Hardware
            </h3>

            {Object.entries(editedBuild.costs.hardware).map(([key, hw]) => (
              <Card key={key} variant="default" padding="md" className="bg-gray-50 mb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 block mb-1">Description:</label>
                    <Input
                      type="text"
                      value={hw.desc}
                      onChange={(e) => handleHardwareUpdate(key, 'desc', e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => handleRemoveHardware(key)}
                    variant="ghost"
                    size="icon"
                    className="ml-3 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Quantity:</label>
                    <Input
                      type="number"
                      value={hw.qty}
                      onChange={(e) => handleHardwareUpdate(key, 'qty', parseFloat(e.target.value) || 0)}
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Unit Price (£):</label>
                    <Input
                      type="number"
                      value={hw.unitPrice}
                      onChange={(e) => handleHardwareUpdate(key, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min={0}
                      step={0.01}
                    />
                  </div>
                </div>

                <div className="text-right mt-3">
                  <span className="text-sm text-gray-600">Subtotal: </span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(hw.total)}</span>
                </div>
              </Card>
            ))}

            <Card variant="default" padding="md" className="bg-primary-50">
              <div className="flex justify-between items-center">
                <span className="font-bold text-primary-900">Hardware Total:</span>
                <span className="text-xl font-bold text-primary-900">
                  {formatCurrency(editedBuild.costs.hardwareTotal)}
                </span>
              </div>
            </Card>
          </div>

          {/* Extras Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              ✨ Extras & Finishing
            </h3>

            {editedBuild.costs.extras.length === 0 ? (
              <Card variant="default" padding="lg" className="bg-gray-50 text-center text-gray-500">
                No extras added yet. Use "Add Build Item" above to add extras.
              </Card>
            ) : (
              editedBuild.costs.extras.map((extra, index) => (
                <Card key={index} variant="default" padding="md" className="bg-gray-50 mb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Item Name:</label>
                        <Input
                          type="text"
                          value={extra.item}
                          onChange={(e) => handleExtraUpdate(index, 'item', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Description:</label>
                        <Input
                          type="text"
                          value={extra.desc}
                          onChange={(e) => handleExtraUpdate(index, 'desc', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Cost (£):</label>
                        <Input
                          type="number"
                          value={extra.estimate}
                          onChange={(e) => handleExtraUpdate(index, 'estimate', parseFloat(e.target.value) || 0)}
                          min={0}
                          step={0.01}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => handleRemoveExtra(index)}
                      variant="ghost"
                      size="icon"
                      className="ml-3 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              ))
            )}

            <Card variant="default" padding="md" className="bg-primary-50">
              <div className="flex justify-between items-center">
                <span className="font-bold text-primary-900">Extras Total:</span>
                <span className="text-xl font-bold text-primary-900">
                  {formatCurrency(editedBuild.costs.extrasTotal)}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </DrawerContent>

      {/* Footer Actions */}
      <DrawerFooter className="fixed bottom-0 right-0 w-full sm:w-[90%] md:w-[600px] lg:w-[650px] xl:w-[700px] bg-gradient-to-t from-white via-white to-gray-50/30 border-t border-gray-200 px-6 py-5 shadow-premium backdrop-blur-sm">
        <Button
          onClick={handleCancel}
          variant="outline"
          size="lg"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          loading={isSaving}
          disabled={isSaving}
          variant="primary"
          size="lg"
          className="flex-1"
          leftIcon={<Save className="w-5 h-5" />}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DrawerFooter>

      {/* Save Error Alert */}
      {saveError && (
        <div className="fixed bottom-20 right-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 shadow-lg max-w-md z-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Save Warning</h4>
              <p className="text-sm text-yellow-700">{saveError}</p>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
