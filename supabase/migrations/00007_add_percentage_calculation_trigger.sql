-- Create function to calculate percentage
CREATE OR REPLACE FUNCTION calculate_exam_percentage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_marks > 0 THEN
    NEW.percentage := (NEW.score::numeric / NEW.total_marks::numeric) * 100;
  ELSE
    NEW.percentage := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate percentage
DROP TRIGGER IF EXISTS exam_results_percentage_trigger ON exam_results;
CREATE TRIGGER exam_results_percentage_trigger
  BEFORE INSERT OR UPDATE OF score, total_marks
  ON exam_results
  FOR EACH ROW
  EXECUTE FUNCTION calculate_exam_percentage();