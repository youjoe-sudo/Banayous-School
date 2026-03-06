-- Allow admins to update approval status
CREATE POLICY "Admins can update approval status"
ON profiles
FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid())
)
WITH CHECK (
  is_admin(auth.uid())
);

-- Allow users to view their own approval status
CREATE POLICY "Users can view their approval status"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR is_admin(auth.uid())
);