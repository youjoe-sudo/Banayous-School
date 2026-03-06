import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, TrendingUp, Users, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getExams, getExamResults } from '@/db/api';
import { toast } from 'sonner';

export default function ResultsStatsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    passed: 0,
    failed: 0,
    average: 0,
    highest: 0,
    lowest: 0,
  });
  const [gradeDistribution, setGradeDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, [user]);

  useEffect(() => {
    if (selectedExam) {
      fetchStats();
    }
  }, [selectedExam]);

  const fetchExams = async () => {
    if (!user) return;

    try {
      const data = await getExams(user.id);
      const publishedExams = data.filter((e) => e.is_published);
      setExams(publishedExams);
      if (publishedExams.length > 0) {
        setSelectedExam(publishedExams[0].id);
      }
    } catch (error) {
      console.error('خطأ في جلب الامتحانات:', error);
      toast.error('فشل في جلب الامتحانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!selectedExam) return;

    try {
      const results = await getExamResults(selectedExam);

      if (results.length === 0) {
        setStats({
          totalStudents: 0,
          passed: 0,
          failed: 0,
          average: 0,
          highest: 0,
          lowest: 0,
        });
        setGradeDistribution([]);
        return;
      }

      const passed = results.filter((r) => r.passed).length;
      const failed = results.length - passed;
      const scores = results.map((r) => r.score);
      const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      const highest = Math.max(...scores);
      const lowest = Math.min(...scores);

      setStats({
        totalStudents: results.length,
        passed,
        failed,
        average: Number(average.toFixed(1)),
        highest,
        lowest,
      });

      // Calculate grade distribution
      const ranges = [
        { label: '90-100', min: 90, max: 100, count: 0 },
        { label: '80-89', min: 80, max: 89, count: 0 },
        { label: '70-79', min: 70, max: 79, count: 0 },
        { label: '60-69', min: 60, max: 69, count: 0 },
        { label: '50-59', min: 50, max: 59, count: 0 },
        { label: 'أقل من 50', min: 0, max: 49, count: 0 },
      ];

      results.forEach((result) => {
        const percentage = (result.score / result.total_marks) * 100;
        const range = ranges.find((r) => percentage >= r.min && percentage <= r.max);
        if (range) range.count++;
      });

      setGradeDistribution(ranges);
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
      toast.error('فشل في جلب الإحصائيات');
    }
  };

  const selectedExamData = exams.find((e) => e.id === selectedExam);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">النتائج والإحصائيات</h1>
          <p className="text-muted-foreground">تحليل شامل لنتائج الامتحانات</p>
        </div>
        {exams.length > 0 && (
          <div className="w-64">
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الامتحان" />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Exam Info */}
      {selectedExamData && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedExamData.title}</CardTitle>
            <CardDescription>{selectedExamData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">المادة</p>
                <Badge variant="outline">{selectedExamData.subject}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الصف</p>
                <p className="font-medium">{selectedExamData.grade}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الدرجة الكلية</p>
                <p className="font-medium">{selectedExamData.total_marks} درجة</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">درجة النجاح</p>
                <p className="font-medium">{selectedExamData.passing_marks} درجة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              عدد الطلاب
            </CardDescription>
            <CardTitle className="text-3xl">{stats.totalStudents}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              الناجحون
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.passed}</CardTitle>
            <CardDescription>
              {stats.totalStudents > 0
                ? `${((stats.passed / stats.totalStudents) * 100).toFixed(1)}%`
                : '0%'}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              الراسبون
            </CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.failed}</CardTitle>
            <CardDescription>
              {stats.totalStudents > 0
                ? `${((stats.failed / stats.totalStudents) * 100).toFixed(1)}%`
                : '0%'}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>المتوسط</CardDescription>
            <CardTitle className="text-3xl">{stats.average}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>أعلى درجة</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.highest}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>أقل درجة</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{stats.lowest}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            توزيع الدرجات
          </CardTitle>
          <CardDescription>عدد الطلاب في كل نطاق درجات</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.totalStudents === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              لا توجد نتائج بعد
            </p>
          ) : (
            <div className="space-y-4">
              {gradeDistribution.map((range) => {
                const percentage =
                  stats.totalStudents > 0
                    ? (range.count / stats.totalStudents) * 100
                    : 0;

                return (
                  <div key={range.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{range.label}</span>
                      <span className="text-muted-foreground">
                        {range.count} طالب ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
