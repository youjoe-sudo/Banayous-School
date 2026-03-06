import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, BookOpen, Award, Bell, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import type { Student } from '@/types';

export default function ParentDashboard() {
  const { user, profile } = useAuth();
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, [user]);

  const fetchChildren = async () => {
    if (!user) return;

    try {
      // Get linked children
      const { data: links, error } = await supabase
        .from('parent_student_links')
        .select(`
          student_id,
          students:student_id (
            id,
            student_number,
            full_name,
            grade,
            birth_date,
            parent_phone
          )
        `)
        .eq('parent_id', user.id);

      if (error) throw error;

      const childrenData = links?.map((link: any) => link.students).filter(Boolean) || [];
      setChildren(childrenData);
      
      if (childrenData.length > 0) {
        setSelectedChild(childrenData[0].id);
      }
    } catch (error) {
      console.error('خطأ في جلب الأبناء:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentChild = children.find((c) => c.id === selectedChild);

  // Check if parent is approved
  if (profile?.is_approved === false) {
    return (
      <MainLayout>
        <div className="container py-16">
          <Card className="max-w-2xl mx-auto border-yellow-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle>في انتظار الموافقة</CardTitle>
                  <CardDescription>حسابك قيد المراجعة من قبل الإدارة</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                شكراً لتسجيلك كولي أمر. حسابك حالياً قيد المراجعة من قبل إدارة المدرسة.
                سيتم إشعارك عند الموافقة على حسابك وربطه بأبنائك.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  <strong>ملاحظة:</strong> قد تستغرق عملية الموافقة من 1-3 أيام عمل.
                  يرجى التواصل مع إدارة المدرسة في حال وجود أي استفسار.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <p className="text-center text-muted-foreground">جاري التحميل...</p>
        </div>
      </MainLayout>
    );
  }

  if (children.length === 0) {
    return (
      <MainLayout>
        <div className="container py-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>لا توجد بيانات أبناء</CardTitle>
              <CardDescription>لم يتم ربط حسابك بأي طالب بعد</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                يرجى التواصل مع إدارة المدرسة لربط حسابك ببيانات أبنائك.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">مرحباً، {profile?.full_name}</h1>
            <p className="text-muted-foreground">لوحة تحكم ولي الأمر</p>
          </div>
          <div className="w-64">
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الطالب" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.full_name} - {child.grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {currentChild && (
          <>
            {/* Student Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  معلومات الطالب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">الاسم الكامل</p>
                    <p className="font-medium">{currentChild.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الطالب</p>
                    <p className="font-medium">{currentChild.student_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الصف</p>
                    <Badge>{currentChild.grade}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ الميلاد</p>
                    <p className="font-medium">
                      {currentChild.birth_date
                        ? new Date(currentChild.birth_date).toLocaleDateString('ar-SA')
                        : 'غير محدد'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    الصف الدراسي
                  </CardDescription>
                  <CardTitle className="text-2xl">{currentChild.grade}</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    المعدل التراكمي
                  </CardDescription>
                  <CardTitle className="text-2xl">-</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    الرسائل الجديدة
                  </CardDescription>
                  <CardTitle className="text-2xl">0</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    الامتحانات القادمة
                  </CardDescription>
                  <CardTitle className="text-2xl">0</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>الإجراءات السريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                    <a href="/schedules">
                      <BookOpen className="w-6 h-6" />
                      <span>الجداول الدراسية</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                    <a href="/honor">
                      <Award className="w-6 h-6" />
                      <span>لوحة الشرف</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                    <a href="/messages">
                      <Bell className="w-6 h-6" />
                      <span>الرسائل</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" disabled>
                    <BookOpen className="w-6 h-6" />
                    <span>النتائج والشهادات</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notice */}
            <Card className="border-blue-500 bg-blue-500/5">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>ملاحظة:</strong> يمكنك متابعة جميع بيانات أبنائك من خلال هذه اللوحة.
                  للتبديل بين الأبناء، استخدم القائمة المنسدلة في الأعلى.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}
