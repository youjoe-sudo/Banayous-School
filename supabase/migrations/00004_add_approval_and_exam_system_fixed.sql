-- Add approval status to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS responsible_grades TEXT[];

-- Create parent-student links table
CREATE TABLE IF NOT EXISTS parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  UNIQUE(parent_id, student_id)
);

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  duration_minutes INTEGER DEFAULT 60,
  total_marks INTEGER DEFAULT 100,
  passing_marks INTEGER DEFAULT 50,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exam questions table
CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  options JSONB,
  correct_answer TEXT,
  marks INTEGER DEFAULT 1,
  order_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exam results table
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  answers JSONB,
  score INTEGER,
  total_marks INTEGER,
  percentage DECIMAL(5,2),
  status TEXT CHECK (status IN ('in_progress', 'submitted', 'graded')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  certificate_url TEXT NOT NULL,
  issued_by UUID REFERENCES profiles(id),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Parent-student links policies
CREATE POLICY "Admins can manage parent-student links" ON parent_student_links
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Parents can view their own links" ON parent_student_links
  FOR SELECT TO authenticated USING (parent_id = auth.uid());

-- Exams policies
CREATE POLICY "Teachers can manage their own exams" ON exams
  FOR ALL TO authenticated 
  USING (teacher_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Students can view published exams for their grade" ON exams
  FOR SELECT TO authenticated
  USING (
    is_published = TRUE AND (
      grade = (SELECT grade::TEXT FROM profiles WHERE id = auth.uid()) OR
      is_admin(auth.uid()) OR
      teacher_id = auth.uid()
    )
  );

-- Exam questions policies
CREATE POLICY "Teachers can manage questions for their exams" ON exam_questions
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM exams WHERE id = exam_questions.exam_id AND (teacher_id = auth.uid() OR is_admin(auth.uid())))
  );

CREATE POLICY "Students can view questions for published exams" ON exam_questions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exams 
      WHERE id = exam_questions.exam_id 
      AND is_published = TRUE 
      AND grade = (SELECT grade::TEXT FROM profiles WHERE id = auth.uid())
    )
  );

-- Exam results policies
CREATE POLICY "Teachers can view results for their exams" ON exam_results
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM exams WHERE id = exam_results.exam_id AND (teacher_id = auth.uid() OR is_admin(auth.uid())))
  );

CREATE POLICY "Students can view their own results" ON exam_results
  FOR SELECT TO authenticated
  USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  );

CREATE POLICY "Students can create their own results" ON exam_results
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  );

CREATE POLICY "Students can update their own in-progress results" ON exam_results
  FOR UPDATE TO authenticated
  USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()) AND status = 'in_progress'
  );

CREATE POLICY "Teachers can update results for their exams" ON exam_results
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM exams WHERE id = exam_results.exam_id AND (teacher_id = auth.uid() OR is_admin(auth.uid())))
  );

-- Certificates policies
CREATE POLICY "Teachers and admins can manage certificates" ON certificates
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()) OR issued_by = auth.uid());

CREATE POLICY "Students can view their own certificates" ON certificates
  FOR SELECT TO authenticated
  USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  );

CREATE POLICY "Parents can view their children's certificates" ON certificates
  FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_parent_student_links_parent ON parent_student_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_links_student ON parent_student_links(student_id);
CREATE INDEX IF NOT EXISTS idx_exams_teacher ON exams(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exams_grade ON exams(grade);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam ON exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id);

-- Auto-approve admin accounts
UPDATE profiles SET is_approved = TRUE WHERE role = 'admin' AND is_approved = FALSE;