-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('individual', 'all_students', 'all_school')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_important BOOLEAN DEFAULT FALSE
);

-- Create message recipients table (for individual messages)
CREATE TABLE IF NOT EXISTS message_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, recipient_id)
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Admins can create messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can view all messages" ON messages
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()) OR sender_id = auth.uid());

CREATE POLICY "Users can view messages sent to them" ON messages
  FOR SELECT TO authenticated
  USING (
    recipient_type = 'all_school' OR
    (recipient_type = 'all_students' AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student'
    )) OR
    EXISTS (
      SELECT 1 FROM message_recipients 
      WHERE message_id = messages.id AND recipient_id = auth.uid()
    )
  );

-- Message recipients policies
CREATE POLICY "Admins can manage recipients" ON message_recipients
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own message receipts" ON message_recipients
  FOR SELECT TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own read status" ON message_recipients
  FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_message_recipients_recipient ON message_recipients(recipient_id);
CREATE INDEX idx_message_recipients_message ON message_recipients(message_id);
CREATE INDEX idx_message_recipients_read ON message_recipients(is_read);