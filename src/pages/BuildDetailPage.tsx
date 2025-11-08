import { useParams, Link } from 'react-router-dom';
import { useBuild } from '../hooks/useBuilds';
import { useBuildsStore } from '../store/buildsStore';
import { ExportButton } from '../components/shared/ExportButton';
import { formatCurrency, getSavingsColor } from '../utils/formatters';
import { ArrowLeft, Edit, Image as ImageIcon } from 'lucide-react';
import { BuildImageCarousel } from '../components/BuildImageCarousel';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import type { Build } from '../components/builds/BuildCard';
import type { GalleryItem } from '../components/BuildImageCarousel';

interface MaterialRow {
  component: string;
  material: string;
  thickness: string;
  sheets: number;
  pricePerSheet: number;
  subtotal: number;
}

interface DoorDrawerRow {
  desc: string;
  size: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface HardwareRow {
  desc?: string;
  name?: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface ExtraRow {
  item?: string;
  name?: string;
  desc?: string;
  qty?: number;
  estimate?: number;
  total?: number;
  unitPrice?: number;
}

export function BuildDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { build, isLoading }: { build: Build | undefined; isLoading: boolean } = useBuild(id);
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
  const gallery: GalleryItem[] = (build.image_gallery || []) as GalleryItem[];
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
          <Button
            onClick={() => startEditing(build.id)}
            variant="primary"
            size="lg"
            leftIcon={<Edit className="w-5 h-5" />}
          >
            Edit Build
          </Button>
          {/* @ts-ignore - ExportButton expects either builds or build */}
          <ExportButton build={build} />
        </div>
      </div>

      {/* Image Gallery Section */}
      {hasImages && (
        <Card variant="elevated" padding="none">
          <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200">
            <BuildImageCarousel
              gallery={gallery}
              className="w-full h-full"
            />
            {gallery.length > 1 && (
              <Badge
                variant="default"
                size="sm"
                icon={<ImageIcon className="w-4 h-4" />}
                className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white border-0"
              >
                {gallery.length} Images in Gallery
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* Build Header */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-3xl">{build.name}</CardTitle>
          <p className="text-gray-600 text-lg">{build.character}</p>
        </CardHeader>

        <CardContent>
          {/* Cost Summary */}
          <Card variant="premium" className="mt-4">
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
                  <span className="text-lg ml-1 font-medium">
                    {build.costs.savingsVsBudget >= 0 ? 'under' : 'over'}
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Materials */}
          <div>
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
                  {build.costs.materials?.map((mat: MaterialRow, idx: number) => (
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
                    <td colSpan={5} className="p-3 text-sm font-bold text-right">Materials Total:</td>
                    <td className="p-3 text-sm font-bold text-right">{formatCurrency(build.costs.materialTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Professional Doors/Drawers - Only for wardrobes */}
          {(build.costs.professionalDoorsDrawersTotal ?? 0) > 0 && (
            <div>
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
                    {(Object.values(build.costs.professionalDoorsDrawers || {}) as unknown as DoorDrawerRow[]).map((door: DoorDrawerRow, idx: number) => (
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
                      <td colSpan={4} className="p-3 text-sm font-bold text-right">Doors/Drawers Total:</td>
                      <td className="p-3 text-sm font-bold text-right">
                        {formatCurrency(build.costs.professionalDoorsDrawersTotal ?? 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Hardware */}
          {build.costs.hardwareTotal > 0 && (
            <div>
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
                    {((Array.isArray(build.costs.hardware)
                      ? build.costs.hardware
                      : Object.values(build.costs.hardware || {})
                    ) as HardwareRow[]).map((hw: HardwareRow, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 text-sm">{hw.desc || hw.name}</td>
                        <td className="p-3 text-sm text-right">{hw.qty}</td>
                        <td className="p-3 text-sm text-right">{formatCurrency(hw.unitPrice)}</td>
                        <td className="p-3 text-sm text-right font-semibold">{formatCurrency(hw.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="p-3 text-sm font-bold text-right">Hardware Total:</td>
                      <td className="p-3 text-sm font-bold text-right">{formatCurrency(build.costs.hardwareTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Extras / Accessories */}
          {(build.costs.extrasTotal ?? 0) > 0 && build.costs.extras && build.costs.extras.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {build.furnitureType === 'desk' ? 'Accessories' : 'Finishing & Extras'}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold">Item</th>
                      {build.furnitureType !== 'desk' && (
                        <th className="text-left p-3 text-sm font-semibold">Description</th>
                      )}
                      <th className="text-right p-3 text-sm font-semibold">Qty</th>
                      <th className="text-right p-3 text-sm font-semibold">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {build.costs.extras.map((extra: ExtraRow, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 text-sm">{extra.item || extra.name}</td>
                        {build.furnitureType !== 'desk' && (
                          <td className="p-3 text-sm">{extra.desc || ''}</td>
                        )}
                        <td className="p-3 text-sm text-right">{extra.qty || 1}</td>
                        <td className="p-3 text-sm text-right font-semibold">
                          {formatCurrency(extra.estimate || extra.total || extra.unitPrice || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={build.furnitureType === 'desk' ? 2 : 3} className="p-3 text-sm font-bold text-right">
                        {build.furnitureType === 'desk' ? 'Accessories' : 'Extras'} Total:
                      </td>
                      <td className="p-3 text-sm font-bold text-right">{formatCurrency(build.costs.extrasTotal ?? 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Grand Total */}
          <Card variant="premium" className="border-2 border-primary-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-primary-900">GRAND TOTAL:</span>
              <span className="text-2xl font-bold text-primary-900">{formatCurrency(build.costs.grandTotal)}</span>
            </div>
          </Card>
        </CardContent>
      </Card>

      {/* Build Information */}
      {build.specialTools && build.specialTools.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-xl">Special Tools Required</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {build.specialTools.map((tool: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span className="text-sm">{tool}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Considerations */}
      {build.considerations && build.considerations.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-xl">Key Considerations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-3">
              {build.considerations.map((consideration: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <Badge variant="blue" size="sm" className="mt-0.5">ℹ️</Badge>
                  <span className="text-sm">{consideration}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommended For */}
      {build.recommendedFor && (
        <Card variant="elevated" className="border-2 border-green-200 bg-green-50">
          <CardContent>
            <p className="text-sm">
              <Badge variant="success" size="md" className="mr-2">Recommended for</Badge>
              <span className="text-green-800">{build.recommendedFor}</span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
