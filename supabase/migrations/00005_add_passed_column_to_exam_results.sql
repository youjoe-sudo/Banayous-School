-- Add passed column to exam_results table
ALTER TABLE exam_results 
ADD COLUMN IF NOT EXISTS passed boolean;

-- Update existing records to set passed based on percentage
UPDATE exam_results 
SET passed = (percentage >= 50)
WHERE passed IS NULL;