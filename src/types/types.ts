// Database types for school management system

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';
export type GradeLevel = 'فصل 1/1' | 'فصل 1/2' | 'فصل 1/3' | 'فصل 1/4' | 'فصل 1/5';

export interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  role: UserRole;
  grade: GradeLevel | null;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  student_name: string | null;
  subject: string | null;
  responsible_grades: GradeLevel[] | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  full_name: string;
  grade: GradeLevel;
  student_number: string;
  birth_date: string | null;
  parent_phone: string | null;
  address: string | null;
  profile_id: string | null;
  created_at: string;
}

export interface Teacher {
  id: string;
  full_name: string;
  specialization: string;
  phone: string | null;
  email: string | null;
  profile_id: string | null;
  created_at: string;
}

export interface Schedule {
  id: string;
  grade: GradeLevel;
  day_of_week: string;
  period_number: number;
  subject: string;
  teacher_id: string | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  teacher?: Teacher;
}

export interface News {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  published_at: string;
  created_by: string | null;
  is_published: boolean;
}

export interface HonorBoard {
  id: string;
  student_id: string | null;
  grade: GradeLevel;
  rank: number;
  total_score: number;
  semester: string;
  year: number;
  created_at: string;
  student?: Student;
}

export interface Message {
  id: string;
  title: string;
  content: string;
  sender_id: string | null;
  sender?: Profile;
  recipient_type: 'individual' | 'all_students' | 'all_school';
  is_important: boolean;
  created_at: string;
  recipients?: MessageRecipient[];
}

export interface MessageRecipient {
  id: string;
  message_id: string;
  recipient_id: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface ParentStudentLink {
  id: string;
  parent_id: string;
  student_id: string;
  created_at: string;
  created_by: string | null;
}

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  grade: string;
  teacher_id: string;
  teacher?: Profile;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  start_date: string | null;
  end_date: string | null;
  is_published: boolean;
  created_at: string;
}

export interface ExamQuestion {
  id: string;
  exam_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: any;
  correct_answer: string | null;
  marks: number;
  order_number: number | null;
  created_at: string;
}

export interface ExamResult {
  id: string;
  exam_id: string;
  exam?: Exam;
  student_id: string;
  student?: Student;
  answers: any;
  score: number | null;
  total_marks: number | null;
  percentage: number | null;
  status: 'in_progress' | 'submitted' | 'graded';
  started_at: string;
  submitted_at: string | null;
  graded_at: string | null;
  graded_by: string | null;
  created_at: string;
}

export interface Certificate {
  id: string;
  student_id: string;
  student?: Student;
  exam_id: string | null;
  exam?: Exam;
  certificate_url: string;
  issued_by: string | null;
  issued_at: string;
  created_at: string;
}
