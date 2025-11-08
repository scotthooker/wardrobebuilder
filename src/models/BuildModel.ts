/**
 * BuildModel - Represents a wardrobe build with inheritance from base configuration
 * Handles material calculations, cost breakdowns, and timeline management
 */

// Interfaces for BuildModel

interface Material {
  material: string;
  thickness: string;
  sheets: number;
  note?: string;
  finish?: string;
}

interface Materials {
  [key: string]: Material;
}

interface Extra {
  desc: string;
  estimate: number;
}

interface Extras {
  [key: string]: Extra;
}

interface HardwareItem {
  total: number;
}

interface Hardware {
  [key: string]: HardwareItem;
}

interface ProfessionalDoorsDrawers {
  [key: string]: {
    total: number;
  };
}

interface BuildConfig {
  id: string;
  name: string;
  character: string;
  image: string;
  materials?: Materials;
  extras?: Extras;
  specialTools?: string[];
  considerations?: string[];
  recommendedFor?: string;
}

interface BaseConfigMetadata {
  targetBudget?: number;
}

interface BaseConfig {
  hardware: Hardware;
  professionalDoors: ProfessionalDoorsDrawers;
  metadata?: BaseConfigMetadata;
}

interface PricingDataItem {
  'Product Name': string;
  'Thickness': string;
  'Price Ex VAT (£)': string;
  'SKU': string;
}

type PricingData = PricingDataItem[];

interface PricingResult {
  price: number;
  sku: string;
  fullName: string;
}

interface MaterialCost {
  component: string;
  material: string;
  thickness: string;
  sheets: number;
  pricePerSheet: number;
  subtotal: number;
  sku: string;
  fullName: string;
  note: string;
}

interface ExtraCost {
  item: string;
  desc: string;
  estimate: number;
}

interface Costs {
  materials: MaterialCost[];
  materialTotal: number;
  professionalDoorsDrawers: ProfessionalDoorsDrawers;
  professionalDoorsDrawersTotal: number;
  hardware: Hardware;
  hardwareTotal: number;
  extras: ExtraCost[];
  extrasTotal: number;
  grandTotal: number;
  savingsVsBudget: number;
  savingsPercent: number;
}

interface MaterialUpdate {
  material?: string;
  thickness?: string;
  sheets?: number;
  note?: string;
  finish?: string;
}

interface ExtraUpdate {
  desc?: string;
  estimate?: number;
}

interface MetadataUpdate {
  recommendedFor?: string;
}

interface JSONOutput {
  id: string;
  name: string;
  character: string;
  image: string;
  materials: Materials;
  extras: Extras;
  costs: Costs;
  specialTools: string[];
  considerations: string[];
  recommendedFor: string;
}

interface CSVRow {
  'Build #': string;
  'Build Name': string;
  'Character': string;
  'Materials Cost (£)': string;
  'Doors/Drawers Cost (£)': string;
  'Extras Cost (£)': string;
  'Hardware Cost (£)': string;
  'Total Cost (£)': string;
  'Savings vs Budget (£)': string;
  'Savings %': string;
}

export class BuildModel {
  id: string;
  name: string;
  character: string;
  image: string;
  hardware: Hardware;
  professionalDoors: ProfessionalDoorsDrawers;
  materials: Materials;
  extras: Extras;
  specialTools: string[];
  considerations: string[];
  recommendedFor: string;
  pricingData: PricingData;
  baseConfig: BaseConfig;
  costs: Costs;

  constructor(buildConfig: BuildConfig, baseConfig: BaseConfig, pricingData: PricingData) {
    // Basic properties
    this.id = buildConfig.id;
    this.name = buildConfig.name;
    this.character = buildConfig.character;
    this.image = buildConfig.image;

    // Inherit from base configuration
    this.hardware = { ...baseConfig.hardware };
    this.professionalDoors = { ...baseConfig.professionalDoors };

    // Materials and extras (unique to each build)
    this.materials = buildConfig.materials || {};
    this.extras = buildConfig.extras || {};

    // Metadata with defaults
    this.specialTools = buildConfig.specialTools || [];
    this.considerations = buildConfig.considerations || [];
    this.recommendedFor = buildConfig.recommendedFor || '';

    // Store references
    this.pricingData = pricingData;
    this.baseConfig = baseConfig;

    // Calculate costs
    this.costs = this._calculateCosts();
  }

