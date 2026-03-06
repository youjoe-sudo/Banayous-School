-- Add student_name field for parents to specify their child's name
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS student_name TEXT;

-- Add status field for better tracking (pending, approved, rejected)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
    CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'pending';

-- Update existing records to be approved (backward compatibility)
UPDATE profiles 
SET approval_status = 'approved' 
WHERE approval_status IS NULL OR (is_approved = true AND approval_status = 'pending');

-- Set default for is_approved based on role
-- Parents and teachers need approval, students and admins are auto-approved
CREATE OR REPLACE FUNCTION set_approval_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-approve students and admins
  IF NEW.role IN ('student', 'admin') THEN
    NEW.is_approved := true;
    NEW.approval_status := 'approved';
  -- Parents and teachers need approval
  ELSIF NEW.role IN ('parent', 'teacher') THEN
    NEW.is_approved := false;
    NEW.approval_status := 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_approval_defaults_trigger ON profiles;
CREATE TRIGGER set_approval_defaults_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_approval_defaults();