-- Create function to set submitted_at timestamp
CREATE OR REPLACE FUNCTION set_submitted_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.submitted_at IS NULL THEN
    NEW.submitted_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set submitted_at
DROP TRIGGER IF EXISTS exam_results_submitted_at_trigger ON exam_results;
CREATE TRIGGER exam_results_submitted_at_trigger
  BEFORE INSERT
  ON exam_results
  FOR EACH ROW
  EXECUTE FUNCTION set_submitted_at();