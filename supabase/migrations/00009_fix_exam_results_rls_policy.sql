-- Drop the old policy that checks students table
DROP POLICY IF EXISTS "Students can create their own results" ON exam_results;

-- Create new policy that allows students to insert results using their profile_id
CREATE POLICY "Students can create their own results"
ON exam_results
FOR INSERT
TO authenticated
WITH CHECK (
  student_id = auth.uid() 
  OR 
  student_id IN (
    SELECT id FROM students WHERE profile_id = auth.uid()
  )
);

-- Also update the SELECT policy to allow students to view results by profile_id
DROP POLICY IF EXISTS "Students can view their own results" ON exam_results;

CREATE POLICY "Students can view their own results"
ON exam_results
FOR SELECT
TO authenticated
USING (
  student_id = auth.uid()
  OR
  student_id IN (
    SELECT id FROM students WHERE profile_id = auth.uid()
  )
);

-- Update the UPDATE policy as well
DROP POLICY IF EXISTS "Students can update their own in-progress results" ON exam_results;

CREATE POLICY "Students can update their own in-progress results"
ON exam_results
FOR UPDATE
TO authenticated
USING (
  (student_id = auth.uid() OR student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()))
  AND status = 'in_progress'
);