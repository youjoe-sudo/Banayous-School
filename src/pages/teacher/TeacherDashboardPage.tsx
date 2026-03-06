import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, Award, TrendingUp, Plus, Eye, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getExams, getExamResults } from '@/db/api';
import { toast } from 'sonner';

export default function TeacherDashboardPage() {
  const { user, profile } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalExams: 0,
    publishedExams: 0,
    totalStudents: 0,
    averageScore: 0,
  });
  const [recentExams, setRecentExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const examsData = await getExams(user.id);
      setExams(examsData);

      // Calculate stats
      const published = examsData.filter((e) => e.is_published).length;
      
      // Get all results for all exams
      let totalStudents = 0;
      let totalScore = 0;
      let totalResults = 0;

      for (const exam of examsData) {
        const results = await getExamResults(exam.id);
        totalStudents += results.length;
        totalScore += results.reduce((sum, r) => sum + r.score, 0);
        totalResults += results.length;
      }

      const avgScore = totalResults > 0 ? (totalScore / totalResults).toFixed(1) : 0;

      setStats({
        totalExams: examsData.length,
        publishedExams: published,
        totalStudents: totalStudents,
        averageScore: Number(avgScore),
      });

      // Get recent exams (last 5)
      setRecentExams(examsData.slice(0, 5));
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">مرحباً، {profile?.full_name}</h1>
        <p className="text-muted-foreground">لوحة تحكم المعلم - {profile?.subject}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              إجمالي الامتحانات
            </CardDescription>
            <CardTitle className="text-3xl">{stats.totalExams}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              الامتحانات المنشورة
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.publishedExams}</CardTitle>
          </CardHeader>
        </Card>

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
              <TrendingUp className="w-4 h-4" />
              متوسط الدرجات
            </CardDescription>
            <CardTitle className="text-3xl">{stats.averageScore}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-6 flex-col gap-2" asChild>
              <Link to="/teacher/exams/create">
                <Plus className="w-8 h-8" />
                <span>إنشاء امتحان جديد</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-2" asChild>
              <Link to="/teacher/exams">
                <FileText className="w-8 h-8" />
                <span>إدارة الامتحانات</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-2" asChild>
              <Link to="/teacher/results">
                <TrendingUp className="w-8 h-8" />
                <span>النتائج والإحصائيات</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-2" asChild>
              <Link to="/teacher/top-students">
                <Award className="w-8 h-8" />
                <span>الطلاب المتفوقون</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Exams */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              الامتحانات الأخيرة
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/teacher/exams">عرض الكل</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">جاري التحميل...</p>
          ) : recentExams.length === 0 ? (
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
            <div className="space-y-3">
              {recentExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{exam.title}</h3>
                      {exam.is_published ? (
                        <Badge className="bg-green-600">منشور</Badge>
                      ) : (
                        <Badge variant="secondary">مسودة</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{exam.subject}</span>
                      <span>•</span>
                      <span>{exam.grade}</span>
                      <span>•</span>
                      <span>{exam.total_marks} درجة</span>
                      <span>•</span>
                      <span>{exam.duration_minutes} دقيقة</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/teacher/exams/${exam.id}/results`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-500 bg-blue-500/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            💡 <strong>نصيحة:</strong> يمكنك إنشاء امتحانات متنوعة بأنواع أسئلة مختلفة (اختيار من متعدد، صح/خطأ، إجابة قصيرة).
            سيتم تصحيح الامتحانات تلقائياً وعرض النتائج للطلاب فوراً.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