  /**
   * Calculate all costs for this build
   */
  _calculateCosts(): Costs {
    // 1. Material costs
    const materialCosts: MaterialCost[] = Object.entries(this.materials).map(([key, mat]) => {
      const pricing = this._findPricing(mat.material, mat.thickness);
      const subtotal = pricing.price * mat.sheets;

      return {
        component: key,
        material: mat.material,
        thickness: mat.thickness,
        sheets: mat.sheets,
        pricePerSheet: pricing.price,
        subtotal: subtotal,
        sku: pricing.sku,
        fullName: pricing.fullName,
        note: mat.note || mat.finish || ''
      };
    });

    const materialTotal = materialCosts.reduce((sum, m) => sum + m.subtotal, 0);

    // 2. Professional doors/drawers costs
    const doorsDrawersTotal = Object.values(this.professionalDoors)
      .reduce((sum, item) => sum + item.total, 0);

    // 3. Hardware costs
    const hardwareTotal = Object.values(this.hardware)
      .reduce((sum, item) => sum + item.total, 0);

    // 4. Extras costs
    const extrasCosts: ExtraCost[] = Object.entries(this.extras).map(([key, extra]) => ({
      item: key,
      desc: extra.desc,
      estimate: extra.estimate
    }));

    const extrasTotal = extrasCosts.reduce((sum, e) => sum + e.estimate, 0);

    // 5. Grand total
    const grandTotal = materialTotal + doorsDrawersTotal + hardwareTotal + extrasTotal;
    const targetBudget = this.baseConfig.metadata?.targetBudget || 5000;

    return {
      materials: materialCosts,
      materialTotal,
      professionalDoorsDrawers: this.professionalDoors,
      professionalDoorsDrawersTotal: doorsDrawersTotal,
      hardware: this.hardware,
      hardwareTotal,
      extras: extrasCosts,
      extrasTotal,
      grandTotal,
      savingsVsBudget: targetBudget - grandTotal,
      savingsPercent: ((targetBudget - grandTotal) / targetBudget) * 100
    };
  }

  /**
   * Find pricing data for a specific material and thickness
   */
  _findPricing(materialName: string, thickness: string): PricingResult {
    const match = this.pricingData.find(p =>
      p['Product Name'].toLowerCase().includes(materialName.toLowerCase()) &&
      p['Thickness'] === thickness
    );

    if (match) {
      return {
        price: parseFloat(match['Price Ex VAT (£)']),
        sku: match['SKU'],
        fullName: match['Product Name']
      };
    }

    // Fallback if not found
    console.warn(`Pricing not found for: ${materialName} (${thickness})`);
    return {
      price: 0,
      sku: 'N/A',
      fullName: materialName
    };
  }

  /**
   * Update a material and recalculate costs
   */
  updateMaterial(key: string, updates: MaterialUpdate): this {
    this.materials[key] = { ...this.materials[key], ...updates } as Material;
    this.costs = this._calculateCosts();
    return this;
  }

  /**
   * Add a new material
   */
  addMaterial(key: string, material: Material): this {
    this.materials[key] = material;
    this.costs = this._calculateCosts();
    return this;
  }

  /**
   * Remove a material
   */
  removeMaterial(key: string): this {
    delete this.materials[key];
    this.costs = this._calculateCosts();
    return this;
  }

  /**
   * Update an extra and recalculate costs
   */
  updateExtra(key: string, updates: ExtraUpdate): this {
    this.extras[key] = { ...this.extras[key], ...updates } as Extra;
    this.costs = this._calculateCosts();
    return this;
  }

  /**
   * Add a new extra
   */
  addExtra(key: string, extra: Extra): this {
    this.extras[key] = extra;
    this.costs = this._calculateCosts();
    return this;
  }

  /**
   * Remove an extra
   */
  removeExtra(key: string): this {
    delete this.extras[key];
    this.costs = this._calculateCosts();
    return this;
  }

  /**
   * Update metadata
   */
  updateMetadata(updates: MetadataUpdate): this {
    if (updates.recommendedFor) this.recommendedFor = updates.recommendedFor;
    return this;
  }

  /**
   * Export build to JSON format
   */
  toJSON(): JSONOutput {
    return {
      id: this.id,
      name: this.name,
      character: this.character,
      image: this.image,
      materials: this.materials,
      extras: this.extras,
      costs: this.costs,
      specialTools: this.specialTools,
      considerations: this.considerations,
      recommendedFor: this.recommendedFor
    };
  }

  /**
   * Export for CSV format
   */
  toCSVRow(): CSVRow {
    return {
      'Build #': this.id,
      'Build Name': this.name,
      'Character': this.character,
      'Materials Cost (£)': this.costs.materialTotal.toFixed(2),
      'Doors/Drawers Cost (£)': this.costs.professionalDoorsDrawersTotal.toFixed(2),
      'Extras Cost (£)': this.costs.extrasTotal.toFixed(2),
      'Hardware Cost (£)': this.costs.hardwareTotal.toFixed(2),
      'Total Cost (£)': this.costs.grandTotal.toFixed(2),
      'Savings vs Budget (£)': this.costs.savingsVsBudget.toFixed(2),
      'Savings %': `${this.costs.savingsPercent.toFixed(1)}%`
    };
  }

  /**
   * Clone this build with a new ID and name
   */
  clone(newId: string, newName: string): BuildModel {
    const clonedConfig: BuildConfig = {
      ...this.toJSON(),
      id: newId,
      name: newName
    };
    return new BuildModel(clonedConfig, this.baseConfig, this.pricingData);
  }
}
