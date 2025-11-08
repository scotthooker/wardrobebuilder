import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import { exportBuildsToCSV, exportBuildDetailsToCSV, exportBuildsToJSON, type Build } from '../../utils/exportCSV';
import { Button } from '../ui/Button';

type ExportFormat = 'csv' | 'csv-details' | 'json';

interface ExportButtonProps {
  builds?: Build[];
  build?: Build;
  variant?: 'default' | 'simple';
}

export function ExportButton({ builds, build, variant = 'default' }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: ExportFormat) => {
    if (build) {
      // Single build export
      if (format === 'csv-details') {
        exportBuildDetailsToCSV(build);
      } else if (format === 'json') {
        exportBuildsToJSON([build], `build-${build.id}.json`);
      }
    } else if (builds) {
      // Multiple builds export
      if (format === 'csv') {
        exportBuildsToCSV(builds);
      } else if (format === 'json') {
        exportBuildsToJSON(builds);
      }
    }
    setIsOpen(false);
  };

  if (variant === 'simple') {
    return (
      <Button
        onClick={() => handleExport('csv')}
        variant="success"
        size="lg"
        leftIcon={<Download className="w-5 h-5" />}
        className="shadow-lg hover:shadow-xl"
      >
        Export CSV
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="success"
        size="lg"
        leftIcon={<Download className="w-5 h-5" />}
        className="shadow-lg hover:shadow-xl"
      >
        Export
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-3 w-64 glass-effect rounded-xl shadow-premium border border-gray-200 z-20 overflow-hidden animate-scale-in">
            <div className="py-2">
              {builds && (
                <>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-secondary-50 hover:to-secondary-100 flex items-center gap-3 text-sm transition-all group"
                  >
                    <div className="p-2 bg-secondary-100 rounded-lg group-hover:bg-secondary-200 transition-colors">
                      <FileSpreadsheet className="w-4 h-4 text-secondary-700" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary">Export to CSV</div>
                      <div className="text-xs text-text-secondary">
                        Comparison spreadsheet
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 flex items-center gap-3 text-sm transition-all group"
                  >
                    <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                      <FileText className="w-4 h-4 text-primary-700" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary">Export to JSON</div>
                      <div className="text-xs text-text-secondary">
                        Raw data format
                      </div>
                    </div>
                  </button>
                </>
              )}

              {build && (
                <>
                  <button
                    onClick={() => handleExport('csv-details')}
                    className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-secondary-50 hover:to-secondary-100 flex items-center gap-3 text-sm transition-all group"
                  >
                    <div className="p-2 bg-secondary-100 rounded-lg group-hover:bg-secondary-200 transition-colors">
                      <FileSpreadsheet className="w-4 h-4 text-secondary-700" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary">Full Details CSV</div>
                      <div className="text-xs text-text-secondary">
                        Complete breakdown
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 flex items-center gap-3 text-sm transition-all group"
                  >
                    <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                      <FileText className="w-4 h-4 text-primary-700" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary">Export to JSON</div>
                      <div className="text-xs text-text-secondary">
                        Build configuration
                      </div>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
