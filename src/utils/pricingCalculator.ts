/**
 * Pricing Calculator Utilities
 * Pure functions for cost calculations, comparisons, and forecasting
 */

// Types and Interfaces

interface BuildCosts {
  materialTotal: number;
  professionalDoorsDrawersTotal: number;
  extrasTotal: number;
  hardwareTotal: number;
  grandTotal: number;
  materials: Material[];
}

interface Material {
  component?: string;
  material: string;
  thickness: string;
  sheets: number;
  pricePerSheet: number;
  subtotal: number;
  sku?: string;
}

interface Build {
  id?: number;
  name: string;
  costs: BuildCosts;
}

interface CostBreakdownItem {
  build1: number;
  build2: number;
  difference: number;
  percentDiff: number;
}

interface BuildComparison {
  costDifference: number;
  materialDifference: number;
  extrasDifference: number;
  breakdown: {
    materials: CostBreakdownItem;
    doors: CostBreakdownItem;
    extras: CostBreakdownItem;
    total: CostBreakdownItem;
  };
  cheaper: string;
}

interface DiscountedBuild {
  name: string;
  originalCost: number;
  discountedCost: number;
}

interface BulkDiscount {
  originalTotal: number;
  discountPercent: number;
  discountAmount: number;
  finalTotal: number;
  savings: number;
  breakdown: DiscountedBuild[];
}

interface MaterialUsage {
  material: string;
  thickness: string;
  sku?: string;
  pricePerSheet: number;
  totalSheets: number;
  totalCost: number;
  usedInBuilds: string[];
}

interface AverageStats {
  averageCost: number;
  averageMaterialCost: number;
  averageExtrasCost: number;
  cheapest: Build;
  mostExpensive: Build;
}

interface QualityROI {
  qualityScore: number;
  costPerQualityPoint: number;
  roi: number;
}

/**
 * Compares two builds and returns detailed cost differences.
 * Calculates differences across all cost categories and determines which build is cheaper.
 *
 * @param build1 - First build to compare
 * @param build2 - Second build to compare
 * @returns Comparison object with cost differences and percentage changes
 */
export function compareBuilds(build1: Build, build2: Build): BuildComparison {
  return {
    costDifference: build1.costs.grandTotal - build2.costs.grandTotal,
    materialDifference: build1.costs.materialTotal - build2.costs.materialTotal,
    extrasDifference: build1.costs.extrasTotal - build2.costs.extrasTotal,

    // Cost breakdown comparison
    breakdown: {
      materials: {
        build1: build1.costs.materialTotal,
        build2: build2.costs.materialTotal,
        difference: build1.costs.materialTotal - build2.costs.materialTotal,
        percentDiff: ((build1.costs.materialTotal - build2.costs.materialTotal) / build2.costs.materialTotal) * 100
      },
      doors: {
        build1: build1.costs.professionalDoorsDrawersTotal,
        build2: build2.costs.professionalDoorsDrawersTotal,
        difference: 0, // Same for all builds
        percentDiff: 0
      },
      extras: {
        build1: build1.costs.extrasTotal,
        build2: build2.costs.extrasTotal,
        difference: build1.costs.extrasTotal - build2.costs.extrasTotal,
        percentDiff: build2.costs.extrasTotal > 0
          ? ((build1.costs.extrasTotal - build2.costs.extrasTotal) / build2.costs.extrasTotal) * 100
          : 0
      },
      total: {
        build1: build1.costs.grandTotal,
        build2: build2.costs.grandTotal,
        difference: build1.costs.grandTotal - build2.costs.grandTotal,
        percentDiff: ((build1.costs.grandTotal - build2.costs.grandTotal) / build2.costs.grandTotal) * 100
      }
    },

    // Summary
    cheaper: build1.costs.grandTotal < build2.costs.grandTotal ? build1.name : build2.name
  };
}

/**
 * Calculates bulk discount for purchasing multiple builds together.
 * Applies a percentage discount to the total cost and breaks down per-build savings.
 *
 * @param builds - Array of builds to calculate discount for
 * @param discountPercent - Discount percentage to apply (default: 0)
 * @returns Bulk discount details including original total, discount amount, and per-build breakdown
 */
