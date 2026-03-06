-- Drop all policies that depend on grade column
DROP POLICY IF EXISTS "Students can view published exams for their grade" ON exams;
DROP POLICY IF EXISTS "Teachers can view exams for their grades" ON exams;
DROP POLICY IF EXISTS "Students can view schedules for their grade" ON schedules;
DROP POLICY IF EXISTS "Teachers can view schedules for their grades" ON schedules;