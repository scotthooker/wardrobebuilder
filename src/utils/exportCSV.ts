import Papa from 'papaparse';

// Types and Interfaces

interface BuildCosts {
  materialTotal: number;
  professionalDoorsDrawersTotal: number;
  extrasTotal: number;
  hardwareTotal: number;
  grandTotal: number;
  savingsVsBudget: number;
  savingsPercent: number;
  materials: Material[];
  professionalDoorsDrawers: Record<string, ProfessionalItem>;
  hardware: Record<string, HardwareItem>;
  extras: Extra[];
}

interface Material {
  component: string;
  material: string;
  thickness: string;
  sheets: number;
  pricePerSheet: number;
  subtotal: number;
  sku?: string;
  note?: string;
}

interface ProfessionalItem {
  desc?: string;
  description?: string;
  size?: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface HardwareItem {
  desc: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface Extra {
  item: string;
  desc: string;
  estimate: number;
}

export interface Build {
  id: number;
  name: string;
  character: string;
  costs: BuildCosts;
  toJSON?: () => unknown;
}

interface CSVRow {
  [key: string]: string | number;
}

/**
 * Exports a comparison of multiple builds to CSV format.
 * Includes cost breakdown by category and savings calculations.
 *
 * @param builds - Array of build objects to compare
 * @param filename - Output filename (default: 'builds-comparison.csv')
 */
export function exportBuildsToCSV(builds: Build[], filename: string = 'builds-comparison.csv'): void {
  const data: CSVRow[] = builds.map(build => ({
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
 * Exports detailed materials breakdown for a single build to CSV.
 * Lists all materials with quantities, pricing, and SKU information.
 *
 * @param build - The build object to export materials from
 * @param filename - Output filename (default: 'build-{id}-materials.csv')
 */
export function exportBuildMaterialsToCSV(build: Build, filename?: string): void {
  const outputFilename = filename || `build-${build.id}-materials.csv`;

  const data: CSVRow[] = build.costs.materials.map(mat => ({
    'Component': mat.component,
    'Material': mat.material,
    'Thickness': mat.thickness,
    'Sheets': mat.sheets,
    'Price/Sheet (£)': mat.pricePerSheet.toFixed(2),
    'Subtotal (£)': mat.subtotal.toFixed(2),
    'SKU': mat.sku || '',
    'Note': mat.note || ''
  }));

  const csv = Papa.unparse(data);
  downloadFile(csv, outputFilename, 'text/csv');
}

/**
 * Exports complete build details to CSV including all cost categories and summary.
 * Provides a comprehensive breakdown of materials, doors, hardware, extras, and totals.
 *
 * @param build - The build object to export
 * @param filename - Output filename (default: 'build-{id}-details.csv')
 */
export function exportBuildDetailsToCSV(build: Build, filename?: string): void {
  const outputFilename = filename || `build-${build.id}-details.csv`;

  // Materials section
  const materials: CSVRow[] = build.costs.materials.map(mat => ({
    'Section': 'Materials',
    'Item': mat.component,
    'Description': `${mat.material} (${mat.thickness})`,
    'Quantity': mat.sheets,
    'Unit Price': mat.pricePerSheet.toFixed(2),
    'Total': mat.subtotal.toFixed(2)
  }));

  // Professional doors section
  const doors: CSVRow[] = Object.values(build.costs.professionalDoorsDrawers).map(door => ({
    'Section': 'Doors/Drawers',
    'Item': door.desc || door.description || '',
    'Description': door.size || '',
    'Quantity': door.qty,
    'Unit Price': door.unitPrice.toFixed(2),
    'Total': door.total.toFixed(2)
  }));

  // Hardware section
  const hardware: CSVRow[] = Object.values(build.costs.hardware).map(hw => ({
    'Section': 'Hardware',
    'Item': hw.desc,
    'Description': '',
    'Quantity': hw.qty,
    'Unit Price': hw.unitPrice.toFixed(2),
    'Total': hw.total.toFixed(2)
  }));

  // Extras section
  const extras: CSVRow[] = build.costs.extras.map(extra => ({
    'Section': 'Extras',
    'Item': extra.item,
    'Description': extra.desc,
    'Quantity': 1,
    'Unit Price': extra.estimate.toFixed(2),
    'Total': extra.estimate.toFixed(2)
  }));

  // Summary section
  const summary: CSVRow[] = [
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
  downloadFile(csv, outputFilename, 'text/csv');
}

/**
 * Helper function to trigger browser file download.
 * Creates a temporary blob URL and programmatically clicks a download link.
 *
 * @param content - The file content to download
 * @param filename - Name for the downloaded file
 * @param mimeType - MIME type of the file content
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
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
 * Exports all builds data as JSON format.
 * Uses the toJSON method if available on build objects, otherwise exports raw build data.
 *
 * @param builds - Array of build objects to export
 * @param filename - Output filename (default: 'builds-data.json')
 */
export function exportBuildsToJSON(builds: Build[], filename: string = 'builds-data.json'): void {
  const data = builds.map(b => b.toJSON ? b.toJSON() : b);
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
}
