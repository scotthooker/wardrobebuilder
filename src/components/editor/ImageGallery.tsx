import { useState } from 'react';
import { Trash2, Star } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface GalleryImage {
  url: string;
  created_at: string;
  is_primary: boolean;
  prompt?: string;
}

interface ImageGalleryProps {
  buildId: number;
  gallery: GalleryImage[];
  onGalleryUpdate: (updatedGallery: GalleryImage[]) => void;
}

interface ApiResponse {
  gallery: GalleryImage[];
}

export function ImageGallery({ buildId, gallery, onGalleryUpdate }: ImageGalleryProps) {
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [settingPrimary, setSettingPrimary] = useState<string | null>(null);

  const handleSetPrimary = async (imageUrl: string): Promise<void> => {
    setSettingPrimary(imageUrl);
    try {
      const response = await fetch(`${API_URL}/api/builds/${buildId}/gallery/set-primary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to set primary image');
      }

      const data: ApiResponse = await response.json();
      onGalleryUpdate(data.gallery);
    } catch (error) {
      console.error('Error setting primary image:', error);
      alert('Failed to set primary image');
    } finally {
      setSettingPrimary(null);
    }
  };

  const handleDeleteImage = async (imageUrl: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    setDeletingImage(imageUrl);
    try {
      const response = await fetch(`${API_URL}/api/builds/${buildId}/gallery/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      const data: ApiResponse = await response.json();
      onGalleryUpdate(data.gallery);
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    } finally {
      setDeletingImage(null);
    }
  };

  if (!gallery || gallery.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No images in gallery yet.</p>
        <p className="text-sm mt-1">Generate your first image above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h5 className="font-semibold text-gray-900">Image Gallery ({gallery.length})</h5>

      <div className="grid grid-cols-2 gap-3">
        {gallery.map((image, index) => (
          <div
            key={index}
            className={`relative group border-2 rounded-lg overflow-hidden ${
              image.is_primary ? 'border-green-500' : 'border-gray-200'
            }`}
          >
            {/* Image */}
            <img
              src={`${API_URL}${image.url}`}
              alt={`Gallery image ${index + 1}`}
              className="w-full h-48 object-cover"
            />

            {/* Primary Badge */}
            {image.is_primary && (
              <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Primary
              </div>
            )}

            {/* Actions Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              {!image.is_primary && (
                <button
                  onClick={() => handleSetPrimary(image.url)}
                  disabled={settingPrimary === image.url}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-1 disabled:opacity-50"
                  title="Set as primary"
                >
                  <Star className="w-4 h-4" />
                  {settingPrimary === image.url ? 'Setting...' : 'Set Primary'}
                </button>
              )}

              {gallery.length > 1 && (
                <button
                  onClick={() => handleDeleteImage(image.url)}
                  disabled={deletingImage === image.url}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-1 disabled:opacity-50"
                  title="Delete image"
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingImage === image.url ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>

            {/* Timestamp */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {new Date(image.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
