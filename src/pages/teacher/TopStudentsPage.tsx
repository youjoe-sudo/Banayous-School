import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Trophy, Medal, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getExams, getExamResults } from '@/db/api';
import { toast } from 'sonner';

export default function TopStudentsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, [user]);

  useEffect(() => {
    if (exams.length > 0) {
      fetchTopStudents();
    }
  }, [selectedExam, exams]);

  const fetchExams = async () => {
    if (!user) return;

    try {
      const data = await getExams(user.id);
      setExams(data.filter((e) => e.is_published));
    } catch (error) {
      console.error('خطأ في جلب الامتحانات:', error);
      toast.error('فشل في جلب الامتحانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopStudents = async () => {
    try {
      let allResults: any[] = [];

      if (selectedExam === 'all') {
        // Get results from all exams
        for (const exam of exams) {
          const results = await getExamResults(exam.id);
          allResults = [...allResults, ...results.map((r) => ({ ...r, exam }))];
        }
      } else {
        // Get results from selected exam
        const results = await getExamResults(selectedExam);
        const exam = exams.find((e) => e.id === selectedExam);
        allResults = results.map((r) => ({ ...r, exam }));
      }

      // Sort by score and get top 10
      const sorted = allResults
        .sort((a, b) => {
          const percentA = (a.score / a.total_marks) * 100;
          const percentB = (b.score / b.total_marks) * 100;
          return percentB - percentA;
        })
        .slice(0, 10);

      setTopStudents(sorted);
    } catch (error) {
      console.error('خطأ في جلب الطلاب المتفوقين:', error);
      toast.error('فشل في جلب الطلاب المتفوقين');
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Award className="w-8 h-8 text-orange-600" />;
      default:
        return <Star className="w-8 h-8 text-blue-500" />;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-500">المركز الأول</Badge>;
      case 2:
        return <Badge className="bg-gray-400">المركز الثاني</Badge>;
      case 3:
        return <Badge className="bg-orange-600">المركز الثالث</Badge>;
      default:
        return <Badge variant="secondary">المركز {rank}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الطلاب المتفوقون</h1>
          <p className="text-muted-foreground">أفضل الطلاب في الامتحانات</p>
        </div>
        <div className="w-64">
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الامتحان" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الامتحانات</SelectItem>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top 3 Students */}
      {topStudents.length >= 3 && (
        <div className="grid md:grid-cols-3 gap-6">
          {topStudents.slice(0, 3).map((result, index) => (
            <Card
              key={result.id}
              className={`border-2 ${
                index === 0
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                  : index === 1
                  ? 'border-gray-400 bg-gray-50 dark:bg-gray-950/20'
                  : 'border-orange-600 bg-orange-50 dark:bg-orange-950/20'
              }`}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">{getRankIcon(index + 1)}</div>
                <CardTitle className="text-xl">{result.student.full_name}</CardTitle>
                <CardDescription>{result.student.student_number}</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <div>
                  <p className="text-3xl font-bold">
                    {result.score} / {result.total_marks}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {((result.score / result.total_marks) * 100).toFixed(1)}%
                  </p>
                </div>
                {selectedExam === 'all' && (
                  <div>
                    <p className="text-sm text-muted-foreground">الامتحان</p>
                    <p className="font-medium">{result.exam.title}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">الصف</p>
                  <Badge variant="outline">{result.student.grade}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* All Top Students */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلاب المتفوقين</CardTitle>
          <CardDescription>أفضل 10 طلاب حسب الدرجات</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">جاري التحميل...</p>
          ) : topStudents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              لا توجد نتائج بعد
            </p>
          ) : (
            <div className="space-y-3">
              {topStudents.map((result, index) => (
                <div
                  key={result.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                    {getRankIcon(index + 1)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{result.student?.full_name || 'غير متوفر'}</h3>
                      {getRankBadge(index + 1)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{result.student?.grade || '-'}</span>
                      {selectedExam === 'all' && (
                        <>
                          <span>•</span>
                          <span>{result.exam?.title || 'غير متوفر'}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold">
                      {result.score} / {result.total_marks}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {((result.score / result.total_marks) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
