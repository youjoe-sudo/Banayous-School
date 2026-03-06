-- Change default status to 'submitted' instead of 'completed'
ALTER TABLE exam_results 
ALTER COLUMN status SET DEFAULT 'submitted';