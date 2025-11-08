/**
 * BuilderPage Component
 * Main page for the furniture builder wizard
 * Handles saving configurations to the database and navigation
 */

import { useNavigate } from 'react-router-dom'
import { FurnitureBuilder, type FurnitureConfiguration } from '../components/builder/FurnitureBuilder'
// @ts-ignore - JavaScript module
import { configurationToBuild } from '../utils/configurationConverter'
// @ts-ignore - JavaScript module
import { useBuildsStore } from '../store/buildsStore'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface BuildData {
  name: string
  character: string
  image: string | null
  costs?: Record<string, unknown>
  hardware?: unknown[]
  extras?: Record<string, unknown>
}

interface SavedBuild {
  id: number
  name: string
  character: string
  image: string | null
  furnitureType: string
  width: number
  height: number
  depth: number
  configuration: FurnitureConfiguration
  costs: Record<string, unknown>
  hardware: unknown[]
  extras: Record<string, unknown>
}

export function BuilderPage() {
  const navigate = useNavigate()
  const { setBuilds } = useBuildsStore()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleComplete = async (configuration: FurnitureConfiguration) => {
    setIsSaving(true)
    setError(null)

    try {
      // Convert configuration to build object
      const furnitureType = configuration.furnitureType || 'wardrobe'
      const defaultName = furnitureType === 'desk' ? 'My Custom Desk' : 'My Custom Wardrobe'
      const buildData: BuildData = configurationToBuild(configuration, defaultName)

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
          furnitureType: configuration.furnitureType || 'wardrobe',
          width: configuration.width || 0,
          height: configuration.height || 0,
          depth: configuration.depth || 0,
          configuration: configuration,
          costs: buildData.costs || {},
          hardware: buildData.hardware || [],
          extras: buildData.extras || {},
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save build')
      }

      const savedBuild: SavedBuild = await response.json()

      // Reload all builds to update the store
      const buildsResponse = await fetch(`${API_URL}/api/builds`)
      if (buildsResponse.ok) {
        const builds: SavedBuild[] = await buildsResponse.json()
        setBuilds(builds)
      }

      // Navigate to the new build's detail page
      navigate(`/build/${savedBuild.id}`)
    } catch (err) {
      console.error('Error saving build:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  if (isSaving) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card variant="elevated" padding="lg">
          <CardContent className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Creating your build...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card variant="elevated" padding="lg" className="max-w-md">
          <CardContent className="text-center">
            <h2 className="text-xl font-bold text-red-900 mb-2">Error Creating Build</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <Button
              variant="primary"
              onClick={() => setError(null)}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <FurnitureBuilder onComplete={handleComplete} onCancel={handleCancel} />
}
