import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuildsStore } from '../store/buildsStore';
import { formatCurrency } from '../utils/formatters';
import { FileDown, Printer, X, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export function ComparePage() {
  const navigate = useNavigate();
  const { getSelectedBuilds, clearSelection } = useBuildsStore();
  const selectedBuilds = getSelectedBuilds();

  useEffect(() => {
    // Redirect if no builds selected
    if (selectedBuilds.length === 0) {
      navigate('/');
    }
  }, [selectedBuilds.length, navigate]);

  if (selectedBuilds.length === 0) {
    return null;
  }

  // Calculate comparison metrics
  const getInteriorTypeCount = (build, type) => {
    let count = 0;
    build.configuration?.sections?.forEach(section => {
      section.carcasses?.forEach(carcass => {
        carcass.interiorSections?.forEach(interior => {
          if (interior.type === type || (type === 'rail' && interior.type === 'double_rail')) {
            count++;
          }
        });
      });
    });
    return count;
  };

  const getTotalDrawers = (build) => {
    let count = 0;
    build.configuration?.sections?.forEach(section => {
      section.carcasses?.forEach(carcass => {
        carcass.interiorSections?.forEach(interior => {
          if (interior.type === 'drawers') {
            count += interior.drawers || 0;
          }
        });
      });
    });
    return count;
  };

  const getTotalShelves = (build) => {
    let count = 0;
    build.configuration?.sections?.forEach(section => {
      section.carcasses?.forEach(carcass => {
        carcass.interiorSections?.forEach(interior => {
          if (interior.type === 'shelves') {
            count += interior.shelfCount || 0;
          }
        });
      });
    });
    return count;
  };

  const exportToCSV = () => {
    const rows = [];

    // Header
    rows.push(['Comparison', ...selectedBuilds.map(b => b.name)]);
    rows.push(['']); // Empty row

    // Overview
    rows.push(['OVERVIEW', ...Array(selectedBuilds.length).fill('')]);
    rows.push(['Cost', ...selectedBuilds.map(b => formatCurrency(b.costs.grandTotal))]);
    rows.push(['Savings vs Budget', ...selectedBuilds.map(b => formatCurrency(b.costs.savingsVsBudget))]);
    rows.push(['']); // Empty row

    // Dimensions
    rows.push(['DIMENSIONS', ...Array(selectedBuilds.length).fill('')]);
    rows.push(['Width (mm)', ...selectedBuilds.map(b => b.width)]);
    rows.push(['Height (mm)', ...selectedBuilds.map(b => b.height)]);
    rows.push(['Depth (mm)', ...selectedBuilds.map(b => b.depth)]);
    rows.push(['']); // Empty row

    // Configuration
    rows.push(['CONFIGURATION', ...Array(selectedBuilds.length).fill('')]);
    rows.push(['Sections', ...selectedBuilds.map(b => b.configuration?.sections?.length || 0)]);
    rows.push(['Carcasses', ...selectedBuilds.map(b => {
      return b.configuration?.sections?.reduce((sum, s) => sum + (s.carcasses?.length || 0), 0) || 0;
    })]);
    rows.push(['Door Style', ...selectedBuilds.map(b => b.configuration?.doors?.style || 'N/A')]);
    rows.push(['Hanging Rails', ...selectedBuilds.map(b => getInteriorTypeCount(b, 'rail'))]);
    rows.push(['Drawers', ...selectedBuilds.map(b => getTotalDrawers(b))]);
    rows.push(['Shelves', ...selectedBuilds.map(b => getTotalShelves(b))]);

    // Convert to CSV
    const csvContent = rows.map(row =>
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wardrobe-comparison-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearAndReturn = () => {
    clearSelection();
    navigate('/');
  };

  return (
    <div className="min-h-screen py-8 animate-fade-in-up">
      {/* Header */}
      <div className="glass-effect rounded-2xl shadow-premium p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="btn-premium p-2 rounded-lg hover:bg-primary-50 text-gray-700 hover:text-primary-600 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Compare Builds
              </h1>
              <p className="text-gray-600 mt-1">
                Side-by-side comparison of {selectedBuilds.length} selected {selectedBuilds.length === 1 ? 'build' : 'builds'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="btn-premium px-4 py-2.5 bg-gray-100 border-2 border-gray-300 rounded-xl hover:border-primary-400 hover:bg-primary-100 transition-all flex items-center gap-2 font-medium text-gray-800"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn-premium px-4 py-2.5 bg-gray-100 border-2 border-gray-300 rounded-xl hover:border-primary-400 hover:bg-primary-100 transition-all flex items-center gap-2 font-medium text-gray-800"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleClearAndReturn}
              className="btn-premium px-4 py-2.5 bg-gray-100 border-2 border-gray-300 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all flex items-center gap-2 font-medium text-gray-800 hover:text-red-700"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Clear & Return</span>
            </button>
          </div>
        </div>

        {/* Visual Comparison - Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {selectedBuilds.map(build => (
            <div key={build.id} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300">
                {build.image ? (
                  <img
                    src={`/generated_images/${build.image}`}
                    alt={build.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="mt-2 text-center">
                <h3 className="font-bold text-gray-900">{build.name}</h3>
                <p className="text-sm text-gray-600">{formatCurrency(build.costs.grandTotal)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="glass-effect rounded-2xl shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-primary-50 to-primary-100 border-b-2 border-primary-200">
              <tr>
                <th className="text-left p-4 font-bold text-primary-900 sticky left-0 bg-gradient-to-r from-primary-50 to-primary-100 z-10">
                  Category
                </th>
                {selectedBuilds.map(build => (
                  <th key={build.id} className="text-center p-4 font-bold text-primary-900 min-w-[200px]">
                    {build.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* QUICK OVERVIEW */}
              <tr className="bg-gray-50">
                <td colSpan={selectedBuilds.length + 1} className="p-3 font-bold text-gray-900 text-sm uppercase tracking-wide">
                  Quick Overview
                </td>
              </tr>

              <ComparisonRow
                label="Character"
                values={selectedBuilds.map(b => b.character)}
              />

              <ComparisonRow
                label="Recommended For"
                values={selectedBuilds.map(b => b.recommendedFor || 'N/A')}
              />

              {/* COST ANALYSIS */}
              <tr className="bg-gray-50">
                <td colSpan={selectedBuilds.length + 1} className="p-3 font-bold text-gray-900 text-sm uppercase tracking-wide">
                  Cost Analysis
                </td>
              </tr>

              <ComparisonRow
                label="Total Cost"
                values={selectedBuilds.map(b => formatCurrency(b.costs.grandTotal))}
                renderCell={(value, build) => (
                  <span className="text-lg font-bold text-gray-900">{value}</span>
                )}
                highlight="lowest"
                selectedBuilds={selectedBuilds}
                valueGetter={(b) => b.costs.grandTotal}
              />

              <ComparisonRow
                label="vs £5,000 Budget"
                values={selectedBuilds.map(b => formatCurrency(Math.abs(b.costs.savingsVsBudget)))}
                renderCell={(value, build) => (
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-lg font-bold ${
                      build.costs.savingsVsBudget >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {value}
                    </span>
                    <span className="text-xs text-gray-600">
                      {build.costs.savingsVsBudget >= 0 ? 'under budget' : 'over budget'}
                    </span>
                  </div>
                )}
                highlight="highest"
                selectedBuilds={selectedBuilds}
                valueGetter={(b) => b.costs.savingsVsBudget}
              />

              <ComparisonRow
                label="Materials"
                values={selectedBuilds.map(b => formatCurrency(b.costs.materialTotal))}
              />

              <ComparisonRow
                label="Doors & Drawers"
                values={selectedBuilds.map(b => formatCurrency(b.costs.professionalDoorsDrawersTotal))}
              />

              <ComparisonRow
                label="Hardware"
                values={selectedBuilds.map(b => formatCurrency(b.costs.hardwareTotal))}
              />

              <ComparisonRow
                label="Extras"
                values={selectedBuilds.map(b => formatCurrency(b.costs.extrasTotal))}
              />

              {/* DIMENSIONS */}
              <tr className="bg-gray-50">
                <td colSpan={selectedBuilds.length + 1} className="p-3 font-bold text-gray-900 text-sm uppercase tracking-wide">
                  Physical Dimensions
                </td>
              </tr>

              <ComparisonRow
                label="Width"
                values={selectedBuilds.map(b => `${b.width}mm`)}
                renderCell={(value, build) => (
                  <span className="font-mono">{value}</span>
                )}
              />

              <ComparisonRow
                label="Height"
                values={selectedBuilds.map(b => `${b.height}mm`)}
                renderCell={(value, build) => (
                  <span className="font-mono">{value}</span>
                )}
              />

              <ComparisonRow
                label="Depth"
                values={selectedBuilds.map(b => `${b.depth}mm`)}
                renderCell={(value, build) => (
                  <span className="font-mono">{value}</span>
                )}
              />

              <ComparisonRow
                label="Total Volume"
                values={selectedBuilds.map(b => {
                  const volumeM3 = (b.width * b.height * b.depth) / 1000000000;
                  return `${volumeM3.toFixed(2)} m³`;
                })}
              />

              {/* CONFIGURATION */}
              <tr className="bg-gray-50">
                <td colSpan={selectedBuilds.length + 1} className="p-3 font-bold text-gray-900 text-sm uppercase tracking-wide">
                  Build Configuration
                </td>
              </tr>

              <ComparisonRow
                label="Sections"
                values={selectedBuilds.map(b => b.configuration?.sections?.length || 0)}
              />

              <ComparisonRow
                label="Total Carcasses"
                values={selectedBuilds.map(b => {
                  return b.configuration?.sections?.reduce((sum, s) => sum + (s.carcasses?.length || 0), 0) || 0;
                })}
              />

              <ComparisonRow
                label="Door Style"
                values={selectedBuilds.map(b => {
                  const style = b.configuration?.doors?.style || 'none';
                  return style.charAt(0).toUpperCase() + style.slice(1);
                })}
                renderCell={(value) => (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
                    {value}
                  </span>
                )}
              />

              {/* INTERIOR ORGANIZATION */}
              <tr className="bg-gray-50">
                <td colSpan={selectedBuilds.length + 1} className="p-3 font-bold text-gray-900 text-sm uppercase tracking-wide">
                  Interior Organization
                </td>
              </tr>

              <ComparisonRow
                label="Hanging Rails"
                values={selectedBuilds.map(b => getInteriorTypeCount(b, 'rail'))}
                highlight="highest"
                selectedBuilds={selectedBuilds}
                valueGetter={(b) => getInteriorTypeCount(b, 'rail')}
              />

              <ComparisonRow
                label="Total Drawers"
                values={selectedBuilds.map(b => getTotalDrawers(b))}
                highlight="highest"
                selectedBuilds={selectedBuilds}
                valueGetter={(b) => getTotalDrawers(b)}
              />

              <ComparisonRow
                label="Total Shelves"
                values={selectedBuilds.map(b => getTotalShelves(b))}
                highlight="highest"
                selectedBuilds={selectedBuilds}
                valueGetter={(b) => getTotalShelves(b)}
              />

              {/* SPECIAL CONSIDERATIONS */}
              <tr className="bg-gray-50">
                <td colSpan={selectedBuilds.length + 1} className="p-3 font-bold text-gray-900 text-sm uppercase tracking-wide">
                  Special Considerations
                </td>
              </tr>

              <ComparisonRow
                label="Key Considerations"
                values={selectedBuilds.map(b => b.considerations?.slice(0, 3).join('; ') || 'None')}
                renderCell={(value) => (
                  <div className="text-sm text-gray-700 text-left">{value}</div>
                )}
              />

              <ComparisonRow
                label="Special Tools"
                values={selectedBuilds.map(b =>
                  b.specialTools?.length > 0 ? `${b.specialTools.length} required` : 'Basic tools only'
                )}
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendation Panel */}
      <div className="glass-effect rounded-2xl shadow-premium p-6 mt-8 print:hidden">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary-600" />
          Professional Recommendations
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Best Value */}
          {(() => {
            const bestValue = selectedBuilds.reduce((best, build) =>
              build.costs.savingsVsBudget > best.costs.savingsVsBudget ? build : best
            );
            return (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">£</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 mb-1">Best Value</h3>
                    <p className="text-sm text-green-800">
                      <strong>{bestValue.name}</strong> offers the most savings at {formatCurrency(bestValue.costs.savingsVsBudget)} under budget.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Most Storage */}
          {(() => {
            const mostStorage = selectedBuilds.reduce((best, build) => {
              const storage = getTotalDrawers(build) + getTotalShelves(build) + getInteriorTypeCount(build, 'rail');
              const bestStorage = getTotalDrawers(best) + getTotalShelves(best) + getInteriorTypeCount(best, 'rail');
              return storage > bestStorage ? build : best;
            });
            return (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">📦</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-1">Most Storage</h3>
                    <p className="text-sm text-blue-800">
                      <strong>{mostStorage.name}</strong> maximizes organization with {getTotalDrawers(mostStorage)} drawers, {getTotalShelves(mostStorage)} shelves, and {getInteriorTypeCount(mostStorage, 'rail')} rails.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Premium Choice */}
          {(() => {
            const premiumChoice = selectedBuilds.reduce((best, build) =>
              build.costs.grandTotal > best.costs.grandTotal ? build : best
            );
            return (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">⭐</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-purple-900 mb-1">Premium Choice</h3>
                    <p className="text-sm text-purple-800">
                      <strong>{premiumChoice.name}</strong> represents the highest quality with premium materials and craftsmanship.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// Reusable comparison row component
function ComparisonRow({ label, values, renderCell, highlight, selectedBuilds, valueGetter }) {
  // Determine which cells to highlight
  let highlightedIndices = [];
  if (highlight && selectedBuilds && valueGetter) {
    const numericValues = selectedBuilds.map(valueGetter);
    if (highlight === 'lowest') {
      const minValue = Math.min(...numericValues);
      highlightedIndices = numericValues.map((v, i) => v === minValue ? i : -1).filter(i => i !== -1);
    } else if (highlight === 'highest') {
      const maxValue = Math.max(...numericValues);
      highlightedIndices = numericValues.map((v, i) => v === maxValue ? i : -1).filter(i => i !== -1);
    }
  }

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10 border-r border-gray-200">
        {label}
      </td>
      {values.map((value, index) => {
        const isHighlighted = highlightedIndices.includes(index);
        const build = selectedBuilds?.[index];

        return (
          <td
            key={index}
            className={`p-4 text-center ${
              isHighlighted ? 'bg-primary-50 font-semibold' : ''
            }`}
          >
            <div className="flex items-center justify-center">
              {renderCell ? renderCell(value, build) : value}
              {isHighlighted && (
                <CheckCircle className="w-4 h-4 text-primary-600 ml-2" />
              )}
            </div>
          </td>
        );
      })}
    </tr>
  );
}
