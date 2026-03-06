import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, Users, BookOpen, Calendar, Award, ArrowLeft, Newspaper } from 'lucide-react';
import { getNews, getStatistics } from '@/db/api';
import type { News } from '@/types';

export default function HomePage() {
  const [news, setNews] = useState<News[]>([]);
  const [stats, setStats] = useState({ students: 0, teachers: 0, news: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsData, statsData] = await Promise.all([
          getNews(3),
          getStatistics()
        ]);
        setNews(newsData);
        setStats(statsData);
      } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: Users,
      title: 'قائمة الطلاب',
      description: 'عرض وإدارة معلومات جميع الطلاب',
      link: '/students',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      count: stats.students,
    },
    {
      icon: BookOpen,
      title: 'قائمة المدرسين',
      description: 'عرض معلومات المدرسين وتخصصاتهم',
      link: '/teachers',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      count: stats.teachers,
    },
    {
      icon: Calendar,
      title: 'جداول الحصص',
      description: 'عرض جداول الحصص لجميع الصفوف',
      link: '/schedules',
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
      count: 5,
    },
    {
      icon: Award,
      title: 'لوحة الشرف',
      description: 'عرض الطلاب المتفوقين والأوائل',
      link: '/honor',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-600/10',
      count: 15,
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/20 via-background to-secondary/20 py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <GraduationCap className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">نظام إدارة مدرسي متكامل</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                مرحباً بكم في
                <span className="block gradient-text mt-2">نظام إدارة المدرسة</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                نظام شامل لإدارة المدرسة يتضمن معلومات الطلاب والمدرسين وجداول الحصص ولوحة الشرف
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link to="/students">
                    <Users className="w-5 h-5 ml-2" />
                    عرض الطلاب
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/schedules">
                    <Calendar className="w-5 h-5 ml-2" />
                    الجداول الدراسية
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative animate-slide-in">
              <img
                src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_b15ba436-7d6c-41fc-bf4a-31db658cced7.jpg"
                alt="مبنى المدرسة"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">الخدمات المتاحة</h2>
            <p className="text-muted-foreground">استكشف جميع خدمات النظام المدرسي</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    {feature.title}
                    <Badge variant="secondary">{feature.count}</Badge>
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link to={feature.link}>
                      عرض التفاصيل
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">آخر الأخبار</h2>
              <p className="text-muted-foreground">تابع آخر أخبار وفعاليات المدرسة</p>
            </div>
            <Newspaper className="w-8 h-8 text-primary" />
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 bg-muted" />
                    <Skeleton className="h-4 w-1/2 bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {news.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>
                      {new Date(item.published_at).toLocaleDateString('ar-SA')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">عن المدرسة</h2>
              <p className="text-muted-foreground leading-relaxed">
                نحن مؤسسة تعليمية رائدة نسعى لتقديم أفضل تجربة تعليمية لطلابنا. نوفر بيئة تعليمية محفزة
                ومتطورة تساعد الطلاب على تحقيق أهدافهم الأكاديمية والشخصية.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-3xl font-bold text-primary">{stats.students}+</div>
                  <div className="text-sm text-muted-foreground mt-1">طالب</div>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-3xl font-bold text-secondary">{stats.teachers}+</div>
                  <div className="text-sm text-muted-foreground mt-1">مدرس</div>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-3xl font-bold text-chart-3">5</div>
                  <div className="text-sm text-muted-foreground mt-1">صفوف</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_16f57b52-1236-4036-957f-11a0325e670c.jpg"
                alt="طلاب يدرسون"
                className="rounded-lg shadow-lg"
              />
              <img
                src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_315d97f8-2d3b-4238-82b7-d411f9c8e26f.jpg"
                alt="مدرس يعلم"
                className="rounded-lg shadow-lg mt-8"
              />
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
