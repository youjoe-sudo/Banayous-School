-- Add time_taken_minutes column to exam_results table
ALTER TABLE exam_results 
ADD COLUMN IF NOT EXISTS time_taken_minutes integer;