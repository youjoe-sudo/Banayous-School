import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, UserPlus, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole, GradeLevel } from '@/types';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole,
    grade: '' as GradeLevel | '',
    studentName: '', // For parents to specify their child's name
    subject: '', // For teachers to specify their subject
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z\d]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const getStrengthColor = (strength: number): string => {
    if (strength < 40) return 'bg-destructive';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-secondary';
  };

  const getStrengthText = (strength: number): string => {
    if (strength < 40) return 'ضعيفة';
    if (strength < 70) return 'متوسطة';
    return 'قوية';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    if (formData.role === 'student' && !formData.grade) {
      setError('يرجى اختيار الصف');
      return;
    }

    if (formData.role === 'teacher' && !formData.subject) {
      setError('يرجى اختيار المادة التي تدرسها');
      return;
    }

    if (formData.role === 'parent' && !formData.studentName) {
      setError('يرجى إدخال اسم الطالب');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        role: formData.role,
        grade: formData.grade || undefined,
        studentName: formData.studentName || undefined,
        subject: formData.subject || undefined,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError('البريد الإلكتروني مسجل مسبقاً');
        } else {
          setError('حدث خطأ أثناء التسجيل');
        }
        toast.error('فشل التسجيل');
      } else {
        if (formData.role === 'parent' || formData.role === 'teacher') {
          toast.success('تم التسجيل بنجاح! حسابك قيد المراجعة من قبل المدير.');
        } else {
          toast.success('تم التسجيل بنجاح');
        }
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">نظام إدارة المدرسة</h1>
          <p className="text-muted-foreground">إنشاء حساب جديد</p>
        </div>

        <Card className="glass border-2">
          <CardHeader>
            <CardTitle className="text-2xl text-center">التسجيل</CardTitle>
            <CardDescription className="text-center">
              أدخل بياناتك لإنشاء حساب جديد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">الاسم الكامل</Label>
                  <Input
                    id="fullName"
                    placeholder="أحمد محمد علي"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@school.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0501234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">الدور</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                    disabled={loading}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">طالب</SelectItem>
                      <SelectItem value="teacher">مدرس</SelectItem>
                      <SelectItem value="parent">ولي أمر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.role === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="grade">الصف</Label>
                  <Select
                    value={formData.grade}
                    onValueChange={(value) => setFormData({ ...formData, grade: value as GradeLevel })}
                    disabled={loading}
                  >
                    <SelectTrigger id="grade">
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="فصل 1/1">فصل 1/1</SelectItem>
                      <SelectItem value="فصل 1/2">فصل 1/2</SelectItem>
                      <SelectItem value="فصل 1/3">فصل 1/3</SelectItem>
                      <SelectItem value="فصل 1/4">فصل 1/4</SelectItem>
                      <SelectItem value="فصل 1/5">فصل 1/5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.role === 'teacher' && (
                <div className="space-y-2">
                  <Label htmlFor="subject">المادة التي تدرسها *</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    disabled={loading}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="اختر المادة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="الرياضيات">الرياضيات</SelectItem>
                      <SelectItem value="اللغة العربية">اللغة العربية</SelectItem>
                      <SelectItem value="اللغة الإنجليزية">اللغة الإنجليزية</SelectItem>
                      <SelectItem value="العلوم">العلوم</SelectItem>
                      <SelectItem value="الدراسات الاجتماعية">الدراسات الاجتماعية</SelectItem>
                      <SelectItem value="التربية الإسلامية">التربية الإسلامية</SelectItem>
                      <SelectItem value="التربية الفنية">التربية الفنية</SelectItem>
                      <SelectItem value="التربية الرياضية">التربية الرياضية</SelectItem>
                      <SelectItem value="الحاسوب">الحاسوب</SelectItem>
                      <SelectItem value="الموسيقى">الموسيقى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.role === 'parent' && (
                <div className="space-y-2">
                  <Label htmlFor="studentName">اسم الطالب (ابنك/ابنتك)</Label>
                  <Input
                    id="studentName"
                    placeholder="أدخل اسم الطالب"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    سيقوم المدير بربط حسابك بحساب الطالب بعد الموافقة
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {formData.password && (
                    <div className="space-y-1">
                      <Progress value={passwordStrength} className={getStrengthColor(passwordStrength)} />
                      <p className="text-xs text-muted-foreground">
                        قوة كلمة المرور: {getStrengthText(passwordStrength)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></span>
                    جاري التسجيل...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    إنشاء حساب
                  </span>
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
                <Link to="/login" className="text-primary hover:underline font-medium">
                  سجل الدخول
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>© 2026 نظام إدارة المدرسة. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
}
