import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Trophy, Medal, Star } from 'lucide-react';
import { getHonorBoard } from '@/db/api';
import type { HonorBoard, GradeLevel } from '@/types';

export default function HonorBoardPage() {
  const [honorBoard, setHonorBoard] = useState<HonorBoard[]>([]);
  const [loading, setLoading] = useState(true);

  const grades: GradeLevel[] = ['فصل 1/1', 'فصل 1/2', 'فصل 1/3', 'فصل 1/4', 'فصل 1/5'];

  useEffect(() => {
    const fetchHonorBoard = async () => {
      try {
        const data = await getHonorBoard();
        setHonorBoard(data);
      } catch (error) {
        console.error('خطأ في جلب لوحة الشرف:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHonorBoard();
  }, []);

  const getHonorForGrade = (grade: GradeLevel) => {
    return honorBoard.filter((h) => h.grade === grade).sort((a, b) => a.rank - b.rank);
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Medal className="w-8 h-8 text-orange-600" />;
      default:
        return <Star className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500';
      case 2:
        return 'from-gray-400/20 to-gray-500/20 border-gray-400';
      case 3:
        return 'from-orange-500/20 to-orange-600/20 border-orange-500';
      default:
        return 'from-muted/20 to-muted/20 border-border';
    }
  };

  const getRankText = (rank: number) => {
    switch (rank) {
      case 1:
        return 'المركز الأول 🥇';
      case 2:
        return 'المركز الثاني 🥈';
      case 3:
        return 'المركز الثالث 🥉';
      default:
        return `المركز ${rank}`;
    }
  };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">لوحة الشرف</h1>
          <p className="text-muted-foreground text-lg">تكريم الطلاب المتفوقين والأوائل</p>
          <Badge variant="secondary" className="mt-4">
            الفصل الدراسي الأول - 2026
          </Badge>
        </div>

        {/* Honor Board by Grade */}
        <div className="space-y-8">
          {grades.map((grade) => {
            const gradeHonors = getHonorForGrade(grade);

            return (
              <Card key={grade} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <CardTitle className="text-2xl">{grade}</CardTitle>
                  <CardDescription>أوائل الصف للفصل الدراسي الأول</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="grid md:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 bg-muted" />
                      ))}
                    </div>
                  ) : gradeHonors.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      لا توجد بيانات لهذا الصف
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                      {gradeHonors.map((honor) => (
                        <Card
                          key={honor.id}
                          className={`relative overflow-hidden bg-gradient-to-br ${getMedalColor(honor.rank)} border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                        >
                          <CardHeader className="text-center pb-4">
                            <div className="flex justify-center mb-4">
                              {getMedalIcon(honor.rank)}
                            </div>
                            <CardTitle className="text-xl">
                              {honor.student?.full_name}
                            </CardTitle>
                            <CardDescription className="text-base font-medium">
                              {getRankText(honor.rank)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="text-center">
                            <div className="inline-flex flex-col items-center justify-center w-24 h-24 rounded-full bg-background/80 backdrop-blur-sm border-2 border-primary/20">
                              <span className="text-3xl font-bold text-primary">
                                {honor.total_score.toFixed(2)}
                              </span>
                              <span className="text-xs text-muted-foreground">من 100</span>
                            </div>
                            <div className="mt-4 space-y-1">
                              <p className="text-sm text-muted-foreground">
                                رقم الطالب: {honor.student?.student_number}
                              </p>
                            </div>
                          </CardContent>
                          {/* Decorative elements */}
                          {honor.rank === 1 && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Congratulations Message */}
        <Card className="mt-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">مبروك للطلاب المتفوقين!</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              نهنئ جميع الطلاب المتفوقين على إنجازاتهم المميزة ونتمنى لهم المزيد من التفوق والنجاح.
              استمروا في العمل الجاد والاجتهاد لتحقيق أحلامكم.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
