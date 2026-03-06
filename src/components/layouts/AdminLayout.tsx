import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  Award, 
  Newspaper,
  Menu,
  Home,
  GraduationCap,
  Shield,
  Mail,
  LogOut,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('تم تسجيل الخروج بنجاح');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      toast.error('فشل في تسجيل الخروج');
    }
  };

  const navItems = [
    { to: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard, exact: true },
    { to: '/admin/approvals', label: 'طلبات الموافقة', icon: UserCheck },
    { to: '/admin/students', label: 'إدارة الطلاب', icon: Users },
    { to: '/admin/teachers', label: 'إدارة المدرسين', icon: BookOpen },
    { to: '/admin/schedules', label: 'إدارة الجداول', icon: Calendar },
    { to: '/admin/honor', label: 'إدارة لوحة الشرف', icon: Award },
    { to: '/admin/news', label: 'إدارة الأخبار', icon: Newspaper },
    { to: '/admin/users', label: 'إدارة المستخدمين', icon: Shield },
    { to: '/admin/messages', label: 'إدارة الرسائل', icon: Mail },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">لوحة التحكم</h2>
            <p className="text-xs text-muted-foreground">{profile?.full_name}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Button asChild variant="ghost" className="w-full justify-start mb-4">
          <Link to="/">
            <Home className="w-4 h-4 ml-2" />
            العودة للموقع
          </Link>
        </Button>

        {navItems.map((item) => (
          <Button
            key={item.to}
            asChild
            variant={isActive(item.to, item.exact) ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start',
              isActive(item.to, item.exact) && 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            <Link to={item.to}>
              <item.icon className="w-4 h-4 ml-2" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 ml-2" />
          تسجيل الخروج
        </Button>
        <p className="text-xs text-muted-foreground text-center pt-2">
          © 2026 نظام إدارة المدرسة
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-l bg-muted/30">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold">لوحة التحكم</span>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
