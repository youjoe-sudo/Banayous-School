-- Set default status to 'completed' for exam_results
ALTER TABLE exam_results 
ALTER COLUMN status SET DEFAULT 'completed';