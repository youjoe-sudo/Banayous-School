import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Award, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentExams } from '@/db/api';
import { toast } from 'sonner';

export default function StudentExamsPage() {
  const { user, profile } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, [user, profile]);

  const fetchExams = async () => {
    if (!user || !profile?.grade) return;

    try {
      const data = await getStudentExams(user.id, profile.grade);
      setExams(data);
    } catch (error) {
      console.error('خطأ في جلب الامتحانات:', error);
      toast.error('فشل في جلب الامتحانات');
    } finally {
      setLoading(false);
    }
  };

  const isExamAvailable = (exam: any) => {
    const now = new Date();
    const start = exam.start_date ? new Date(exam.start_date) : null;
    const end = exam.end_date ? new Date(exam.end_date) : null;

    if (start && start > now) return false;
    if (end && end < now) return false;
    return true;
  };

  const hasSubmitted = (exam: any) => {
    return exam.exam_results && exam.exam_results.length > 0;
  };

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">الامتحانات</h1>
          <p className="text-muted-foreground">الامتحانات المتاحة لصفك</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>إجمالي الامتحانات</CardDescription>
              <CardTitle className="text-3xl">{exams.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>تم الحل</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {exams.filter((e) => hasSubmitted(e)).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>لم يتم الحل</CardDescription>
              <CardTitle className="text-3xl text-orange-600">
                {exams.filter((e) => !hasSubmitted(e)).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Exams List */}
        {loading ? (
          <p className="text-center text-muted-foreground">جاري التحميل...</p>
        ) : exams.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد امتحانات متاحة حالياً</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {exams.map((exam) => {
              const submitted = hasSubmitted(exam);
              const available = isExamAvailable(exam);
              const result = submitted ? exam.exam_results[0] : null;

              return (
                <Card key={exam.id} className={submitted ? 'border-green-500' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{exam.title}</CardTitle>
                        <CardDescription>{exam.description}</CardDescription>
                      </div>
                      {submitted && (
                        <Badge className="bg-green-600">
                          <CheckCircle className="w-3 h-3 ml-1" />
                          تم الحل
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">المادة</p>
                        <Badge variant="outline">{exam.subject}</Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground">المدرس</p>
                        <p className="font-medium">{exam.teacher?.full_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">المدة</p>
                        <p className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {exam.duration_minutes} دقيقة
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">الدرجة الكلية</p>
                        <p className="font-medium">{exam.total_marks} درجة</p>
                      </div>
                    </div>

                    {exam.start_date && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">متاح من</p>
                        <p>{new Date(exam.start_date).toLocaleString('ar-SA')}</p>
                      </div>
                    )}

                    {exam.end_date && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">متاح حتى</p>
                        <p>{new Date(exam.end_date).toLocaleString('ar-SA')}</p>
                      </div>
                    )}

                    {submitted && result && (
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">درجتك:</span>
                          <span className="text-2xl font-bold">
                            {result.score} / {result.total_marks}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">النسبة:</span>
                          <span className="font-medium">
                            {((result.score / result.total_marks) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">الحالة:</span>
                          {result.passed ? (
                            <Badge className="bg-green-600">ناجح</Badge>
                          ) : (
                            <Badge variant="destructive">راسب</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {!submitted && (
                      <Button
                        className="w-full"
                        asChild
                        disabled={!available}
                      >
                        <Link to={`/student/exams/${exam.id}/take`}>
                          <FileText className="w-4 h-4 ml-2" />
                          {available ? 'ابدأ الامتحان' : 'غير متاح حالياً'}
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
