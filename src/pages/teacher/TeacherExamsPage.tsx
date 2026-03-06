import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus, Eye, Calendar, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getExams, updateExam } from '@/db/api';
import { toast } from 'sonner';

export default function TeacherExamsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, [user]);

  const fetchExams = async () => {
    if (!user) return;

    try {
      const data = await getExams(user.id);
      setExams(data);
    } catch (error) {
      console.error('خطأ في جلب الامتحانات:', error);
      toast.error('فشل في جلب الامتحانات');
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (examId: string, currentStatus: boolean) => {
    try {
      await updateExam(examId, { is_published: !currentStatus });
      toast.success(currentStatus ? 'تم إلغاء نشر الامتحان' : 'تم نشر الامتحان بنجاح');
      fetchExams();
    } catch (error) {
      console.error('خطأ في تحديث حالة النشر:', error);
      toast.error('فشل في تحديث حالة النشر');
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة الامتحانات</h1>
            <p className="text-muted-foreground">إنشاء ومتابعة الامتحانات</p>
          </div>
          <Button asChild>
            <Link to="/teacher/exams/create">
              <Plus className="w-4 h-4 ml-2" />
              إنشاء امتحان جديد
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>إجمالي الامتحانات</CardDescription>
              <CardTitle className="text-3xl">{exams.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>الامتحانات المنشورة</CardDescription>
              <CardTitle className="text-3xl">
                {exams.filter((e) => e.is_published).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>الامتحانات النشطة</CardDescription>
              <CardTitle className="text-3xl">
                {exams.filter((e) => {
                  const now = new Date();
                  const start = e.start_date ? new Date(e.start_date) : null;
                  const end = e.end_date ? new Date(e.end_date) : null;
                  return e.is_published && (!start || start <= now) && (!end || end >= now);
                }).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>المسودات</CardDescription>
              <CardTitle className="text-3xl">
                {exams.filter((e) => !e.is_published).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Exams Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              قائمة الامتحانات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">جاري التحميل...</p>
            ) : exams.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">لم تقم بإنشاء أي امتحانات بعد</p>
                <Button asChild>
                  <Link to="/teacher/exams/create">
                    <Plus className="w-4 h-4 ml-2" />
                    إنشاء امتحان جديد
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">العنوان</TableHead>
                      <TableHead className="text-right">المادة</TableHead>
                      <TableHead className="text-right">الصف</TableHead>
                      <TableHead className="text-right">المدة</TableHead>
                      <TableHead className="text-right">الدرجة</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{exam.subject}</Badge>
                        </TableCell>
                        <TableCell>{exam.grade}</TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {exam.duration_minutes} دقيقة
                        </TableCell>
                        <TableCell>{exam.total_marks} درجة</TableCell>
                        <TableCell>
                          {exam.is_published ? (
                            <Badge className="bg-green-600">منشور</Badge>
                          ) : (
                            <Badge variant="secondary">مسودة</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => togglePublish(exam.id, exam.is_published)}
                              title={exam.is_published ? 'إلغاء النشر' : 'نشر الامتحان'}
                            >
                              {exam.is_published ? (
                                <XCircle className="w-4 h-4 text-orange-600" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/teacher/exams/${exam.id}/results`}>
                                <Users className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/teacher/exams/${exam.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    
  );
}
