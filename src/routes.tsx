import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentsPage from './pages/StudentsPage';
import TeachersPage from './pages/TeachersPage';
import SchedulesPage from './pages/SchedulesPage';
import HonorBoardPage from './pages/HonorBoardPage';
import MessagesPage from './pages/MessagesPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminTeachersPage from './pages/admin/AdminTeachersPage';
import AdminSchedulesPage from './pages/admin/AdminSchedulesPage';
import AdminHonorPage from './pages/admin/AdminHonorPage';
import AdminNewsPage from './pages/admin/AdminNewsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import PendingApprovalsPage from './pages/admin/PendingApprovalsPage';
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage';
import TeacherExamsPage from './pages/teacher/TeacherExamsPage';
import CreateExamPage from './pages/teacher/CreateExamPage';
import ExamResultsPage from './pages/teacher/ExamResultsPage';
import TopStudentsPage from './pages/teacher/TopStudentsPage';
import ResultsStatsPage from './pages/teacher/ResultsStatsPage';
import StudentExamsPage from './pages/student/StudentExamsPage';
import TakeExamPage from './pages/student/TakeExamPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  requiresAuth?: boolean;
  allowedRoles?: string[];
}

const routes: RouteConfig[] = [
  {
    name: 'الرئيسية',
    path: '/',
    element: <LandingPage />,
    visible: false,
    requiresAuth: false
  },
  {
    name: 'تسجيل الدخول',
    path: '/login',
    element: <LoginPage />,
    visible: false,
    requiresAuth: false
  },
  {
    name: 'التسجيل',
    path: '/register',
    element: <RegisterPage />,
    visible: false,
    requiresAuth: false
  },
  // Role-based dashboards
  {
    name: 'لوحة الطالب',
    path: '/dashboard/student',
    element: <StudentDashboard />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['student']
  },
  {
    name: 'لوحة ولي الأمر',
    path: '/dashboard/parent',
    element: <ParentDashboard />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['parent']
  },
  {
    name: 'لوحة المعلم',
    path: '/dashboard/teacher',
    element: <TeacherDashboard />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['teacher']
  },
  // Teacher panel routes
  {
    name: 'لوحة تحكم المعلم',
    path: '/teacher',
    element: <TeacherDashboardPage />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['teacher']
  },
  {
    name: 'إدارة الامتحانات',
    path: '/teacher/exams',
    element: <TeacherExamsPage />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['teacher']
  },
  {
    name: 'إنشاء امتحان',
    path: '/teacher/exams/create',
    element: <CreateExamPage />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['teacher']
  },
  {
    name: 'نتائج الامتحان',
    path: '/teacher/exams/:examId/results',
    element: <ExamResultsPage />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['teacher']
  },
  {
    name: 'النتائج والإحصائيات',
    path: '/teacher/results',
    element: <ResultsStatsPage />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['teacher']
  },
  {
    name: 'الطلاب المتفوقون',
    path: '/teacher/top-students',
    element: <TopStudentsPage />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['teacher']
  },
  // Public pages (require auth)
  {
    name: 'الطلاب',
    path: '/students',
    element: <StudentsPage />,
    visible: false,
    requiresAuth: true
  },
  {
    name: 'المدرسون',
    path: '/teachers',
    element: <TeachersPage />,
    visible: false,
    requiresAuth: true
  },
  {
    name: 'الجداول',
    path: '/schedules',
    element: <SchedulesPage />,
    visible: false,
    requiresAuth: true
  },
  {
    name: 'لوحة الشرف',
    path: '/honor',
    element: <HonorBoardPage />,
    visible: false,
    requiresAuth: true
  },
  {
    name: 'الرسائل',
    path: '/messages',
    element: <MessagesPage />,
    visible: false,
    requiresAuth: true
  },
  // Student exam routes
  {
    name: 'الامتحانات',
    path: '/student/exams',
    element: <StudentExamsPage />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['student']
  },
  {
    name: 'حل الامتحان',
    path: '/student/exams/:examId/take',
    element: <TakeExamPage />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['student']
  },
  // Admin routes
  {
    name: 'لوحة التحكم',
    path: '/admin',
    element: <AdminDashboard />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  {
    name: 'إدارة الطلاب',
    path: '/admin/students',
    element: <AdminStudentsPage />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  {
    name: 'إدارة المدرسين',
    path: '/admin/teachers',
    element: <AdminTeachersPage />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  {
    name: 'إدارة الجداول',
    path: '/admin/schedules',
    element: <AdminSchedulesPage />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  {
    name: 'إدارة لوحة الشرف',
    path: '/admin/honor',
    element: <AdminHonorPage />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  {
    name: 'إدارة الأخبار',
    path: '/admin/news',
    element: <AdminNewsPage />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  {
    name: 'إدارة المستخدمين',
    path: '/admin/users',
    element: <AdminUsersPage />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  {
    name: 'طلبات الموافقة',
    path: '/admin/approvals',
    element: <PendingApprovalsPage />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  {
    name: 'إدارة الرسائل',
    path: '/admin/messages',
    element: <AdminMessagesPage />,
    visible: false,
    requiresAuth: true,
    allowedRoles: ['admin']
  }
];

export default routes;
