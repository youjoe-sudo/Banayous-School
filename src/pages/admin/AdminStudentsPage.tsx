import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Plus, Search, Pencil, Trash2, Download, Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { getStudents, deleteStudent, createStudent } from '@/db/api';
import { exportStudentsToExcel, importStudentsFromExcel, downloadStudentsTemplate } from '@/lib/excel';
import { toast } from 'sonner';
import type { Student } from '@/types';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importStats, setImportStats] = useState({ success: 0, failed: 0, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error('خطأ في جلب الطلاب:', error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(
        (student) =>
          student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.student_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف الطالب ${name}؟`)) return;

    try {
      await deleteStudent(id);
      toast.success('تم حذف الطالب بنجاح');
      fetchStudents();
    } catch (error) {
      console.error('خطأ في حذف الطالب:', error);
      toast.error('فشل في حذف الطالب');
    }
  };

  const handleExport = () => {
    try {
      exportStudentsToExcel(filteredStudents, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      // Parse Excel file
      toast.info('جاري قراءة الملف...');
      const importedStudents = await importStudentsFromExcel(file);
      
      if (importedStudents.length === 0) {
        toast.error('الملف فارغ أو بتنسيق غير صحيح');
        setImportDialogOpen(false);
        setImporting(false);
        return;
      }

      setImportStats({ success: 0, failed: 0, total: importedStudents.length });

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Import students one by one with progress
      for (let i = 0; i < importedStudents.length; i++) {
        const student = importedStudents[i];
        try {
          // Validate required fields
          if (!student.student_number || !student.full_name || !student.grade) {
            throw new Error('بيانات ناقصة');
          }

          await createStudent(student as any);
          successCount++;
        } catch (error: any) {
          console.error('خطأ في إضافة طالب:', error);
          errorCount++;
          errors.push(`${student.full_name || 'غير معروف'}: ${error.message || 'خطأ غير معروف'}`);
        }

        // Update progress
        const progress = Math.round(((i + 1) / importedStudents.length) * 100);
        setImportProgress(progress);
        setImportStats({ success: successCount, failed: errorCount, total: importedStudents.length });

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Show results
      if (successCount > 0) {
        toast.success(`تم استيراد ${successCount} طالب بنجاح${errorCount > 0 ? ` (${errorCount} فشل)` : ''}`);
      }
      
      if (errorCount > 0 && errors.length > 0) {
        console.error('أخطاء الاستيراد:', errors);
        toast.error(`فشل استيراد ${errorCount} طالب. تحقق من وحدة التحكم للتفاصيل.`);
      }

      // Refresh student list
      await fetchStudents();

      // Close dialog after a short delay
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
      downloadStudentsTemplate();
      toast.success('تم تحميل النموذج بنجاح');
    } catch (error) {
      console.error('خطأ في تحميل النموذج:', error);
      toast.error('فشل في تحميل النموذج');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الطلاب</h1>
          <p className="text-muted-foreground">إضافة وتعديل وحذف الطلاب</p>
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
          <Button>
            <Plus className="w-4 h-4 ml-2" />
            إضافة طالب
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>إجمالي الطلاب</CardDescription>
            <CardTitle className="text-3xl">{students.length}</CardTitle>
          </CardHeader>
        </Card>
        {['فصل 1/1', 'فصل 1/2', 'فصل 1/3'].map((grade) => (
          <Card key={grade}>
            <CardHeader className="pb-3">
              <CardDescription>{grade}</CardDescription>
              <CardTitle className="text-2xl">
                {students.filter((s) => s.grade === grade).length}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
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
              placeholder="البحث بالاسم أو رقم الطالب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            قائمة الطلاب ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الطالب</TableHead>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">الصف</TableHead>
                  <TableHead className="text-right">رقم ولي الأمر</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      لا توجد نتائج
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono">{student.student_number}</TableCell>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>
                        <Badge>{student.grade}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">{student.parent_phone}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(student.id, student.full_name)}
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
                  جاري استيراد الطلاب...
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
                  ⚠️ بعض الطلاب لم يتم استيرادهم. تحقق من وحدة التحكم للتفاصيل.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
