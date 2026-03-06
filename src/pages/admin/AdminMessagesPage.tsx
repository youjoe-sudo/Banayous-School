import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Mail, Plus, Send } from 'lucide-react';
import { getMessages, createMessage, getAllProfiles, getStudents } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Message, Profile, Student } from '@/types';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    recipient_type: 'all_students' as 'individual' | 'all_students' | 'all_school',
    recipient_ids: [] as string[],
    is_important: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [messagesData, studentsData] = await Promise.all([
        getMessages(),
        getStudents()
      ]);
      setMessages(messagesData);
      setStudents(studentsData);
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      title: '',
      content: '',
      recipient_type: 'all_students',
      recipient_ids: [],
      is_important: false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (formData.recipient_type === 'individual' && formData.recipient_ids.length === 0) {
      toast.error('يرجى اختيار طالب واحد على الأقل');
      return;
    }

    try {
      await createMessage({
        title: formData.title,
        content: formData.content,
        sender_id: user?.id || '',
        recipient_type: formData.recipient_type,
        recipient_ids: formData.recipient_type === 'individual' ? formData.recipient_ids : undefined,
        is_important: formData.is_important,
      });

      const recipientText = 
        formData.recipient_type === 'all_school' ? 'جميع المستخدمين' :
        formData.recipient_type === 'all_students' ? 'جميع الطلاب' :
        `${formData.recipient_ids.length} طالب`;

      toast.success(`تم إرسال الرسالة إلى ${recipientText} بنجاح`);
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      toast.error('فشل في إرسال الرسالة');
    }
  };

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, recipient_ids: [...formData.recipient_ids, studentId] });
    } else {
      setFormData({ ...formData, recipient_ids: formData.recipient_ids.filter(id => id !== studentId) });
    }
  };

  const handleSelectAllStudents = () => {
    if (formData.recipient_ids.length === students.length) {
      setFormData({ ...formData, recipient_ids: [] });
    } else {
      setFormData({ ...formData, recipient_ids: students.map(s => s.id) });
    }
  };

  const getRecipientText = (message: Message) => {
    if (message.recipient_type === 'all_school') return 'جميع المستخدمين';
    if (message.recipient_type === 'all_students') return 'جميع الطلاب';
    return 'طلاب محددين';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الرسائل</h1>
          <p className="text-muted-foreground">إرسال رسائل للطلاب والمستخدمين</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 ml-2" />
              رسالة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                إرسال رسالة جديدة
              </DialogTitle>
              <DialogDescription>
                قم بكتابة رسالة وتحديد المستلمين
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان الرسالة</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: إعلان مهم"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">محتوى الرسالة</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    placeholder="اكتب محتوى الرسالة هنا..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient_type">المستلمون</Label>
                  <Select
                    value={formData.recipient_type}
                    onValueChange={(value: any) => setFormData({ ...formData, recipient_type: value, recipient_ids: [] })}
                  >
                    <SelectTrigger id="recipient_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_students">جميع الطلاب</SelectItem>
                      <SelectItem value="all_school">المدرسة بالكامل (الجميع)</SelectItem>
                      <SelectItem value="individual">طلاب محددين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.recipient_type === 'individual' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>اختر الطلاب</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllStudents}
                      >
                        {formData.recipient_ids.length === students.length ? 'إلغاء الكل' : 'تحديد الكل'}
                      </Button>
                    </div>
                    <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                      {students.map((student) => (
                        <div key={student.id} className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id={`student-${student.id}`}
                            checked={formData.recipient_ids.includes(student.id)}
                            onCheckedChange={(checked) => handleStudentSelection(student.id, checked as boolean)}
                          />
                          <Label
                            htmlFor={`student-${student.id}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {student.full_name} - {student.grade} ({student.student_number})
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      تم اختيار {formData.recipient_ids.length} من {students.length} طالب
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="is_important"
                    checked={formData.is_important}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_important: checked })}
                  />
                  <Label htmlFor="is_important">رسالة مهمة</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  <Send className="w-4 h-4 ml-2" />
                  إرسال الرسالة
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>إجمالي الرسائل المرسلة</CardDescription>
            <CardTitle className="text-3xl">{messages.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>الرسائل المهمة</CardDescription>
            <CardTitle className="text-3xl">
              {messages.filter((m) => m.is_important).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>إجمالي الطلاب</CardDescription>
            <CardTitle className="text-3xl">{students.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            الرسائل المرسلة ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">لا توجد رسائل</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{message.title}</h3>
                        {message.is_important && (
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                            مهم
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>المستلمون: {getRecipientText(message)}</span>
                        <span>•</span>
                        <span>{new Date(message.created_at).toLocaleString('ar-SA')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
