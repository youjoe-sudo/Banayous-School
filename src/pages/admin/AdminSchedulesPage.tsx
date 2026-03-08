import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, Trash2, Pencil, Clock } from 'lucide-react';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, getTeachers } from '@/db/api';
import { toast } from 'sonner';
import type { Schedule, GradeLevel, Teacher } from '@/types';

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    grade: '' as GradeLevel | '',
    day_of_week: '',
    period_number: 1,
    subject: '',
    teacher_id: '',
    start_time: '',
    end_time: '',
  });

  const grades: GradeLevel[] = ['فصل 1/1', 'فصل 1/2', 'فصل 1/3', 'فصل 1/4', 'فصل 1/5'];
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  const subjects = ['رياضيات', 'لغة عربية', 'علوم متكاملة', 'لغة إنجليزية', 'تربية إسلامية', 'تاريخ', 'لغة فرنسية', 'فلسفة', 'برمجة','نشاط'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedulesData, teachersData] = await Promise.all([
        getSchedules(),
        getTeachers()
      ]);
      setSchedules(schedulesData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        grade: schedule.grade,
        day_of_week: schedule.day_of_week,
        period_number: schedule.period_number,
        subject: schedule.subject,
        teacher_id: schedule.teacher_id || '',
        start_time: schedule.start_time || '',
        end_time: schedule.end_time || '',
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        grade: '',
        day_of_week: '',
        period_number: 1,
        subject: '',
        teacher_id: '',
        start_time: '08:00',
        end_time: '09:00',
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.grade || !formData.day_of_week || !formData.subject) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, {
          grade: formData.grade as GradeLevel,
          day_of_week: formData.day_of_week,
          period_number: formData.period_number,
          subject: formData.subject,
          teacher_id: formData.teacher_id || null,
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
        } as any);
        toast.success('تم تحديث الحصة بنجاح');
      } else {
        await createSchedule({
          grade: formData.grade as GradeLevel,
          day_of_week: formData.day_of_week,
          period_number: formData.period_number,
          subject: formData.subject,
          teacher_id: formData.teacher_id || null,
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
        } as any);
        toast.success('تم إضافة الحصة بنجاح');
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
      toast.error('فشل في حفظ البيانات');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحصة؟')) return;

    try {
      await deleteSchedule(id);
      toast.success('تم الحذف بنجاح');
      fetchData();
    } catch (error) {
      console.error('خطأ في الحذف:', error);
      toast.error('فشل في الحذف');
    }
  };

  const getTeachersBySubject = (subject: string) => {
    return teachers.filter(t => t.specialization === subject);
  };

  const subjectColors: Record<string, string> = {
    'رياضيات': 'bg-blue-500',
    'لغة عربية': 'bg-green-500',
    'علوم': 'bg-purple-500',
    'لغة إنجليزية': 'bg-orange-500',
    'تربية إسلامية': 'bg-indigo-500',
    'رياضة': 'bg-red-500',
    'فنون': 'bg-pink-500',
    'موسيقى': 'bg-violet-500',
    'حاسوب': 'bg-cyan-500',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الجداول</h1>
          <p className="text-muted-foreground">إنشاء وتعديل جداول الحصص</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة حصة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {editingSchedule ? 'تعديل الحصة' : 'إضافة حصة جديدة'}
              </DialogTitle>
              <DialogDescription>
                {editingSchedule ? 'تعديل بيانات الحصة الدراسية' : 'أدخل بيانات الحصة الدراسية'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">الصف</Label>
                  <Select
                    value={formData.grade}
                    onValueChange={(value) => setFormData({ ...formData, grade: value as GradeLevel })}
                  >
                    <SelectTrigger id="grade">
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="day_of_week">اليوم</Label>
                  <Select
                    value={formData.day_of_week}
                    onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}
                  >
                    <SelectTrigger id="day_of_week">
                      <SelectValue placeholder="اختر اليوم" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period_number">رقم الحصة</Label>
                  <Select
                    value={formData.period_number.toString()}
                    onValueChange={(value) => setFormData({ ...formData, period_number: parseInt(value) })}
                  >
                    <SelectTrigger id="period_number">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
                        <SelectItem key={period} value={period.toString()}>
                          الحصة {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">المادة</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value, teacher_id: '' })}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="اختر المادة" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_time">وقت البداية</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">وقت النهاية</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="teacher_id">المدرس</Label>
                  <Select
                    value={formData.teacher_id}
                    onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                    disabled={!formData.subject}
                  >
                    <SelectTrigger id="teacher_id">
                      <SelectValue placeholder="اختر المدرس (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      {getTeachersBySubject(formData.subject).map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingSchedule ? 'تحديث' : 'إضافة'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>إجمالي الحصص</CardDescription>
            <CardTitle className="text-3xl">{schedules.length}</CardTitle>
          </CardHeader>
        </Card>
        {grades.slice(0, 3).map((grade) => (
          <Card key={grade}>
            <CardHeader className="pb-3">
              <CardDescription>{grade}</CardDescription>
              <CardTitle className="text-2xl">
                {schedules.filter((s) => s.grade === grade).length}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            جداول الحصص ({schedules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الصف</TableHead>
                  <TableHead className="text-right">اليوم</TableHead>
                  <TableHead className="text-right">الحصة</TableHead>
                  <TableHead className="text-right">المادة</TableHead>
                  <TableHead className="text-right">المدرس</TableHead>
                  <TableHead className="text-right">الوقت</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      لا توجد حصص
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <Badge variant="outline">{schedule.grade}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{schedule.day_of_week}</TableCell>
                      <TableCell>الحصة {schedule.period_number}</TableCell>
                      <TableCell>
                        <Badge className={subjectColors[schedule.subject] || 'bg-gray-500'}>
                          {schedule.subject}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {schedule.teacher?.full_name || '-'}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {schedule.start_time?.slice(0, 5) || '-'} - {schedule.end_time?.slice(0, 5) || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(schedule)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(schedule.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
