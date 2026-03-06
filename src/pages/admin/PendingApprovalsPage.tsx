import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, UserCheck, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getPendingApprovals, approveUser, rejectUser, getAllStudentsForLinking, updateProfile } from '@/db/api';
import { toast } from 'sonner';
import type { Profile } from '@/types';

export default function PendingApprovalsPage() {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Profile | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [editingRole, setEditingRole] = useState<{ [key: string]: string }>({});
  const [editingName, setEditingName] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingData, studentsData] = await Promise.all([
        getPendingApprovals(),
        getAllStudentsForLinking(),
      ]);
      setPendingUsers(pendingData);
      setStudents(studentsData);
      
      // Initialize editing roles and names with current values
      const roles: { [key: string]: string } = {};
      const names: { [key: string]: string } = {};
      pendingData.forEach(user => {
        roles[user.id] = user.role;
        names[user.id] = user.full_name || '';
      });
      setEditingRole(roles);
      setEditingName(names);
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setEditingRole(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  const handleNameChange = (userId: string, newName: string) => {
    setEditingName(prev => ({
      ...prev,
      [userId]: newName
    }));
  };

  const handleApprove = async (userId: string) => {
    if (!user) return;

    setActionLoading(userId);
    try {
      const updates: any = {};
      
      // Update role if it was changed
      const newRole = editingRole[userId];
      const currentUser = pendingUsers.find(u => u.id === userId);
      
      if (newRole && currentUser && newRole !== currentUser.role) {
        updates.role = newRole;
      }
      
      // Update name if it was changed or is empty
      const newName = editingName[userId];
      if (newName && (!currentUser?.full_name || newName !== currentUser.full_name)) {
        updates.full_name = newName;
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await updateProfile(userId, updates);
      }
      
      await approveUser(userId, user.id);
      toast.success('تمت الموافقة على الحساب');
      fetchData();
    } catch (error) {
      console.error('خطأ في الموافقة:', error);
      toast.error('فشل في الموافقة على الحساب');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!user) return;

    const confirm = window.confirm('هل أنت متأكد من رفض هذا الحساب؟');
    if (!confirm) return;

    setActionLoading(userId);
    try {
      await rejectUser(userId, user.id);
      toast.success('تم رفض الحساب');
      fetchData();
    } catch (error) {
      console.error('خطأ في الرفض:', error);
      toast.error('فشل في رفض الحساب');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenLinkDialog = (parent: Profile) => {
    setSelectedParent(parent);
    setSelectedStudentId('');
    setLinkDialogOpen(true);
  };

  const handleLinkStudent = async () => {
    if (!selectedParent || !selectedStudentId) return;

    setActionLoading(selectedParent.id);
    try {
      // Update parent profile with linked student
      await updateProfile(selectedParent.id, {
        grade: students.find(s => s.id === selectedStudentId)?.grade,
      });

      // You can also create a parent_students relationship table if needed
      // For now, we'll just update the grade to match the student's grade

      toast.success('تم ربط ولي الأمر بالطالب');
      setLinkDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('خطأ في ربط الطالب:', error);
      toast.error('فشل في ربط الطالب');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'parent':
        return <Badge variant="secondary">ولي أمر</Badge>;
      case 'teacher':
        return <Badge variant="default">مدرس</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">طلبات الموافقة المعلقة</h1>
        <p className="text-muted-foreground">
          إدارة طلبات التسجيل من أولياء الأمور والمدرسين
        </p>
      </div>

      {pendingUsers.length === 0 ? (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            لا توجد طلبات موافقة معلقة حالياً
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>الطلبات المعلقة ({pendingUsers.length})</CardTitle>
            <CardDescription>
              قم بمراجعة الطلبات والموافقة عليها أو رفضها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">البريد الإلكتروني</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">الدور</TableHead>
                  <TableHead className="text-right">اسم الطالب</TableHead>
                  <TableHead className="text-right">تاريخ التسجيل</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((pendingUser) => (
                  <TableRow key={pendingUser.id}>
                    <TableCell className="font-medium">
                      <input
                        type="text"
                        value={editingName[pendingUser.id] || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNameChange(pendingUser.id, e.target.value)}
                        placeholder="أدخل الاسم"
                        className="min-w-[150px] px-3 py-2 border rounded-md"
                      />
                    </TableCell>
                    <TableCell>{pendingUser.email}</TableCell>
                    <TableCell>{pendingUser.phone || '-'}</TableCell>
                    <TableCell>
                      <Select 
                        value={editingRole[pendingUser.id] || pendingUser.role}
                        onValueChange={(value) => handleRoleChange(pendingUser.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">طالب</SelectItem>
                          <SelectItem value="teacher">مدرس</SelectItem>
                          <SelectItem value="parent">ولي أمر</SelectItem>
                          <SelectItem value="admin">مدير</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {pendingUser.role === 'parent' && pendingUser.student_name ? (
                        <span className="text-sm">{pendingUser.student_name}</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(pendingUser.created_at).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(pendingUser.id)}
                          disabled={actionLoading === pendingUser.id}
                        >
                          <CheckCircle className="w-4 h-4 ml-2" />
                          موافقة
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(pendingUser.id)}
                          disabled={actionLoading === pendingUser.id}
                        >
                          <XCircle className="w-4 h-4 ml-2" />
                          رفض
                        </Button>
                        {pendingUser.role === 'parent' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenLinkDialog(pendingUser)}
                            disabled={actionLoading === pendingUser.id}
                          >
                            <LinkIcon className="w-4 h-4 ml-2" />
                            ربط طالب
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ربط ولي الأمر بالطالب</DialogTitle>
            <DialogDescription>
              اختر الطالب المراد ربطه بولي الأمر: {selectedParent?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedParent?.student_name && (
              <Alert>
                <UserCheck className="h-4 w-4" />
                <AlertDescription>
                  اسم الطالب المدخل: <strong>{selectedParent.student_name}</strong>
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="student">اختر الطالب</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger id="student">
                  <SelectValue placeholder="اختر طالب" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name} - {student.grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleLinkStudent}
              disabled={!selectedStudentId || actionLoading === selectedParent?.id}
            >
              <LinkIcon className="w-4 h-4 ml-2" />
              ربط
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
