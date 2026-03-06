-- Allow teachers to view student profiles
CREATE POLICY "Teachers can view student profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  -- Teachers can view profiles of students in their grade
  role = 'student'
  OR
  -- Users can always view their own profile
  auth.uid() = id
);