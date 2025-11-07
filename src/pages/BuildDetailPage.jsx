import { useParams, Link } from 'react-router-dom';
import { useBuild } from '../hooks/useBuilds';
import { useBuildsStore } from '../store/buildsStore';
import { ExportButton } from '../components/shared/ExportButton';
import { formatCurrency, getSavingsColor } from '../utils/formatters';
import { ArrowLeft, Edit, Image as ImageIcon } from 'lucide-react';
import { BuildImageCarousel } from '../components/BuildImageCarousel';

export function BuildDetailPage() {
  const { id } = useParams();
  const { build, isLoading } = useBuild(id);
  const { startEditing } = useBuildsStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Loading build details...</p>
      </div>
    );
  }

  if (!build) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Build Not Found</h2>
          <Link to="/" className="text-primary-600 hover:underline">
            ← Back to all builds
          </Link>
        </div>
      </div>
    );
  }

  const savingsColor = getSavingsColor(build.costs.savingsVsBudget);

  // Get the gallery for this build
  const gallery = build.image_gallery || [];
  const hasImages = gallery.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all builds
        </Link>
        <div className="flex gap-3">
          <button
            onClick={() => startEditing(build.id)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold border-2 border-primary-700"
          >
            <Edit className="w-5 h-5" />
            Edit Build
          </button>
          <ExportButton build={build} />
        </div>
      </div>

      {/* Image Gallery Section */}
      {hasImages && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200">
            <BuildImageCarousel
              gallery={gallery}
              className="w-full h-full"
            />
            {gallery.length > 1 && (
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {gallery.length} Images in Gallery
              </div>
            )}
          </div>
        </div>
      )}

      {/* Build Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          {/* Title and Description */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {build.name}
            </h1>
            <p className="text-gray-600 text-lg">{build.character}</p>
          </div>


          {/* Cost Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-lg p-5 border border-gray-200">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Cost</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatCurrency(build.costs.grandTotal)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">vs £5,000 Budget</p>
                <p className={`text-3xl font-bold mt-1 ${savingsColor}`}>
                  {formatCurrency(Math.abs(build.costs.savingsVsBudget))}
                  <span className="text-lg ml-1 font-medium">{build.costs.savingsVsBudget >= 0 ? 'under' : 'over'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-4">Cost Breakdown</h2>

        {/* Materials */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Sheet Materials</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold">Component</th>
                  <th className="text-left p-3 text-sm font-semibold">Material</th>
                  <th className="text-left p-3 text-sm font-semibold">Thickness</th>
                  <th className="text-right p-3 text-sm font-semibold">Sheets</th>
                  <th className="text-right p-3 text-sm font-semibold">Price/Sheet</th>
                  <th className="text-right p-3 text-sm font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {build.costs.materials.map((mat, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 text-sm">{mat.component}</td>
                    <td className="p-3 text-sm">{mat.material}</td>
                    <td className="p-3 text-sm">{mat.thickness}</td>
                    <td className="p-3 text-sm text-right">{mat.sheets}</td>
                    <td className="p-3 text-sm text-right">{formatCurrency(mat.pricePerSheet)}</td>
                    <td className="p-3 text-sm text-right font-semibold">{formatCurrency(mat.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="5" className="p-3 text-sm font-bold text-right">Materials Total:</td>
                  <td className="p-3 text-sm font-bold text-right">{formatCurrency(build.costs.materialTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Professional Doors/Drawers */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Professional Doors & Drawer Fronts</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold">Item</th>
                  <th className="text-left p-3 text-sm font-semibold">Size</th>
                  <th className="text-right p-3 text-sm font-semibold">Qty</th>
                  <th className="text-right p-3 text-sm font-semibold">Unit Price</th>
                  <th className="text-right p-3 text-sm font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Object.values(build.costs.professionalDoorsDrawers).map((door, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 text-sm">{door.desc}</td>
                    <td className="p-3 text-sm">{door.size}</td>
                    <td className="p-3 text-sm text-right">{door.qty}</td>
                    <td className="p-3 text-sm text-right">{formatCurrency(door.unitPrice)}</td>
                    <td className="p-3 text-sm text-right font-semibold">{formatCurrency(door.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="4" className="p-3 text-sm font-bold text-right">Doors/Drawers Total:</td>
                  <td className="p-3 text-sm font-bold text-right">{formatCurrency(build.costs.professionalDoorsDrawersTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Hardware */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Hardware & Fixings</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold">Item</th>
                  <th className="text-right p-3 text-sm font-semibold">Qty</th>
                  <th className="text-right p-3 text-sm font-semibold">Unit Price</th>
                  <th className="text-right p-3 text-sm font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Object.values(build.costs.hardware).map((hw, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 text-sm">{hw.desc}</td>
                    <td className="p-3 text-sm text-right">{hw.qty}</td>
                    <td className="p-3 text-sm text-right">{formatCurrency(hw.unitPrice)}</td>
                    <td className="p-3 text-sm text-right font-semibold">{formatCurrency(hw.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="p-3 text-sm font-bold text-right">Hardware Total:</td>
                  <td className="p-3 text-sm font-bold text-right">{formatCurrency(build.costs.hardwareTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Extras */}
        {build.costs.extras.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Finishing & Extras</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold">Item</th>
                    <th className="text-left p-3 text-sm font-semibold">Description</th>
                    <th className="text-right p-3 text-sm font-semibold">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {build.costs.extras.map((extra, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3 text-sm">{extra.item}</td>
                      <td className="p-3 text-sm">{extra.desc}</td>
                      <td className="p-3 text-sm text-right font-semibold">{formatCurrency(extra.estimate)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="2" className="p-3 text-sm font-bold text-right">Extras Total:</td>
                    <td className="p-3 text-sm font-bold text-right">{formatCurrency(build.costs.extrasTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Grand Total */}
        <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-primary-900">GRAND TOTAL:</span>
            <span className="text-2xl font-bold text-primary-900">{formatCurrency(build.costs.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Build Information */}
      {build.specialTools && build.specialTools.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Special Tools Required</h2>
          <ul className="space-y-2">
            {build.specialTools.map((tool, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span className="text-sm">{tool}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Considerations */}
      {build.considerations && build.considerations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Key Considerations</h2>
          <ul className="grid md:grid-cols-2 gap-3">
            {build.considerations.map((consideration, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">ℹ️</span>
                <span className="text-sm">{consideration}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended For */}
      {build.recommendedFor && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm">
            <span className="font-semibold text-green-900">Recommended for:</span>{' '}
            <span className="text-green-800">{build.recommendedFor}</span>
          </p>
        </div>
      )}
    </div>
  );
}
