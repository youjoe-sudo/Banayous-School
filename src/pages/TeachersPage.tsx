import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, BookOpen, Mail, Phone } from 'lucide-react';
import { getTeachers } from '@/db/api';
import type { Teacher } from '@/types';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await getTeachers();
        setTeachers(data);
        setFilteredTeachers(data);
      } catch (error) {
        console.error('خطأ في جلب المدرسين:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = teachers.filter(
        (teacher) =>
          teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTeachers(filtered);
    } else {
      setFilteredTeachers(teachers);
    }
  }, [searchTerm, teachers]);

  const specializationColors: Record<string, string> = {
    'رياضيات': 'bg-blue-500',
    'لغة عربية': 'bg-green-500',
    'علوم': 'bg-purple-500',
    'لغة إنجليزية': 'bg-orange-500',
    'تاريخ': 'bg-yellow-600',
    'جغرافيا': 'bg-teal-500',
    'تربية إسلامية': 'bg-indigo-500',
    'فنون': 'bg-pink-500',
    'رياضة': 'bg-red-500',
    'موسيقى': 'bg-violet-500',
    'حاسوب': 'bg-cyan-500',
    'كيمياء': 'bg-lime-600',
    'فيزياء': 'bg-sky-600',
    'أحياء': 'bg-emerald-600',
  };

  const getSpecializationColor = (spec: string) => {
    return specializationColors[spec] || 'bg-gray-500';
  };

  // Group teachers by specialization
  const teachersBySpec = teachers.reduce((acc, teacher) => {
    if (!acc[teacher.specialization]) {
      acc[teacher.specialization] = [];
    }
    acc[teacher.specialization].push(teacher);
    return acc;
  }, {} as Record<string, Teacher[]>);

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">قائمة المدرسين</h1>
              <p className="text-muted-foreground">عرض معلومات المدرسين وتخصصاتهم</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>إجمالي المدرسين</CardDescription>
              <CardTitle className="text-3xl">{teachers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>التخصصات</CardDescription>
              <CardTitle className="text-3xl">{Object.keys(teachersBySpec).length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>مدرسو الرياضيات</CardDescription>
              <CardTitle className="text-3xl">
                {teachers.filter((t) => t.specialization === 'رياضيات').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>مدرسو اللغة العربية</CardDescription>
              <CardTitle className="text-3xl">
                {teachers.filter((t) => t.specialization === 'لغة عربية').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>البحث</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالاسم أو التخصص..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              قائمة المدرسين ({filteredTeachers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full bg-muted" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الاسم الكامل</TableHead>
                      <TableHead className="text-right">التخصص</TableHead>
                      <TableHead className="text-right">رقم الهاتف</TableHead>
                      <TableHead className="text-right">البريد الإلكتروني</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          لا توجد نتائج
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTeachers.map((teacher) => (
                        <TableRow key={teacher.id}>
                          <TableCell className="font-medium">{teacher.full_name}</TableCell>
                          <TableCell>
                            <Badge className={getSpecializationColor(teacher.specialization)}>
                              {teacher.specialization}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="font-mono">{teacher.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{teacher.email}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
