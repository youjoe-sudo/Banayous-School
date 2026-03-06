import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Award, Plus, Pencil, Trash2, Trophy } from 'lucide-react';
import { getHonorBoard, createHonorEntry, deleteHonorEntry, getStudents } from '@/db/api';
import { toast } from 'sonner';
import type { HonorBoard, GradeLevel, Student } from '@/types';

export default function AdminHonorPage() {
  const [honorBoard, setHonorBoard] = useState<HonorBoard[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    grade: '' as GradeLevel | '',
    rank: 1,
    total_score: 0,
    semester: 'الفصل الأول',
    year: 2026,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [honorData, studentsData] = await Promise.all([
        getHonorBoard(),
        getStudents()
      ]);
      setHonorBoard(honorData);
      setStudents(studentsData);
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      student_id: '',
      grade: '',
      rank: 1,
      total_score: 0,
      semester: 'الفصل الأول',
      year: 2026,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.student_id || !formData.grade) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      await createHonorEntry({
        student_id: formData.student_id,
        grade: formData.grade as GradeLevel,
        rank: formData.rank,
        total_score: formData.total_score,
        semester: formData.semester,
        year: formData.year,
      } as any);
      toast.success('تم إضافة الطالب إلى لوحة الشرف بنجاح');
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
      toast.error('فشل في حفظ البيانات');
    }
  };

  const handleDelete = async (id: string, studentName: string) => {
    if (!confirm(`هل أنت متأكد من حذف ${studentName} من لوحة الشرف؟`)) return;

    try {
      await deleteHonorEntry(id);
      toast.success('تم الحذف بنجاح');
      fetchData();
    } catch (error) {
      console.error('خطأ في الحذف:', error);
      toast.error('فشل في الحذف');
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '⭐';
  };

  const getStudentsByGrade = (grade: GradeLevel | '') => {
    if (!grade) return students;
    return students.filter(s => s.grade === grade);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة لوحة الشرف</h1>
          <p className="text-muted-foreground">إضافة وتعديل الطلاب المتفوقين</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة طالب متفوق
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة طالب إلى لوحة الشرف</DialogTitle>
              <DialogDescription>
                أدخل بيانات الطالب المتفوق
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">الصف</Label>
                  <Select
                    value={formData.grade}
                    onValueChange={(value) => setFormData({ ...formData, grade: value as GradeLevel, student_id: '' })}
                  >
                    <SelectTrigger id="grade">
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="الصف الأول">فصل 1/1</SelectItem>
                      <SelectItem value="الصف الثاني">فصل 1/2</SelectItem>
                      <SelectItem value="الصف الثالث">فصل 1/3</SelectItem>
                      <SelectItem value="الصف الرابع">فصل 1/4</SelectItem>
                      <SelectItem value="الصف الخامس">فصل 1/5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student_id">الطالب</Label>
                  <Select
                    value={formData.student_id}
                    onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                    disabled={!formData.grade}
                  >
                    <SelectTrigger id="student_id">
                      <SelectValue placeholder="اختر الطالب" />
                    </SelectTrigger>
                    <SelectContent>
                      {getStudentsByGrade(formData.grade).map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} - {student.student_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rank">المركز</Label>
                  <Select
                    value={formData.rank.toString()}
                    onValueChange={(value) => setFormData({ ...formData, rank: parseInt(value) })}
                  >
                    <SelectTrigger id="rank">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">المركز الأول 🥇</SelectItem>
                      <SelectItem value="2">المركز الثاني 🥈</SelectItem>
                      <SelectItem value="3">المركز الثالث 🥉</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_score">المجموع الكلي</Label>
                  <Input
                    id="total_score"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.total_score}
                    onChange={(e) => setFormData({ ...formData, total_score: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="semester">الفصل الدراسي</Label>
                    <Select
                      value={formData.semester}
                      onValueChange={(value) => setFormData({ ...formData, semester: value })}
                    >
                      <SelectTrigger id="semester">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="الفصل الأول">الفصل الأول</SelectItem>
                        <SelectItem value="الفصل الثاني">الفصل الثاني</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">السنة</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">إضافة</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>إجمالي الطلاب المتفوقين</CardDescription>
            <CardTitle className="text-3xl">{honorBoard.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>الأوائل (المركز الأول)</CardDescription>
            <CardTitle className="text-3xl">
              {honorBoard.filter((h) => h.rank === 1).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>متوسط الدرجات</CardDescription>
            <CardTitle className="text-3xl">
              {honorBoard.length > 0
                ? (honorBoard.reduce((sum, h) => sum + h.total_score, 0) / honorBoard.length).toFixed(2)
                : '0'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Honor Board Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            لوحة الشرف ({honorBoard.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المركز</TableHead>
                  <TableHead className="text-right">الطالب</TableHead>
                  <TableHead className="text-right">الصف</TableHead>
                  <TableHead className="text-right">المجموع</TableHead>
                  <TableHead className="text-right">الفصل الدراسي</TableHead>
                  <TableHead className="text-right">السنة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {honorBoard.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      لا توجد بيانات
                    </TableCell>
                  </TableRow>
                ) : (
                  honorBoard.map((honor) => (
                    <TableRow key={honor.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getMedalIcon(honor.rank)}</span>
                          <span className="font-medium">المركز {honor.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {honor.student?.full_name}
                      </TableCell>
                      <TableCell>
                        <Badge>{honor.grade}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-primary">{honor.total_score.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>{honor.semester}</TableCell>
                      <TableCell>{honor.year}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(honor.id, honor.student?.full_name || '')}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
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