export function calculateBulkDiscount(builds: Build[], discountPercent: number = 0): BulkDiscount {
  const totalCost = builds.reduce((sum, build) => sum + build.costs.grandTotal, 0);
  const discountAmount = (totalCost * discountPercent) / 100;

  return {
    originalTotal: totalCost,
    discountPercent,
    discountAmount,
    finalTotal: totalCost - discountAmount,
    savings: discountAmount,
    breakdown: builds.map(build => ({
      name: build.name,
      originalCost: build.costs.grandTotal,
      discountedCost: build.costs.grandTotal * (1 - discountPercent / 100)
    }))
  };
}

/**
 * Aggregates material usage statistics across multiple builds.
 * Groups materials by type and thickness, showing total sheets and costs.
 *
 * @param builds - Array of builds to analyze
 * @returns Array of material usage statistics sorted by total cost (descending)
 */
export function getMaterialStats(builds: Build[]): MaterialUsage[] {
  const materialUsage: Record<string, MaterialUsage> = {};

  builds.forEach(build => {
    build.costs.materials.forEach(mat => {
      const key = `${mat.material}-${mat.thickness}`;

      if (!materialUsage[key]) {
        materialUsage[key] = {
          material: mat.material,
          thickness: mat.thickness,
          sku: mat.sku,
          pricePerSheet: mat.pricePerSheet,
          totalSheets: 0,
          totalCost: 0,
          usedInBuilds: []
        };
      }

      materialUsage[key].totalSheets += mat.sheets;
      materialUsage[key].totalCost += mat.subtotal;
      materialUsage[key].usedInBuilds.push(build.name);
    });
  });

  return Object.values(materialUsage).sort((a, b) => b.totalCost - a.totalCost);
}

/**
 * Filters builds that fit within a specified budget.
 * Returns builds sorted by cost (ascending).
 *
 * @param builds - Array of builds to filter
 * @param maxBudget - Maximum budget threshold
 * @returns Array of builds under budget, sorted by cost
 */
export function filterByBudget(builds: Build[], maxBudget: number): Build[] {
  return builds
    .filter(build => build.costs.grandTotal <= maxBudget)
    .sort((a, b) => a.costs.grandTotal - b.costs.grandTotal);
}

/**
 * Calculates average cost statistics across multiple builds.
 * Returns null if no builds are provided.
 *
 * @param builds - Array of builds to analyze
 * @returns Average statistics including mean costs and extremes (cheapest/most expensive)
 */
export function getAverageStats(builds: Build[]): AverageStats | null {
  if (builds.length === 0) return null;

  const totalCosts = builds.reduce((sum, b) => sum + b.costs.grandTotal, 0);
  const totalMaterials = builds.reduce((sum, b) => sum + b.costs.materialTotal, 0);
  const totalExtras = builds.reduce((sum, b) => sum + b.costs.extrasTotal, 0);

  return {
    averageCost: totalCosts / builds.length,
    averageMaterialCost: totalMaterials / builds.length,
    averageExtrasCost: totalExtras / builds.length,
    cheapest: builds.reduce((min, b) => b.costs.grandTotal < min.costs.grandTotal ? b : min),
    mostExpensive: builds.reduce((max, b) => b.costs.grandTotal > max.costs.grandTotal ? b : max)
  };
}

/**
 * Formats a numeric amount as currency with locale-specific formatting.
 *
 * @param amount - The amount to format
 * @param currency - Currency code (default: 'GBP')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Calculates ROI (Return on Investment) based on material quality versus cost.
 * Uses a simple heuristic where quality is proportional to material cost ratio.
 *
 * @param build - The build to analyze
 * @returns Quality ROI metrics including quality score, cost per quality point, and ROI ratio
 */
export function calculateQualityROI(build: Build): QualityROI {
  // Simple heuristic: quality score based on materials
  const materialQuality = build.costs.materialTotal / build.costs.grandTotal;
  const qualityScore = materialQuality;

  return {
    qualityScore: qualityScore * 100,
    costPerQualityPoint: build.costs.grandTotal / (qualityScore * 100),
    roi: (qualityScore * 100) / (build.costs.grandTotal / 100)
  };
}
