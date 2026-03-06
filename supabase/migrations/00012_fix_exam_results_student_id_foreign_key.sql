-- Drop the old foreign key constraint that references students table
ALTER TABLE exam_results 
DROP CONSTRAINT IF EXISTS exam_results_student_id_fkey;

-- Add new foreign key constraint that references profiles table
ALTER TABLE exam_results 
ADD CONSTRAINT exam_results_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;