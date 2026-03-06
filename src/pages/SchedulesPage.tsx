import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Search, Printer } from 'lucide-react';
import { getSchedules } from '@/db/api';
import type { Schedule, GradeLevel } from '@/types';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('فصل 1/1');

  const grades: GradeLevel[] = ['فصل 1/1', 'فصل 1/2', 'فصل 1/3', 'فصل 1/4', 'فصل 1/5'];
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const data = await getSchedules();
        setSchedules(data);
      } catch (error) {
        console.error('خطأ في جلب الجداول:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const getScheduleForGrade = (grade: GradeLevel) => {
    return schedules.filter((s) => s.grade === grade);
  };

  const getScheduleCell = (grade: GradeLevel, day: string, period: number) => {
    const schedule = schedules.find(
      (s) => s.grade === grade && s.day_of_week === day && s.period_number === period
    );
    return schedule;
  };

  const filterSchedule = (schedule: Schedule[]) => {
    if (!searchTerm) return schedule;
    return schedule.filter(
      (s) =>
        s.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.teacher?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const getMaxPeriods = (grade: GradeLevel) => {
    const gradeSchedules = getScheduleForGrade(grade);
    if (gradeSchedules.length === 0) return 6;
    return Math.max(...gradeSchedules.map(s => s.period_number), 6);
  };

  const subjectColors: Record<string, string> = {
    'رياضيات': 'bg-blue-500',
    'لغة عربية': 'bg-green-500',
    'علوم متكاملة': 'bg-purple-500',
    'لغة إنجليزية': 'bg-orange-500',
    'تربية إسلامية': 'bg-indigo-500',
    'رياضة': 'bg-red-500',
    'العاب': 'bg-pink-500',
    'اللغة الفرنسية': 'bg-yellow-500',
    'برمجة': 'bg-cyan-500',
  };

  const getSubjectColor = (subject: string) => {
    return subjectColors[subject] || 'bg-gray-500';
  };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-chart-3" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">جداول الحصص</h1>
                <p className="text-muted-foreground">عرض جداول الحصص لجميع الصفوف</p>
              </div>
            </div>
            <Button onClick={handlePrint} variant="outline" className="print:hidden">
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6 print:hidden">
          <CardHeader>
            <CardTitle>البحث</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالمادة أو المدرس..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Exam Period Notice */}
        <Card className="mb-6 border-yellow-500 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
              <Clock className="w-5 h-5" />
              فترة الامتحانات
            </CardTitle>
            <CardDescription>
              ستبدأ الامتحانات النهائية للفصل الدراسي الأول في تاريخ 15/12/2026
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Schedules Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>الجداول الدراسية</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full bg-muted" />
                ))}
              </div>
            ) : (
              <Tabs value={selectedGrade} onValueChange={(v) => setSelectedGrade(v as GradeLevel)}>
                <TabsList className="grid w-full grid-cols-5 print:hidden">
                  {grades.map((grade) => (
                    <TabsTrigger key={grade} value={grade}>
                      {grade}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {grades.map((grade) => (
                  <TabsContent key={grade} value={grade} className="mt-6">
                    <div className="mb-4 print:block hidden">
                      <h2 className="text-2xl font-bold text-center">{grade}</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right w-24">الحصة</TableHead>
                            {days.map((day) => (
                              <TableHead key={day} className="text-right">
                                {day}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Array.from({ length: getMaxPeriods(grade) }, (_, i) => i + 1).map((period) => (
                            <TableRow key={period}>
                              <TableCell className="font-medium bg-muted/50">
                                <div className="flex flex-col gap-1">
                                  <span className="text-sm">الحصة {period}</span>
                                  <span className="text-xs text-muted-foreground">
{(() => {
  const schedule = getScheduleCell(grade, days[0], period);

  // 1. لو البيانات موجودة في قاعدة البيانات، اعرضها زي ما هي
  if (schedule?.start_time && schedule?.end_time) {
    return `${schedule.start_time.slice(0, 5)} - ${schedule.end_time.slice(0, 5)}`;
  }

  // 2. لو مفيش بيانات، استخدم الجدول الثابت اللي إنت بعته
  const timeTable = {
    1: "07:10 - 07:50",
    2: "07:50 - 08:30",
    3: "08:30 - 09:10",
    4: "09:10 - 09:45",
    5: "09:55 - 10:30", // لاحظ هنا الفسحة خلصت وبدأنا 9:55
    6: "10:30 - 11:05",
    7: "11:05 - 11:35"
  };

  // بيرجع الوقت بناءً على رقم الحصة، ولو الرقم مش موجود يرجع فاضي
})()}
                                  </span>
                                </div>
                              </TableCell>
                              {days.map((day) => {
                                const schedule = getScheduleCell(grade, day, period);
                                const isFiltered =
                                  searchTerm &&
                                  schedule &&
                                  !schedule.subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
                                  !schedule.teacher?.full_name.toLowerCase().includes(searchTerm.toLowerCase());

                                return (
                                  <TableCell
                                    key={day}
                                    className={isFiltered ? 'opacity-30' : ''}
                                  >
                                    {schedule ? (
                                      <div className="space-y-1">
                                        <Badge className={getSubjectColor(schedule.subject)}>
                                          {schedule.subject}
                                        </Badge>
                                        <p className="text-xs text-muted-foreground">
                                          {schedule.teacher?.full_name}
                                        </p>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-sm">-</span>
                                    )}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          header, footer, .print\\:hidden {
            display: none !important;
          }
          
          .container {
            max-width: 100% !important;
            padding: 0 !important;
          }
          
          table {
            page-break-inside: avoid;
            border-collapse: collapse;
            width: 100%;
          }
          
          th, td {
            border: 1px solid #000 !important;
            padding: 8px !important;
            font-size: 11px !important;
          }
          
          th {
            background-color: #f0f0f0 !important;
            font-weight: bold !important;
          }
          
          .bg-muted\\/50 {
            background-color: #f5f5f5 !important;
          }
          
          /* Subject colors for print */
          .bg-blue-500 { background-color: #3b82f6 !important; color: white !important; }
          .bg-green-500 { background-color: #22c55e !important; color: white !important; }
          .bg-purple-500 { background-color: #a855f7 !important; color: white !important; }
          .bg-orange-500 { background-color: #f97316 !important; color: white !important; }
          .bg-indigo-500 { background-color: #6366f1 !important; color: white !important; }
          .bg-red-500 { background-color: #ef4444 !important; color: white !important; }
          .bg-pink-500 { background-color: #ec4899 !important; color: white !important; }
          .bg-violet-500 { background-color: #8b5cf6 !important; color: white !important; }
          .bg-cyan-500 { background-color: #06b6d4 !important; color: white !important; }
          
          h1, h2 {
            text-align: center;
            margin-bottom: 20px;
          }
          
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </MainLayout>
  );
}
