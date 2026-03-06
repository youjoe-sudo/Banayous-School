-- Recreate policies with new grade format and proper type casting

-- Exams policies
CREATE POLICY "Students can view published exams for their grade"
ON exams
FOR SELECT
TO authenticated
USING (
  is_published = true 
  AND grade::text = (SELECT grade::text FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Teachers can view exams for their grades"
ON exams
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'teacher'
    AND (
      grade::text = exams.grade::text 
      OR exams.grade = ANY(responsible_grades)
    )
  )
);

-- Schedules policies
CREATE POLICY "Students can view schedules for their grade"
ON schedules
FOR SELECT
TO authenticated
USING (
  grade::text = (SELECT grade::text FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Teachers can view schedules for their grades"
ON schedules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'teacher'
    AND (
      grade::text = schedules.grade::text 
      OR schedules.grade = ANY(responsible_grades)
    )
  )
);

-- Exam questions policy
CREATE POLICY "Students can view questions for published exams"
ON exam_questions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exams 
    WHERE exams.id = exam_questions.exam_id 
    AND exams.is_published = true 
    AND exams.grade::text = (SELECT grade::text FROM profiles WHERE id = auth.uid())
  )
);