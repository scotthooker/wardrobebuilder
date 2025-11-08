-- Add budget column to builds table
-- This allows each build to have its own budget for cost comparison

ALTER TABLE builds
ADD COLUMN IF NOT EXISTS budget NUMERIC(10, 2) DEFAULT 5000.00;

-- Add index for budget queries
CREATE INDEX IF NOT EXISTS idx_builds_budget ON builds(budget);

-- Add comment
COMMENT ON COLUMN builds.budget IS 'Target budget for this build in GBP';
