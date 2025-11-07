/**
 * Pricing Calculator Utilities
 * Pure functions for cost calculations, comparisons, and forecasting
 */

/**
 * Compare two builds and return differences
 */
export function compareBuilds(build1, build2) {
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
 * Calculate bulk discount for multiple builds
 */
export function calculateBulkDiscount(builds, discountPercent = 0) {
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
 * Get material usage statistics across builds
 */
export function getMaterialStats(builds) {
  const materialUsage = {};

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
 * Find builds within budget
 */
export function filterByBudget(builds, maxBudget) {
  return builds
    .filter(build => build.costs.grandTotal <= maxBudget)
    .sort((a, b) => a.costs.grandTotal - b.costs.grandTotal);
}

/**
 * Calculate average build cost
 */
export function getAverageStats(builds) {
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
 * Format currency
 */
export function formatCurrency(amount, currency = 'GBP') {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Calculate ROI on quality vs cost
 */
export function calculateQualityROI(build) {
  // Simple heuristic: quality score based on materials
  const materialQuality = build.costs.materialTotal / build.costs.grandTotal;
  const qualityScore = materialQuality;

  return {
    qualityScore: qualityScore * 100,
    costPerQualityPoint: build.costs.grandTotal / (qualityScore * 100),
    roi: (qualityScore * 100) / (build.costs.grandTotal / 100)
  };
}
