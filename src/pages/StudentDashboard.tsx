import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Calendar, Award, FileText, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSchedules, getUserMessages, getUnreadMessagesCount } from '@/db/api';
import type { Schedule, Message } from '@/types';

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      const [schedulesData, messagesData, unreadCountData] = await Promise.all([
        getSchedules(),
        getUserMessages(user.id),
        getUnreadMessagesCount(user.id),
      ]);
      
      setSchedules(schedulesData);
      setMessages(messagesData.slice(0, 5)); // Latest 5 messages
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    } finally {
      setLoading(false);
    }
  };

  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

  const getScheduleForDay = (day: string) => {
    return schedules
      .filter((s) => s.day_of_week === day && s.grade === profile?.grade)
      .sort((a, b) => a.period_number - b.period_number);
  };

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold">مرحباً، {profile?.full_name}</h1>
          <p className="text-muted-foreground">لوحة تحكم الطالب - {profile?.grade}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                الصف الدراسي
              </CardDescription>
              <CardTitle className="text-2xl">{profile?.grade}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                الحصص اليوم
              </CardDescription>
              <CardTitle className="text-2xl">
                {getScheduleForDay(days[new Date().getDay() - 1] || days[0]).length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                الرسائل الجديدة
              </CardDescription>
              <CardTitle className="text-2xl">{unreadCount}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                الامتحانات القادمة
              </CardDescription>
              <CardTitle className="text-2xl">0</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Schedule */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                جدول الحصص
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={days[new Date().getDay() - 1] || days[0]}>
                <TabsList className="grid w-full grid-cols-5">
                  {days.map((day) => (
                    <TabsTrigger key={day} value={day} className="text-xs">
                      {day}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {days.map((day) => (
                  <TabsContent key={day} value={day} className="space-y-3 mt-4">
                    {getScheduleForDay(day).length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        لا توجد حصص في هذا اليوم
                      </p>
                    ) : (
                      getScheduleForDay(day).map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <p className="text-sm font-medium">الحصة {schedule.period_number}</p>
                              <p className="text-xs text-muted-foreground">
                                {schedule.start_time?.slice(0, 5) || `${7 + schedule.period_number}:00`}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">{schedule.subject}</p>
                              <p className="text-sm text-muted-foreground">
                                {schedule.teacher?.full_name || 'غير محدد'}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{schedule.subject}</Badge>
                        </div>
                      ))
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                آخر الرسائل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد رسائل
                </p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className="p-3 border rounded-lg space-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-sm">{message.title}</p>
                      <Badge variant="default" className="text-xs">جديد</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {message.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full" asChild>
                <a href="/messages">عرض جميع الرسائل</a>
              </Button>
            </CardContent>
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
                  <Calendar className="w-6 h-6" />
                  <span>الجداول الدراسية</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <a href="/student/exams">
                  <FileText className="w-6 h-6" />
                  <span>الامتحانات</span>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
