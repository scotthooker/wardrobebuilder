import { useState, useEffect } from 'react';
import { useBuildsStore } from '../../store/buildsStore';
import { X, Save, Plus, Trash2, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { ImageGallery } from './ImageGallery';

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper function to get price from pricing data
function getPriceForMaterial(pricingData, productName, thickness) {
  if (!pricingData || !Array.isArray(pricingData)) return 0;

  const match = pricingData.find(item =>
    item['Product Name'] === productName && item['Thickness'] === thickness
  );

  return match ? parseFloat(match['Price Ex VAT (£)']) || 0 : 0;
}

export function EditPanel() {
  const { builds, isEditing, editingBuildId, stopEditing, updateBuild, pricingData } = useBuildsStore();
  const [editedBuild, setEditedBuild] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(''); // 'MATERIAL', 'HARDWARE', 'EXTRA'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedThickness, setSelectedThickness] = useState('');
  const [materialsMetadata, setMaterialsMetadata] = useState(null);
  const [generatedPrompt, setGeneratedPrompt] = useState(null);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [isGeneratingMockup, setIsGeneratingMockup] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [mockupError, setMockupError] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Get available options based on selection
  const getAvailableDimensions = () => {
    if (!selectedItem || selectedItemType !== 'MATERIAL' || !materialsMetadata) return [];

    const materialInfo = materialsMetadata.materials[selectedItem];

    // For EDGING materials, use commonWidths from metadata (no pricing data)
    if (materialInfo && materialInfo.type === 'EDGING') {
      return materialInfo.commonWidths || [];
    }

    // For other materials, get from pricing data
    if (pricingData) {
      return Array.from(new Set(pricingData.filter(item => item['Product Name'] === selectedItem).map(item => item['Thickness'])));
    }

    return [];
  };

  const availableThicknesses = getAvailableDimensions();
  const selectedMaterialInfo = selectedItem && materialsMetadata ? materialsMetadata.materials[selectedItem] : null;
  const isEdgingMaterial = selectedMaterialInfo && selectedMaterialInfo.type === 'EDGING';
  const dimensionLabel = isEdgingMaterial ? 'Width' : 'Thickness';

  // Get categories based on item type
  const getCategories = () => {
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
  const getItems = () => {
    if (selectedItemType === 'MATERIAL' && selectedCategory) {
      // Return ALL materials - category is for component type, not material filtering
      return Object.keys(materialsMetadata?.materials || {});
    }
    // For hardware and extras, they're custom items entered by user
    return [];
  };

  // Find the build being edited
  useEffect(() => {
    if (isEditing && editingBuildId) {
      const build = builds.find(b => b.id === editingBuildId);
      if (build) {
        // Create a deep copy for editing
        setEditedBuild(JSON.parse(JSON.stringify(build)));
      }
    } else {
      setEditedBuild(null);
    }
  }, [isEditing, editingBuildId, builds]);

  // Load materials metadata
  useEffect(() => {
    fetch('/data/materials-metadata.json')
      .then(res => res.json())
      .then(data => setMaterialsMetadata(data))
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
  const getMaterialMetadata = (materialName) => {
    if (!materialsMetadata) return null;
    return materialsMetadata.materials[materialName] || null;
  };

  const getMaterialsByCategory = (category) => {
    if (!editedBuild.costs.materials || !materialsMetadata) return [];

    return editedBuild.costs.materials.filter(mat => {
      // Use the stored category field (from new interface)
      if (mat.category !== undefined) {
        return mat.category === category;
      }

      // Backward compatibility: infer category from component name for old builds
      const componentName = (mat.component || '').toLowerCase();
      if (componentName.includes('carcass') || componentName.includes('backing')) {
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

  const hasRequiredMaterials = () => {
    if (!materialsMetadata) return true; // If metadata not loaded, don't block

    const categories = materialsMetadata.categories;
    const requiredCategories = Object.keys(categories).filter(key => categories[key].required);

    return requiredCategories.every(category => getMaterialsByCategory(category).length > 0);
  };

  const handleMaterialUpdate = (index, field, value) => {
    setEditedBuild(prev => {
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
      updated.costs.savingsVsBudget = 5000 - updated.costs.grandTotal;

      return updated;
    });
  };

  const handleExtraUpdate = (index, field, value) => {
    setEditedBuild(prev => {
      const updated = { ...prev };
      updated.costs = { ...prev.costs };
      updated.costs.extras = [...prev.costs.extras];
      updated.costs.extras[index] = { ...prev.costs.extras[index], [field]: value };

      // Recalculate totals
      const extrasTotal = updated.costs.extras.reduce((sum, extra) => sum + (parseFloat(extra.estimate) || 0), 0);
      updated.costs.extrasTotal = extrasTotal;
      updated.costs.grandTotal = prev.costs.materialTotal + prev.costs.professionalDoorsDrawersTotal + prev.costs.hardwareTotal + extrasTotal;
      updated.costs.savingsVsBudget = 5000 - updated.costs.grandTotal;

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
        updated.costs.savingsVsBudget = 5000 - updated.costs.grandTotal;

        return updated;
      });
    } else if (selectedItemType === 'HARDWARE') {
      const newKey = `custom_${Date.now()}`;
      const categoryName = getCategories()[selectedCategory]?.name || 'Hardware';

      setEditedBuild(prev => {
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

  const handleRemoveMaterial = (index) => {
    setEditedBuild(prev => {
      const updated = { ...prev };
      updated.costs = { ...prev.costs };
      updated.costs.materials = prev.costs.materials.filter((_, i) => i !== index);

      // Recalculate totals
      const materialTotal = updated.costs.materials.reduce((sum, m) => sum + m.subtotal, 0);
      updated.costs.materialTotal = materialTotal;
      updated.costs.grandTotal = materialTotal + prev.costs.professionalDoorsDrawersTotal + prev.costs.hardwareTotal + prev.costs.extrasTotal;
      updated.costs.savingsVsBudget = 5000 - updated.costs.grandTotal;

      return updated;
    });
  };

  const handleAddHardware = () => {
    if (!editedBuild || !editedBuild.costs || !editedBuild.costs.hardware) {
      console.error('Cannot add hardware: invalid build structure', editedBuild);
      alert('Error: Build data is not properly loaded. Please try closing and reopening the editor.');
      return;
    }

    const newKey = `custom_${Date.now()}`;
    setEditedBuild(prev => {
      const updated = { ...prev };
      updated.costs = { ...prev.costs };
      updated.costs.hardware = {
        ...prev.costs.hardware,
        [newKey]: { desc: 'New Hardware Item', qty: 1, unitPrice: 0, total: 0 }
      };

      console.log('Added hardware:', newKey, updated.costs.hardware);
      return updated;
    });
  };

  const handleRemoveHardware = (key) => {
    setEditedBuild(prev => {
      const updated = { ...prev };
      updated.costs = { ...prev.costs };
      const { [key]: removed, ...remainingHardware } = prev.costs.hardware;
      updated.costs.hardware = remainingHardware;

      // Recalculate totals
      const hardwareTotal = Object.values(updated.costs.hardware).reduce((sum, hw) => sum + hw.total, 0);
      updated.costs.hardwareTotal = hardwareTotal;
      updated.costs.grandTotal = prev.costs.materialTotal + prev.costs.professionalDoorsDrawersTotal + hardwareTotal + prev.costs.extrasTotal;
      updated.costs.savingsVsBudget = 5000 - updated.costs.grandTotal;

      return updated;
    });
  };

  const handleAddExtra = () => {
    if (!editedBuild || !editedBuild.costs || !Array.isArray(editedBuild.costs.extras)) {
      console.error('Cannot add extra: invalid build structure', editedBuild);
      alert('Error: Build data is not properly loaded. Please try closing and reopening the editor.');
      return;
    }

    setEditedBuild(prev => {
      const updated = { ...prev };
      updated.costs = { ...prev.costs };
      updated.costs.extras = [...prev.costs.extras, { item: 'New Item', desc: 'Description', estimate: 0 }];

      console.log('Added extra, total extras:', updated.costs.extras.length);
      return updated;
    });
  };

  const handleRemoveExtra = (index) => {
    setEditedBuild(prev => {
      const updated = { ...prev };
      updated.costs = { ...prev.costs };
      updated.costs.extras = prev.costs.extras.filter((_, i) => i !== index);

      // Recalculate totals
      const extrasTotal = updated.costs.extras.reduce((sum, extra) => sum + (parseFloat(extra.estimate) || 0), 0);
      updated.costs.extrasTotal = extrasTotal;
      updated.costs.grandTotal = prev.costs.materialTotal + prev.costs.professionalDoorsDrawersTotal + prev.costs.hardwareTotal + extrasTotal;
      updated.costs.savingsVsBudget = 5000 - updated.costs.grandTotal;

      return updated;
    });
  };

  const handleHardwareUpdate = (key, field, value) => {
    setEditedBuild(prev => {
      const updated = { ...prev };
      updated.costs = { ...prev.costs };
      updated.costs.hardware = { ...prev.costs.hardware };
      updated.costs.hardware[key] = { ...prev.costs.hardware[key], [field]: value };

      // Recalculate hardware item total
      const item = updated.costs.hardware[key];
      item.total = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);

      // Recalculate hardware total
      const hardwareTotal = Object.values(updated.costs.hardware).reduce((sum, hw) => sum + hw.total, 0);
      updated.costs.hardwareTotal = hardwareTotal;
      updated.costs.grandTotal = prev.costs.materialTotal + prev.costs.professionalDoorsDrawersTotal + hardwareTotal + prev.costs.extrasTotal;
      updated.costs.savingsVsBudget = 5000 - updated.costs.grandTotal;

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
          doors: editedBuild.costs.professionalDoorsDrawers
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
      setMockupError(error.message || 'Failed to generate prompt. Make sure the server is running with: npm run server');
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
          setEditedBuild(prev => ({
            ...prev,
            image_gallery: buildData.image_gallery,
            generatedPrompt: promptToUse
          }));
        }
      } else {
        throw new Error('No image URL returned from server');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setImageError(error.message || 'Failed to generate image. Make sure your OpenRouter API key is set in .env');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGalleryUpdate = (newGallery) => {
    setEditedBuild(prev => ({
      ...prev,
      image_gallery: newGallery
    }));
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
      setSaveError(error.message || 'Failed to save build. Changes saved locally only.');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedBuild(null);
    stopEditing();
  };

  return (
    <>
      {/* Backdrop - Lighter with blur for modern feel */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300 ease-out animate-fade-in"
        onClick={handleCancel}
      />

      {/* Side Panel - Narrower and more focused */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[90%] md:w-[600px] lg:w-[650px] xl:w-[700px] max-w-3xl bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in-left scroll-smooth">
        {/* Header - Enhanced with better visual hierarchy */}
        <div className="sticky top-0 bg-gradient-to-b from-white to-gray-50/50 border-b border-gray-200 px-6 py-5 flex items-center justify-between z-10 backdrop-blur-sm shadow-sm">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Edit Build</h2>
            <p className="text-sm text-gray-600 font-medium">{editedBuild.name}</p>
          </div>
          <button
            onClick={handleCancel}
            className="ml-4 p-2.5 hover:bg-gray-200/80 rounded-full transition-all duration-200 group hover:rotate-90"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
          </button>
        </div>

        {/* Cost Summary - Enhanced with better gradients */}
        <div className="bg-gradient-to-br from-primary-50 via-primary-50/80 to-white border-b border-primary-100 px-6 py-5 shadow-inner-premium">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-primary-900 uppercase tracking-wide">Current Total</span>
            <span className="text-3xl font-bold text-primary-900">
              {formatCurrency(editedBuild.costs.grandTotal)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-primary-200/50">
            <span className="text-sm text-primary-700 font-medium">vs £5,000 Budget</span>
            <span className={`text-xl font-bold ${editedBuild.costs.savingsVsBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(editedBuild.costs.savingsVsBudget))}
              <span className="text-base font-semibold ml-1">
                {editedBuild.costs.savingsVsBudget >= 0 ? 'under' : 'over'}
              </span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 pb-24">
          <div className="space-y-6">
              {/* Validation Alert */}
              {!hasRequiredMaterials() && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">Missing Required Materials</h4>
                    <p className="text-sm text-red-700">Please add at least one Carcass and one Drawer material to complete your build.</p>
                  </div>
                </div>
              )}

            {/* Unified Add Item Section */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Build Item
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {/* 1. Item Type */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Type:</label>
                  <select
                    value={selectedItemType}
                    onChange={(e) => {
                      setSelectedItemType(e.target.value);
                      setSelectedCategory('');
                      setSelectedItem('');
                      setSelectedThickness('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select type...</option>
                    <option value="MATERIAL">📦 Material</option>
                    <option value="HARDWARE">🔧 Hardware</option>
                    <option value="EXTRA">✨ Extra</option>
                  </select>
                </div>

                {/* 2. Category */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Category:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedItem('');
                      setSelectedThickness('');
                    }}
                    disabled={!selectedItemType}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select category...</option>
                    {Object.entries(getCategories()).map(([key, cat]) => (
                      <option key={key} value={key}>
                        {cat.name} {cat.required ? '*' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Item/Material (only for materials) */}
                {selectedItemType === 'MATERIAL' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Material:</label>
                    <select
                      value={selectedItem}
                      onChange={(e) => {
                        setSelectedItem(e.target.value);
                        setSelectedThickness('');
                      }}
                      disabled={!selectedCategory}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Select material...</option>
                      {getItems().map(name => (
                        <option key={name} value={name}>
                          {name} {getMaterialMetadata(name)?.recommended && '⭐'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 4. Dimension (Thickness/Width - only for materials) */}
                {selectedItemType === 'MATERIAL' && availableThicknesses.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{dimensionLabel}:</label>
                    <select
                      value={selectedThickness}
                      onChange={(e) => setSelectedThickness(e.target.value)}
                      disabled={!selectedItem}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Select {dimensionLabel.toLowerCase()}...</option>
                      {availableThicknesses.map(thick => (
                        <option key={thick} value={thick}>{thick}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 5. Add Button */}
                <div className="flex items-end">
                  <button
                    onClick={handleAddItem}
                    disabled={
                      !selectedItemType ||
                      !selectedCategory ||
                      (selectedItemType === 'MATERIAL' && (!selectedItem || (availableThicknesses.length > 0 && !selectedThickness)))
                    }
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Material Preview (only for materials) */}
              {selectedItemType === 'MATERIAL' && selectedItem && getMaterialMetadata(selectedItem) && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex gap-3">
                    {getMaterialMetadata(selectedItem).image && (
                      <img
                        src={getMaterialMetadata(selectedItem).image}
                        alt={selectedItem}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{getMaterialMetadata(selectedItem).description}</p>
                      <p className="text-xs text-blue-600 mt-1">{getMaterialMetadata(selectedItem).usage}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

              {/* Material Categories */}
              {materialsMetadata && Object.entries(materialsMetadata.categories).map(([categoryKey, category]) => {
                const categoryMaterials = getMaterialsByCategory(categoryKey);

                return (
                  <div key={categoryKey} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className={`p-4 ${category.required ? 'bg-orange-50 border-b-2 border-orange-200' : 'bg-gray-50 border-b-2 border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">{category.name}</h3>
                          {category.required ? (
                            <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-medium">Required</span>
                          ) : (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Optional</span>
                          )}
                          {categoryMaterials.length > 0 && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{categoryMaterials.length} item(s)</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
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
                        categoryMaterials.map((mat, index) => {
                          const globalIndex = editedBuild.costs.materials.findIndex(m => m === mat);
                          const metadata = getMaterialMetadata(mat.material);

                          return (
                            <div key={globalIndex} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
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
                                    <button
                                      onClick={() => handleRemoveMaterial(globalIndex)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                      title="Remove material"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-4">
                                    <label className="text-sm font-medium text-gray-700 w-16">Sheets:</label>
                                    <input
                                      type="number"
                                      value={mat.sheets}
                                      onChange={(e) => {
                                        const sheets = parseFloat(e.target.value) || 0;
                                        handleMaterialUpdate(globalIndex, 'sheets', sheets);
                                      }}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                      min="0"
                                      step="0.5"
                                    />
                                    <span className="text-sm font-bold text-gray-900 w-24 text-right">
                                      {formatCurrency(mat.subtotal)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="bg-primary-50 rounded-lg p-4 flex justify-between items-center">
                <span className="font-bold text-primary-900">Material Total:</span>
                <span className="text-xl font-bold text-primary-900">
                  {formatCurrency(editedBuild.costs.materialTotal)}
                </span>
              </div>

              {/* Generate Mockup Section */}
              {hasRequiredMaterials() && (
                <div className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
                  <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                    <span>🎨</span>
                    AI-Generated Wardrobe Visualization
                  </h4>
                  <p className="text-sm text-purple-700 mb-4">
                    Generate a photorealistic visualization of your wardrobe using AI image generation.
                  </p>

                  {/* Step 1: Generate Prompt */}
                  <button
                    onClick={handleGenerateMockup}
                    disabled={isGeneratingMockup}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGeneratingMockup ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating Prompt...
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        Step 1: Generate Design Prompt
                      </>
                    )}
                  </button>

                  {mockupError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{mockupError}</p>
                      <p className="text-xs text-red-600 mt-1">
                        Tip: Run <code className="bg-red-100 px-1 rounded">npm run server</code> in a new terminal
                      </p>
                    </div>
                  )}

                  {/* Step 2: Edit Prompt */}
                  {generatedPrompt && (
                    <div className="mt-4 space-y-3">
                      <div className="bg-white border-2 border-purple-300 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold text-purple-900">Step 2: Edit Prompt (Optional)</h5>
                          <button
                            onClick={() => navigator.clipboard.writeText(editedPrompt)}
                            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
                          >
                            📋 Copy
                          </button>
                        </div>
                        <textarea
                          value={editedPrompt}
                          onChange={(e) => setEditedPrompt(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[120px] text-sm"
                          placeholder="Edit the generated prompt..."
                        />
                      </div>

                      {/* Step 3: Generate Image */}
                      <button
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 transition disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isGeneratingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Generating Image...
                          </>
                        ) : (
                          <>
                            <span>🖼️</span>
                            Step 3: Generate Image
                          </>
                        )}
                      </button>

                      {imageError && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">{imageError}</p>
                          <p className="text-xs text-red-600 mt-1">
                            Make sure your OpenRouter API key is set in the .env file
                          </p>
                        </div>
                      )}

                      {/* Display Generated Image */}
                      {generatedImageUrl && (
                        <div className="mt-4 bg-white border-2 border-green-300 rounded-lg p-4">
                          <p className="text-sm font-semibold text-green-900 mb-2">
                            ✓ New image added to gallery!
                          </p>
                          <p className="text-xs text-green-600">
                            You can generate more variations by clicking "Generate Image" again.
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-purple-600">
                        💡 Generate multiple image variations. Click "Generate Image" again for new variations.
                      </p>
                    </div>
                  )}

                  {/* Image Gallery */}
                  {editedBuild.image_gallery && editedBuild.image_gallery.length > 0 && (
                    <div className="mt-6 bg-white border-2 border-gray-200 rounded-lg p-4">
                      <ImageGallery
                        buildId={editedBuild.id}
                        gallery={editedBuild.image_gallery}
                        onGalleryUpdate={handleGalleryUpdate}
                      />
                    </div>
                  )}
                </div>
              )}

            {/* Hardware Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                🔧 Hardware
              </h3>

              {Object.entries(editedBuild.costs.hardware).map(([key, hw]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 block mb-1">Description:</label>
                      <input
                        type="text"
                        value={hw.desc}
                        onChange={(e) => handleHardwareUpdate(key, 'desc', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveHardware(key)}
                      className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Remove hardware"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Quantity:</label>
                      <input
                        type="number"
                        value={hw.qty}
                        onChange={(e) => handleHardwareUpdate(key, 'qty', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Unit Price (£):</label>
                      <input
                        type="number"
                        value={hw.unitPrice}
                        onChange={(e) => handleHardwareUpdate(key, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm text-gray-600">Subtotal: </span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(hw.total)}</span>
                  </div>
                </div>
              ))}

              <div className="bg-primary-50 rounded-lg p-4 flex justify-between items-center">
                <span className="font-bold text-primary-900">Hardware Total:</span>
                <span className="text-xl font-bold text-primary-900">
                  {formatCurrency(editedBuild.costs.hardwareTotal)}
                </span>
              </div>
            </div>

            {/* Extras Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                ✨ Extras & Finishing
              </h3>

              {editedBuild.costs.extras.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  No extras added yet. Use "Add Build Item" above to add extras.
                </div>
              ) : (
                editedBuild.costs.extras.map((extra, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Item Name:</label>
                          <input
                            type="text"
                            value={extra.item}
                            onChange={(e) => handleExtraUpdate(index, 'item', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Description:</label>
                          <input
                            type="text"
                            value={extra.desc}
                            onChange={(e) => handleExtraUpdate(index, 'desc', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Cost (£):</label>
                          <input
                            type="number"
                            value={extra.estimate}
                            onChange={(e) => handleExtraUpdate(index, 'estimate', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveExtra(index)}
                        className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              <div className="bg-primary-50 rounded-lg p-4 flex justify-between items-center">
                <span className="font-bold text-primary-900">Extras Total:</span>
                <span className="text-xl font-bold text-primary-900">
                  {formatCurrency(editedBuild.costs.extrasTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions - Enhanced with better styling */}
        <div className="fixed bottom-0 right-0 w-full sm:w-[90%] md:w-[600px] lg:w-[650px] xl:w-[700px] max-w-3xl bg-gradient-to-t from-white via-white to-gray-50/30 border-t border-gray-200 px-6 py-5 flex gap-3 shadow-premium backdrop-blur-sm">
          <button
            onClick={handleCancel}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

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
      </div>
    </>
  );
}
