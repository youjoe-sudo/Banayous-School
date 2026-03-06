import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, BookOpen, Users, Award, Calendar, Bell, LogIn, UserPlus } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">مدرسة بنايوس الثانوية المشتركة</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/login">
                <LogIn className="w-4 h-4 ml-2" />
                تسجيل الدخول
              </Link>
            </Button>
            <Button asChild>
              <Link to="/register">
                <UserPlus className="w-4 h-4 ml-2" />
                إنشاء حساب
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <GraduationCap className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            مرحباً بكم في مدرسة بنايوس الثانوية المشتركة
          </h1>
          <p className="text-xl text-muted-foreground">
            نظام إدارة مدرسي متكامل يوفر تجربة تعليمية متميزة للطلاب والمعلمين وأولياء الأمور
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link to="/register">
                <UserPlus className="w-5 h-5 ml-2" />
                ابدأ الآن
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">
                <LogIn className="w-5 h-5 ml-2" />
                تسجيل الدخول
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">مميزات النظام</h2>
          <p className="text-muted-foreground">نظام شامل لإدارة جميع جوانب العملية التعليمية</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>إدارة الجداول الدراسية</CardTitle>
              <CardDescription>
                جداول منظمة لجميع الصفوف مع إمكانية الطباعة والتعديل
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>إدارة الطلاب والمعلمين</CardTitle>
              <CardDescription>
                نظام متكامل لإدارة بيانات الطلاب والمعلمين بسهولة
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>لوحة الشرف</CardTitle>
              <CardDescription>
                عرض وتكريم الطلاب المتفوقين وتحفيزهم على التميز
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>نظام الامتحانات</CardTitle>
              <CardDescription>
                إنشاء وإدارة الامتحانات ومتابعة نتائج الطلاب
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>نظام الإشعارات</CardTitle>
              <CardDescription>
                إرسال الرسائل والإشعارات للطلاب وأولياء الأمور
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>متابعة الأداء</CardTitle>
              <CardDescription>
                تقارير شاملة عن أداء الطلاب والتقدم الأكاديمي
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section className="container py-16">
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">عن المدرسة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground">
              مدرسة بنايوس الثانوية هي مؤسسة تعليمية رائدة تسعى لتقديم تعليم متميز يواكب التطورات الحديثة
              ويعتمد على أحدث الأساليب التربوية والتقنيات التعليمية.
            </p>
            <p className="text-lg text-muted-foreground">
              نؤمن بأن التعليم هو مفتاح النجاح، ونعمل على توفير بيئة تعليمية محفزة تساعد الطلاب
              على تحقيق أهدافهم وتطوير مهاراتهم الأكاديمية والشخصية.
            </p>
            <div className="grid sm:grid-cols-3 gap-8 pt-8">
              <div>
                <p className="text-4xl font-bold text-primary">170+</p>
                <p className="text-muted-foreground">طالب وطالبة</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">35+</p>
                <p className="text-muted-foreground">معلم ومعلمة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container py-16">
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="py-12 text-center space-y-6">
            <h2 className="text-3xl font-bold">انضم إلينا اليوم</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              سجل الآن للحصول على حساب وابدأ رحلتك التعليمية معنا
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/register">
                  <UserPlus className="w-5 h-5 ml-2" />
                  إنشاء حساب جديد
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container text-center text-muted-foreground">
          <p>© 2026 مدرسة بنايوس الثانوية. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
