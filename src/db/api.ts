// API functions for school management system
import { supabase } from './supabase';
import type { Profile, Student, Teacher, Schedule, News, HonorBoard, GradeLevel } from '@/types';

// Profile APIs
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// Student APIs
export async function getStudents(grade?: GradeLevel, search?: string) {
  let query = supabase
    .from('students')
    .select('*')
    .order('full_name', { ascending: true });

  if (grade) {
    query = query.eq('grade', grade);
  }

  if (search) {
    query = query.ilike('full_name', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getStudentById(id: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createStudent(student: Omit<Student, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('students')
    .insert(student)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateStudent(id: string, updates: Partial<Student>) {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteStudent(id: string) {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Teacher APIs
export async function getTeachers(search?: string) {
  let query = supabase
    .from('teachers')
    .select('*')
    .order('full_name', { ascending: true });

  if (search) {
    query = query.ilike('full_name', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createTeacher(teacher: Omit<Teacher, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('teachers')
    .insert(teacher)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateTeacher(id: string, updates: Partial<Teacher>) {
  const { data, error } = await supabase
    .from('teachers')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteTeacher(id: string) {
  const { error } = await supabase
    .from('teachers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Schedule APIs
export async function getSchedules(grade?: GradeLevel) {
  let query = supabase
    .from('schedules')
    .select(`
      *,
      teacher:teachers(*)
    `)
    .order('day_of_week', { ascending: true })
    .order('period_number', { ascending: true });

  if (grade) {
    query = query.eq('grade', grade);
  }

  const { data, error } = await query;

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function createSchedule(schedule: Omit<Schedule, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('schedules')
    .insert(schedule)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateSchedule(id: string, updates: Partial<Schedule>) {
  const { data, error } = await supabase
    .from('schedules')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteSchedule(id: string) {
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// News APIs
export async function getNews(limit?: number) {
  let query = supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getAllNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function createNews(news: Omit<News, 'id' | 'published_at'>) {
  const { data, error } = await supabase
    .from('news')
    .insert(news)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateNews(id: string, updates: Partial<News>) {
  const { data, error } = await supabase
    .from('news')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteNews(id: string) {
  const { error } = await supabase
    .from('news')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Honor Board APIs
export async function getHonorBoard(grade?: GradeLevel) {
  let query = supabase
    .from('honor_board')
    .select(`
      *,
      student:students(*)
    `)
    .order('grade', { ascending: true })
    .order('rank', { ascending: true });

  if (grade) {
    query = query.eq('grade', grade);
  }

  const { data, error } = await query;

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function createHonorEntry(entry: Omit<HonorBoard, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('honor_board')
    .insert(entry)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteHonorEntry(id: string) {
  const { error } = await supabase
    .from('honor_board')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Statistics
export async function getStatistics() {
  const [studentsCount, teachersCount, newsCount] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('teachers').select('*', { count: 'exact', head: true }),
    supabase.from('news').select('*', { count: 'exact', head: true })
  ]);

  return {
    students: studentsCount.count || 0,
    teachers: teachersCount.count || 0,
    news: newsCount.count || 0
  };
}

// Clear all data (admin only)
export async function clearAllData() {
  try {
    // Delete in order to respect foreign key constraints
    await Promise.all([
      supabase.from('honor_board').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('news').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('message_recipients').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    ]);

    await Promise.all([
      supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('teachers').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    ]);

    return { success: true };
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

// Update user role (admin only)
export async function updateUserRole(userId: string, role: string) {
  const { data, error } = await (supabase as any)
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
  return data;
}

// Messages API
export async function getMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getUserMessages(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  // Get messages where user is a recipient or it's a broadcast message
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, email),
      recipients:message_recipients!inner(id, is_read, read_at, recipient_id)
    `)
    .or(`recipient_type.eq.all_school,recipient_type.eq.all_students,and(recipient_type.eq.individual,recipients.recipient_id.eq.${userId})`)
    .order('created_at', { ascending: false });

  if (error) {
    // If the complex query fails, try a simpler approach
    const { data: broadcastMessages, error: broadcastError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, email)
      `)
      .in('recipient_type', ['all_school', 'all_students'])
      .order('created_at', { ascending: false });

    const { data: individualMessages, error: individualError } = await supabase
      .from('message_recipients')
      .select(`
        message:messages(
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, email)
        ),
        id,
        is_read,
        read_at
      `)
      .eq('recipient_id', userId);

    if (broadcastError || individualError) {
      throw broadcastError || individualError;
    }

    // Combine and format the results
    const allMessages = [
      ...(broadcastMessages || []),
      ...(individualMessages || []).map((item: any) => ({
        ...item.message,
        recipients: [{ id: item.id, is_read: item.is_read, read_at: item.read_at }]
      }))
    ];

    // Sort by created_at
    allMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return allMessages;
  }

  return Array.isArray(data) ? data : [];
}

export async function createMessage(message: {
  title: string;
  content: string;
  sender_id: string;
  recipient_type: string;
  recipient_ids?: string[];
  is_important?: boolean;
}) {
  const { data: messageData, error: messageError } = await (supabase as any)
    .from('messages')
    .insert({
      title: message.title,
      content: message.content,
      sender_id: message.sender_id,
      recipient_type: message.recipient_type,
      is_important: message.is_important || false,
    })
    .select()
    .single();

  if (messageError) throw messageError;

  // If individual recipients, create recipient records
  if (message.recipient_type === 'individual' && message.recipient_ids && message.recipient_ids.length > 0) {
    const recipients = message.recipient_ids.map(recipientId => ({
      message_id: messageData.id,
      recipient_id: recipientId,
    }));

    const { error: recipientsError } = await supabase
      .from('message_recipients')
      .insert(recipients);

    if (recipientsError) throw recipientsError;
  }

  return messageData;
}

export async function markMessageAsRead(messageId: string, userId: string) {
  const { error } = await (supabase as any)
    .from('message_recipients')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('message_id', messageId)
    .eq('recipient_id', userId);

  if (error) throw error;
}

export async function getUnreadMessagesCount(userId: string) {
  const { count, error } = await supabase
    .from('message_recipients')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
}

// Exam APIs
export async function createExam(exam: {
  title: string;
  description: string | null;
  subject: string;
  grade: string;
  teacher_id: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  start_date: string | null;
  end_date: string | null;
  is_published?: boolean;
}) {
  const { data, error } = await supabase
    .from('exams')
    .insert({
      ...exam,
      is_published: exam.is_published ?? false
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating exam:', error);
    throw error;
  }
  return data;
}

export async function getExams(teacherId?: string, grade?: GradeLevel) {
  let query = supabase
    .from('exams')
    .select(`
      *,
      profiles!teacher_id (
        id,
        full_name,
        subject
      )
    `)
    .order('created_at', { ascending: false });

  if (teacherId) {
    query = query.eq('teacher_id', teacherId);
  }

  if (grade) {
    query = query.eq('grade', grade);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }
  
  // Map to include teacher data
  const examsWithTeacher = Array.isArray(data) ? data.map(exam => ({
    ...exam,
    teacher: exam.profiles
  })) : [];
  
  return examsWithTeacher;
}

export async function getExamById(examId: string) {
  const { data, error } = await supabase
    .from('exams')
    .select(`
      *,
      profiles!teacher_id (
        id,
        full_name,
        subject
      ),
      exam_questions (
        id,
        question_text,
        question_type,
        options,
        correct_answer,
        marks,
        order_number
      )
    `)
    .eq('id', examId)
    .single();

  if (error) {
    console.error('Error fetching exam by ID:', error);
    throw error;
  }
  
  // Map teacher data
  return {
    ...data,
    teacher: data.profiles
  };
}

export async function addExamQuestion(question: {
  exam_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: string[] | null;
  correct_answer: string;
  marks: number;
  order_number: number;
}) {
  const { data, error } = await supabase
    .from('exam_questions')
    .insert(question)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function submitExamResult(result: {
  exam_id: string;
  student_id: string;
  answers: Record<string, string>;
  score: number;
  total_marks: number;
  passed: boolean;
  time_taken_minutes: number | null;
}) {
  console.log('API: Submitting exam result to Supabase:', result);
  
  const { data, error } = await supabase
    .from('exam_results')
    .insert(result)
    .select()
    .single();

  if (error) {
    console.error('API: Error submitting exam result:', error);
    throw error;
  }
  
  console.log('API: Exam result submitted successfully:', data);
  return data;
}

export async function getExamResults(examId: string) {
  // Get exam results
  const { data, error } = await supabase
    .from('exam_results')
    .select('*')
    .eq('exam_id', examId)
    .order('score', { ascending: false });

  if (error) {
    console.error('Error fetching exam results:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Get student profiles
  const studentIds = data.map(result => result.student_id);
  
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, grade')
    .in('id', studentIds);

  if (profilesError) {
    console.error('Error fetching student profiles:', profilesError);
  }

  // Map student data to results
  const resultsWithStudent = data.map(result => ({
    ...result,
    student: profiles?.find(p => p.id === result.student_id) || null
  }));
  
  return resultsWithStudent;
}

export async function getStudentExamResult(examId: string, studentId: string) {
  const { data, error } = await supabase
    .from('exam_results')
    .select('*')
    .eq('exam_id', examId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getStudentExams(studentId: string, grade: GradeLevel) {
  // Get all exams for student's grade
  const { data, error } = await supabase
    .from('exams')
    .select(`
      *,
      profiles!teacher_id (
        id,
        full_name,
        subject
      )
    `)
    .eq('grade', grade)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching student exams:', error);
    throw error;
  }

  // Get exam results for this student
  if (!data || data.length === 0) {
    return [];
  }

  const examIds = data.map(exam => exam.id);
  const { data: resultsData } = await supabase
    .from('exam_results')
    .select('*')
    .in('exam_id', examIds)
    .eq('student_id', studentId);

  // Combine exams with their results
  const examsWithResults = data.map(exam => ({
    ...exam,
    teacher: exam.profiles,
    exam_results: resultsData?.filter(result => result.exam_id === exam.id) || []
  }));

  return examsWithResults;
}

export async function updateExam(examId: string, updates: { is_published?: boolean; [key: string]: any }) {
  const { data, error } = await supabase
    .from('exams')
    .update(updates)
    .eq('id', examId)
    .select()
    .single();

  if (error) {
    console.error('Error updating exam:', error);
    throw error;
  }
  return data;
}

export async function createCertificate(certificate: {
  student_id: string;
  exam_id: string;
  certificate_type: string;
  issue_date: string;
  certificate_data: Record<string, any>;
}) {
  const { data, error } = await supabase
    .from('certificates')
    .insert(certificate)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getStudentCertificates(studentId: string) {
  const { data, error } = await supabase
    .from('certificates')
    .select(`
      *,
      exam:exam_id (
        title,
        subject,
        grade
      )
    `)
    .eq('student_id', studentId)
    .order('issue_date', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// Approval Management APIs
export async function getPendingApprovals() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('approval_status', 'pending')
    .in('role', ['parent', 'teacher'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function approveUser(userId: string, adminId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_approved: true,
      approval_status: 'approved',
      approved_by: adminId,
      approved_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function rejectUser(userId: string, adminId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_approved: false,
      approval_status: 'rejected',
      approved_by: adminId,
      approved_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Get all students for linking with parents
export async function getAllStudentsForLinking() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, grade, email')
    .eq('role', 'student')
    .order('full_name', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}
