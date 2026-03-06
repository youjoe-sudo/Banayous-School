import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, Download, Trophy } from 'lucide-react';
import { getExamById, getExamResults, createCertificate } from '@/db/api';
import { toast } from 'sonner';

export default function ExamResultsPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [examId]);

  const fetchData = async () => {
    if (!examId) return;

    try {
      const [examData, resultsData] = await Promise.all([
        getExamById(examId),
        getExamResults(examId),
      ]);
      setExam(examData);
      setResults(resultsData);
    } catch (error) {
      console.error('خطأ في جلب النتائج:', error);
      toast.error('فشل في جلب النتائج');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async (result: any, rank: number) => {
    try {
      await createCertificate({
        student_id: result.student_id,
        exam_id: examId!,
        certificate_type: rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze',
        issue_date: new Date().toISOString(),
        certificate_data: {
          student_name: result.student.full_name,
          exam_title: exam.title,
          score: result.score,
          total_marks: result.total_marks,
          rank: rank,
          grade: result.student.grade,
          subject: exam.subject,
        },
      });
      toast.success(`تم إنشاء شهادة ${rank === 1 ? 'ذهبية' : rank === 2 ? 'فضية' : 'برونزية'} للطالب ${result.student.full_name}`);
    } catch (error) {
      console.error('خطأ في إنشاء الشهادة:', error);
      toast.error('فشل في إنشاء الشهادة');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-center text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="space-y-6">
        <p className="text-center text-muted-foreground">الامتحان غير موجود</p>
      </div>
    );
  }

  const passedCount = results.filter((r) => r.passed).length;
  const averageScore = results.length > 0
    ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(2)
    : 0;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">{exam.title}</h1>
          <p className="text-muted-foreground">نتائج الطلاب</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>عدد الطلاب</CardDescription>
              <CardTitle className="text-3xl">{results.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>الناجحون</CardDescription>
              <CardTitle className="text-3xl text-green-600">{passedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>الراسبون</CardDescription>
              <CardTitle className="text-3xl text-red-600">{results.length - passedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>المتوسط</CardDescription>
              <CardTitle className="text-3xl">{averageScore}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Top 3 Students */}
        {results.length >= 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                الطلاب المتفوقون
              </CardTitle>
              <CardDescription>أفضل 3 طلاب في الامتحان</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {results.slice(0, 3).map((result, index) => (
                  <Card key={result.id} className={`border-2 ${
                    index === 0 ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' :
                    index === 1 ? 'border-gray-400 bg-gray-50 dark:bg-gray-950/20' :
                    'border-orange-600 bg-orange-50 dark:bg-orange-950/20'
                  }`}>
                    <CardHeader className="text-center">
                      <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{
                        backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : '#ea580c'
                      }}>
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-lg">{result.student.full_name}</CardTitle>
                      <CardDescription>{result.student.student_number}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-2">
                      <p className="text-2xl font-bold">{result.score} / {result.total_marks}</p>
                      <p className="text-sm text-muted-foreground">
                        {((result.score / result.total_marks) * 100).toFixed(1)}%
                      </p>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleGenerateCertificate(result, index + 1)}
                      >
                        <Award className="w-4 h-4 ml-2" />
                        إنشاء شهادة
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Results */}
        <Card>
          <CardHeader>
            <CardTitle>جميع النتائج</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                لم يقم أي طالب بحل الامتحان بعد
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الترتيب</TableHead>
                      <TableHead className="text-right">الطالب</TableHead>
                      <TableHead className="text-right">الصف</TableHead>
                      <TableHead className="text-right">الدرجة</TableHead>
                      <TableHead className="text-right">النسبة</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{result.student?.full_name || 'غير متوفر'}</TableCell>
                        <TableCell>{result.student?.grade || '-'}</TableCell>
                        <TableCell className="font-bold">
                          {result.score} / {result.total_marks}
                        </TableCell>
                        <TableCell>
                          {((result.score / result.total_marks) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          {result.passed ? (
                            <Badge className="bg-green-600">ناجح</Badge>
                          ) : (
                            <Badge variant="destructive">راسب</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(result.submitted_at).toLocaleDateString('ar-SA')}
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
