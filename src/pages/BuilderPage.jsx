import { useNavigate } from 'react-router-dom';
import { WardrobeBuilder } from '../components/builder/WardrobeBuilder';
import { configurationToBuild } from '../utils/configurationConverter';
import { useBuildsStore } from '../store/buildsStore';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function BuilderPage() {
  const navigate = useNavigate();
  const { setBuilds } = useBuildsStore();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleComplete = async (configuration) => {
    setIsSaving(true);
    setError(null);

    try {
      // Convert configuration to build object
      const buildData = configurationToBuild(configuration, 'My Custom Wardrobe');

      // Save to database
      const response = await fetch(`${API_URL}/api/builds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: buildData.name,
          character: buildData.character,
          image: buildData.image || null,
          costs_json: JSON.stringify(buildData.costs),
          materials_json: buildData.costs.materials ? JSON.stringify(buildData.costs.materials) : null,
          extras_json: buildData.costs.extras ? JSON.stringify(buildData.costs.extras) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save build');
      }

      const savedBuild = await response.json();

      // Reload all builds to update the store
      const buildsResponse = await fetch(`${API_URL}/api/builds`);
      if (buildsResponse.ok) {
        const builds = await buildsResponse.json();
        setBuilds(builds);
      }

      // Navigate to the new build's detail page
      navigate(`/build/${savedBuild.id}`);
    } catch (err) {
      console.error('Error saving build:', err);
      setError(err.message);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (isSaving) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Creating your wardrobe build...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-900 mb-2">Error Creating Build</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <WardrobeBuilder onComplete={handleComplete} onCancel={handleCancel} />;
}
