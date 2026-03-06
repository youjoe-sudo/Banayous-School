-- Drop all policies that depend on grade column
DROP POLICY IF EXISTS "Students can view questions for published exams" ON exam_questions;