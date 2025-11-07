import Papa from 'papaparse';

/**
 * Export builds comparison to CSV
 */
export function exportBuildsToCSV(builds, filename = 'builds-comparison.csv') {
  const data = builds.map(build => ({
    'Build #': build.id,
    'Build Name': build.name,
    'Character': build.character,
    'Materials Cost (£)': build.costs.materialTotal.toFixed(2),
    'Doors/Drawers Cost (£)': build.costs.professionalDoorsDrawersTotal.toFixed(2),
    'Extras Cost (£)': build.costs.extrasTotal.toFixed(2),
    'Hardware Cost (£)': build.costs.hardwareTotal.toFixed(2),
    'Total Cost (£)': build.costs.grandTotal.toFixed(2),
    'Savings vs £5,000 (£)': build.costs.savingsVsBudget.toFixed(2),
    'Savings %': `${build.costs.savingsPercent.toFixed(1)}%`
  }));

  const csv = Papa.unparse(data);
  downloadFile(csv, filename, 'text/csv');
}

/**
 * Export detailed materials breakdown for a single build
 */
export function exportBuildMaterialsToCSV(build, filename = `build-${build.id}-materials.csv`) {
  const data = build.costs.materials.map(mat => ({
    'Component': mat.component,
    'Material': mat.material,
    'Thickness': mat.thickness,
    'Sheets': mat.sheets,
    'Price/Sheet (£)': mat.pricePerSheet.toFixed(2),
    'Subtotal (£)': mat.subtotal.toFixed(2),
    'SKU': mat.sku,
    'Note': mat.note || ''
  }));

  const csv = Papa.unparse(data);
  downloadFile(csv, filename, 'text/csv');
}

/**
 * Export full build details to CSV
 */
export function exportBuildDetailsToCSV(build, filename = `build-${build.id}-details.csv`) {
  // Materials section
  const materials = build.costs.materials.map(mat => ({
    'Section': 'Materials',
    'Item': mat.component,
    'Description': `${mat.material} (${mat.thickness})`,
    'Quantity': mat.sheets,
    'Unit Price': mat.pricePerSheet.toFixed(2),
    'Total': mat.subtotal.toFixed(2)
  }));

  // Professional doors section
  const doors = Object.values(build.costs.professionalDoorsDrawers).map(door => ({
    'Section': 'Doors/Drawers',
    'Item': door.desc,
    'Description': door.size,
    'Quantity': door.qty,
    'Unit Price': door.unitPrice.toFixed(2),
    'Total': door.total.toFixed(2)
  }));

  // Hardware section
  const hardware = Object.values(build.costs.hardware).map(hw => ({
    'Section': 'Hardware',
    'Item': hw.desc,
    'Description': '',
    'Quantity': hw.qty,
    'Unit Price': hw.unitPrice.toFixed(2),
    'Total': hw.total.toFixed(2)
  }));

  // Extras section
  const extras = build.costs.extras.map(extra => ({
    'Section': 'Extras',
    'Item': extra.item,
    'Description': extra.desc,
    'Quantity': 1,
    'Unit Price': extra.estimate.toFixed(2),
    'Total': extra.estimate.toFixed(2)
  }));

  // Summary section
  const summary = [
    {
      'Section': 'SUMMARY',
      'Item': 'Materials Total',
      'Description': '',
      'Quantity': '',
      'Unit Price': '',
      'Total': build.costs.materialTotal.toFixed(2)
    },
    {
      'Section': 'SUMMARY',
      'Item': 'Doors/Drawers Total',
      'Description': '',
      'Quantity': '',
      'Unit Price': '',
      'Total': build.costs.professionalDoorsDrawersTotal.toFixed(2)
    },
    {
      'Section': 'SUMMARY',
      'Item': 'Hardware Total',
      'Description': '',
      'Quantity': '',
      'Unit Price': '',
      'Total': build.costs.hardwareTotal.toFixed(2)
    },
    {
      'Section': 'SUMMARY',
      'Item': 'Extras Total',
      'Description': '',
      'Quantity': '',
      'Unit Price': '',
      'Total': build.costs.extrasTotal.toFixed(2)
    },
    {
      'Section': 'SUMMARY',
      'Item': 'GRAND TOTAL',
      'Description': '',
      'Quantity': '',
      'Unit Price': '',
      'Total': build.costs.grandTotal.toFixed(2)
    }
  ];

  const allData = [...materials, ...doors, ...hardware, ...extras, ...summary];
  const csv = Papa.unparse(allData);
  downloadFile(csv, filename, 'text/csv');
}

/**
 * Helper function to trigger file download
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export all builds data as JSON
 */
export function exportBuildsToJSON(builds, filename = 'builds-data.json') {
  const data = builds.map(b => b.toJSON());
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
}
