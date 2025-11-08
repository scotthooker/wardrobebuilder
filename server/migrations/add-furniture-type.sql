-- Migration: Add furniture_type column to builds table
-- Created: 2025-11-08
-- Description: Adds furniture_type column to support multiple furniture types (wardrobe, desk, etc.)

-- Add furniture_type column with default 'wardrobe'
ALTER TABLE builds
ADD COLUMN IF NOT EXISTS furniture_type TEXT NOT NULL DEFAULT 'wardrobe';

-- Create index on furniture_type for filtering
CREATE INDEX IF NOT EXISTS idx_builds_furniture_type ON builds(furniture_type);

-- Update existing builds to have furniture_type='wardrobe' (should already be set by default, but being explicit)
UPDATE builds
SET furniture_type = 'wardrobe'
WHERE furniture_type IS NULL OR furniture_type = '';

-- Add comment for documentation
COMMENT ON COLUMN builds.furniture_type IS 'Type of furniture: wardrobe, desk, shelving, etc.';
