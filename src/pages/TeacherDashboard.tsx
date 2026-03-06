import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Users, FileText, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSchedules } from '@/db/api';
import type { Schedule } from '@/types';

export default function TeacherDashboard() {
  const { user, profile } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const schedulesData = await getSchedules();
      // Filter schedules for this teacher
      const mySchedules = schedulesData.filter((s) => s.teacher_id === user.id);
      setSchedules(mySchedules);
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if teacher is approved
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
                شكراً لتسجيلك كمعلم. حسابك حالياً قيد المراجعة من قبل إدارة المدرسة.
                سيتم إشعارك عند الموافقة على حسابك وتفعيل صلاحياتك.
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

  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  const today = days[new Date().getDay() - 1] || days[0];
  const todaySchedules = schedules.filter((s) => s.day_of_week === today);

  // Get unique grades taught
  const gradesTeaching = [...new Set(schedules.map((s) => s.grade))];

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold">مرحباً، {profile?.full_name}</h1>
          <p className="text-muted-foreground">
            لوحة تحكم المعلم - {profile?.subject}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                التخصص
              </CardDescription>
              <CardTitle className="text-xl">{profile?.subject}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                الحصص اليوم
              </CardDescription>
              <CardTitle className="text-2xl">{todaySchedules.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                الصفوف المسؤول عنها
              </CardDescription>
              <CardTitle className="text-2xl">{gradesTeaching.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                الامتحانات النشطة
              </CardDescription>
              <CardTitle className="text-2xl">0</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              جدول اليوم - {today}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaySchedules.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                لا توجد حصص اليوم
              </p>
            ) : (
              <div className="space-y-3">
                {todaySchedules
                  .sort((a, b) => a.period_number - b.period_number)
                  .map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">الحصة {schedule.period_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {schedule.start_time?.slice(0, 5) || `${7 + schedule.period_number}:00`}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">{schedule.subject}</p>
                          <p className="text-sm text-muted-foreground">{schedule.grade}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{schedule.grade}</Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              نظرة عامة على الأسبوع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-5 gap-4">
              {days.map((day) => {
                const daySchedules = schedules.filter((s) => s.day_of_week === day);
                return (
                  <Card key={day} className={day === today ? 'border-primary' : ''}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{day}</CardTitle>
                      <CardDescription className="text-2xl font-bold">
                        {daySchedules.length}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <a href="/schedules">
                  <Calendar className="w-6 h-6" />
                  <span>الجداول الدراسية</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <a href="/teacher/exams">
                  <FileText className="w-6 h-6" />
                  <span>إدارة الامتحانات</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <a href="/teacher/exams/create">
                  <FileText className="w-6 h-6" />
                  <span>إنشاء امتحان</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <a href="/messages">
                  <BookOpen className="w-6 h-6" />
                  <span>الرسائل</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Classes Info */}
        <Card>
          <CardHeader>
            <CardTitle>الصفوف التي تدرسها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {gradesTeaching.length === 0 ? (
                <p className="text-muted-foreground">لم يتم تعيين صفوف بعد</p>
              ) : (
                gradesTeaching.map((grade) => (
                  <Badge key={grade} variant="secondary" className="text-sm">
                    {grade} ({schedules.filter((s) => s.grade === grade).length} حصة)
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
