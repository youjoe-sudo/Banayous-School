import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, BookOpen, Calendar, Award, Newspaper, TrendingUp, ArrowLeft, Trash2, AlertTriangle, UserCheck } from 'lucide-react';
import { getStatistics, getAllProfiles, clearAllData, getPendingApprovals } from '@/db/api';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, news: 0 });
  const [userStats, setUserStats] = useState({ total: 0, admins: 0, teachers: 0, students: 0, parents: 0 });
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [statsData, profiles, pendingApprovals] = await Promise.all([
        getStatistics(),
        getAllProfiles(),
        getPendingApprovals()
      ]);
      
      setStats(statsData);
      setUserStats({
        total: profiles.length,
        admins: profiles.filter(p => p.role === 'admin').length,
        teachers: profiles.filter(p => p.role === 'teacher').length,
        students: profiles.filter(p => p.role === 'student').length,
        parents: profiles.filter(p => p.role === 'parent').length,
      });
      setPendingCount(pendingApprovals.length);
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = async () => {
    if (confirmText !== 'حذف جميع البيانات') {
      toast.error('يرجى كتابة النص التأكيدي بشكل صحيح');
      return;
    }

    setIsClearing(true);
    try {
      await clearAllData();
      toast.success('تم حذف جميع البيانات بنجاح');
      setClearDialogOpen(false);
      setConfirmText('');
      fetchStats();
    } catch (error) {
      console.error('خطأ في حذف البيانات:', error);
      toast.error('فشل في حذف البيانات');
    } finally {
      setIsClearing(false);
    }
  };

  const quickLinks = [
    {
      title: 'طلبات الموافقة',
      description: 'مراجعة طلبات التسجيل المعلقة',
      icon: UserCheck,
      link: '/admin/approvals',
      color: 'text-orange-600',
      bgColor: 'bg-orange-600/10',
      count: pendingCount,
      highlight: pendingCount > 0,
    },
    {
      title: 'إدارة الطلاب',
      description: 'إضافة وتعديل وحذف الطلاب',
      icon: Users,
      link: '/admin/students',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      count: stats.students,
    },
    {
      title: 'إدارة المدرسين',
      description: 'إضافة وتعديل وحذف المدرسين',
      icon: BookOpen,
      link: '/admin/teachers',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      count: stats.teachers,
    },
    {
      title: 'إدارة الجداول',
      description: 'إنشاء وتعديل جداول الحصص',
      icon: Calendar,
      link: '/admin/schedules',
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
      count: 5,
    },
    {
      title: 'إدارة لوحة الشرف',
      description: 'إضافة الطلاب المتفوقين',
      icon: Award,
      link: '/admin/honor',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-600/10',
      count: 15,
    },
    {
      title: 'إدارة الأخبار',
      description: 'نشر وتعديل الأخبار',
      icon: Newspaper,
      link: '/admin/news',
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10',
      count: stats.news,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
          <p className="text-muted-foreground">مرحباً بك في لوحة التحكم الخاصة بنظام إدارة المدرسة</p>
        </div>
        
        {/* Clear All Data Button */}
        <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 ml-2" />
              مسح جميع البيانات
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                تحذير: حذف جميع البيانات
              </DialogTitle>
              <DialogDescription className="space-y-3 pt-4">
                <p className="font-semibold text-foreground">
                  هذا الإجراء سيقوم بحذف جميع البيانات التالية بشكل نهائي:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>جميع الطلاب ({stats.students})</li>
                  <li>جميع المدرسين ({stats.teachers})</li>
                  <li>جميع الجداول الدراسية</li>
                  <li>جميع الأخبار ({stats.news})</li>
                  <li>جميع بيانات لوحة الشرف</li>
                </ul>
                <p className="text-destructive font-semibold">
                  ⚠️ لا يمكن التراجع عن هذا الإجراء!
                </p>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="confirm">
                  للتأكيد، اكتب: <span className="font-bold">حذف جميع البيانات</span>
                </Label>
                <Input
                  id="confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="حذف جميع البيانات"
                  className="text-center font-bold"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setClearDialogOpen(false);
                  setConfirmText('');
                }}
                disabled={isClearing}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleClearAllData}
                disabled={confirmText !== 'حذف جميع البيانات' || isClearing}
              >
                {isClearing ? 'جاري الحذف...' : 'حذف جميع البيانات'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>إجمالي المستخدمين</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {userStats.total}
              <TrendingUp className="w-5 h-5 text-secondary" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>الطلاب</CardDescription>
            <CardTitle className="text-3xl text-primary">{stats.students}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>المدرسون</CardDescription>
            <CardTitle className="text-3xl text-secondary">{stats.teachers}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>الأخبار المنشورة</CardDescription>
            <CardTitle className="text-3xl text-chart-3">{stats.news}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* User Roles Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>توزيع المستخدمين حسب الدور</CardTitle>
          <CardDescription>إحصائيات المستخدمين المسجلين في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.admins}</p>
                <p className="text-sm text-muted-foreground">مدير</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.teachers}</p>
                <p className="text-sm text-muted-foreground">مدرس</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="w-12 h-12 bg-chart-3/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.students}</p>
                <p className="text-sm text-muted-foreground">طالب</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="w-12 h-12 bg-yellow-600/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.parents}</p>
                <p className="text-sm text-muted-foreground">ولي أمر</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div>
        <h2 className="text-2xl font-bold mb-4">الوصول السريع</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, index) => (
            <Card 
              key={index} 
              className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                link.highlight ? 'border-orange-500 border-2 animate-pulse' : ''
              }`}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${link.bgColor} flex items-center justify-center mb-4 relative`}>
                  <link.icon className={`w-6 h-6 ${link.color}`} />
                  {link.highlight && link.count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                      {link.count}
                    </span>
                  )}
                </div>
                <CardTitle className="flex items-center justify-between">
                  {link.title}
                  <span className={`text-sm font-normal ${link.highlight ? 'text-orange-600 font-bold' : 'text-muted-foreground'}`}>
                    ({link.count})
                  </span>
                </CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Link to={link.link}>
                    الانتقال
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
