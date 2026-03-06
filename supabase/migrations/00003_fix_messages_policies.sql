-- Drop existing policies
DROP POLICY IF EXISTS "Users can view messages sent to them" ON messages;
DROP POLICY IF EXISTS "Users can view their own message receipts" ON message_recipients;

-- Recreate messages policy with better logic
CREATE POLICY "Users can view messages sent to them" ON messages
  FOR SELECT TO authenticated
  USING (
    recipient_type = 'all_school' OR
    (recipient_type = 'all_students' AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student'
    )) OR
    (recipient_type = 'individual' AND EXISTS (
      SELECT 1 FROM message_recipients 
      WHERE message_id = messages.id AND recipient_id = auth.uid()
    ))
  );

-- Recreate message recipients policy
CREATE POLICY "Users can view their own message receipts" ON message_recipients
  FOR SELECT TO authenticated
  USING (recipient_id = auth.uid());