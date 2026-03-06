import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, Search, Pencil, Trash2, Download, Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '@/db/api';
import { exportTeachersToExcel, importTeachersFromExcel, downloadTeachersTemplate } from '@/lib/excel';
import { toast } from 'sonner';
import type { Teacher } from '@/types';

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importStats, setImportStats] = useState({ success: 0, failed: 0, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    specialization: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const data = await getTeachers();
      setTeachers(data);
      setFilteredTeachers(data);
    } catch (error) {
      console.error('خطأ في جلب المدرسين:', error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

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

  const handleOpenDialog = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        full_name: teacher.full_name,
        specialization: teacher.specialization,
        phone: teacher.phone || '',
        email: teacher.email || '',
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        full_name: '',
        specialization: '',
        phone: '',
        email: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, formData as any);
        toast.success('تم تحديث المدرس بنجاح');
      } else {
        await createTeacher(formData as any);
        toast.success('تم إضافة المدرس بنجاح');
      }
      setDialogOpen(false);
      fetchTeachers();
    } catch (error) {
      console.error('خطأ في حفظ المدرس:', error);
      toast.error('فشل في حفظ البيانات');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف المدرس ${name}؟`)) return;

    try {
      await deleteTeacher(id);
      toast.success('تم حذف المدرس بنجاح');
      fetchTeachers();
    } catch (error) {
      console.error('خطأ في حذف المدرس:', error);
      toast.error('فشل في حذف المدرس');
    }
  };

  const handleExport = () => {
    try {
      exportTeachersToExcel(filteredTeachers, `teachers_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('تم تصدير البيانات بنجاح');
    } catch (error) {
      console.error('خطأ في التصدير:', error);
      toast.error('فشل في تصدير البيانات');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setImporting(true);
    setImportProgress(0);
    setImportDialogOpen(true);
    setImportStats({ success: 0, failed: 0, total: 0 });

    try {
      toast.info('جاري قراءة الملف...');
      const importedTeachers = await importTeachersFromExcel(file);
      
      if (importedTeachers.length === 0) {
        toast.error('الملف فارغ أو بتنسيق غير صحيح');
        setImportDialogOpen(false);
        setImporting(false);
        return;
      }

      setImportStats({ success: 0, failed: 0, total: importedTeachers.length });

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < importedTeachers.length; i++) {
        const teacher = importedTeachers[i];
        try {
          if (!teacher.full_name || !teacher.specialization) {
            throw new Error('بيانات ناقصة');
          }

          await createTeacher(teacher as any);
          successCount++;
        } catch (error: any) {
          console.error('خطأ في إضافة مدرس:', error);
          errorCount++;
          errors.push(`${teacher.full_name || 'غير معروف'}: ${error.message || 'خطأ غير معروف'}`);
        }

        const progress = Math.round(((i + 1) / importedTeachers.length) * 100);
        setImportProgress(progress);
        setImportStats({ success: successCount, failed: errorCount, total: importedTeachers.length });

        await new Promise(resolve => setTimeout(resolve, 50));
      }

      if (successCount > 0) {
        toast.success(`تم استيراد ${successCount} مدرس بنجاح${errorCount > 0 ? ` (${errorCount} فشل)` : ''}`);
      }
      
      if (errorCount > 0 && errors.length > 0) {
        console.error('أخطاء الاستيراد:', errors);
        toast.error(`فشل استيراد ${errorCount} مدرس. تحقق من وحدة التحكم للتفاصيل.`);
      }

      await fetchTeachers();

      setTimeout(() => {
        setImportDialogOpen(false);
      }, 2000);

    } catch (error) {
      console.error('خطأ في الاستيراد:', error);
      toast.error('فشل في استيراد البيانات. تأكد من تنسيق الملف.');
      setImportDialogOpen(false);
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      downloadTeachersTemplate();
      toast.success('تم تحميل النموذج بنجاح');
    } catch (error) {
      console.error('خطأ في تحميل النموذج:', error);
      toast.error('فشل في تحميل النموذج');
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المدرسين</h1>
          <p className="text-muted-foreground">إضافة وتعديل وحذف المدرسين</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <FileSpreadsheet className="w-4 h-4 ml-2" />
            تحميل النموذج
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            <Upload className="w-4 h-4 ml-2" />
            استيراد Excel
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة مدرس
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTeacher ? 'تعديل مدرس' : 'إضافة مدرس جديد'}</DialogTitle>
              <DialogDescription>
                {editingTeacher ? 'قم بتعديل بيانات المدرس' : 'أدخل بيانات المدرس الجديد'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">الاسم الكامل</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">التخصص</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingTeacher ? 'تحديث' : 'إضافة'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>إجمالي المدرسين</CardDescription>
            <CardTitle className="text-3xl">{teachers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>مدرسو الرياضيات</CardDescription>
            <CardTitle className="text-2xl">
              {teachers.filter((t) => t.specialization === 'رياضيات').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>مدرسو اللغة العربية</CardDescription>
            <CardTitle className="text-2xl">
              {teachers.filter((t) => t.specialization === 'لغة عربية').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>مدرسو العلوم</CardDescription>
            <CardTitle className="text-2xl">
              {teachers.filter((t) => t.specialization === 'علوم').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <Card>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم الكامل</TableHead>
                  <TableHead className="text-right">التخصص</TableHead>
                  <TableHead className="text-right">رقم الهاتف</TableHead>
                  <TableHead className="text-right">البريد الإلكتروني</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      لا توجد نتائج
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.full_name}</TableCell>
                      <TableCell>
                        <Badge className={specializationColors[teacher.specialization] || 'bg-gray-500'}>
                          {teacher.specialization}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{teacher.phone}</TableCell>
                      <TableCell className="text-sm">{teacher.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(teacher)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(teacher.id, teacher.full_name)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Import Progress Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {importing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري استيراد المدرسين...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  اكتمل الاستيراد
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {importing ? 'يرجى الانتظار حتى يكتمل الاستيراد' : 'تم الانتهاء من عملية الاستيراد'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>التقدم</span>
                <span className="font-medium">{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">{importStats.total}</p>
                <p className="text-xs text-muted-foreground">إجمالي</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-green-600">{importStats.success}</p>
                <p className="text-xs text-muted-foreground">نجح</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-red-600">{importStats.failed}</p>
                <p className="text-xs text-muted-foreground">فشل</p>
              </div>
            </div>
            {!importing && importStats.failed > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ بعض المدرسين لم يتم استيرادهم. تحقق من وحدة التحكم للتفاصيل.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
