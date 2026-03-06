import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, MailOpen, AlertCircle } from 'lucide-react';
import { getUserMessages, markMessageAsRead } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Message } from '@/types';

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      const data = await getUserMessages(user.id);
      setMessages(data);
    } catch (error) {
      console.error('خطأ في جلب الرسائل:', error);
      toast.error('فشل في جلب الرسائل');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMessage = async (message: Message) => {
    setSelectedMessage(message);
    setDialogOpen(true);

    // Mark as read if it's an individual message
    if (message.recipient_type === 'individual' && user) {
      try {
        await markMessageAsRead(message.id, user.id);
        fetchMessages(); // Refresh to update read status
      } catch (error) {
        console.error('خطأ في تحديث حالة القراءة:', error);
      }
    }
  };

  const isMessageRead = (message: Message) => {
    if (message.recipient_type !== 'individual') return true;
    const recipient = message.recipients?.find(r => r.recipient_id === user?.id);
    return recipient?.is_read || false;
  };

  const unreadCount = messages.filter(m => !isMessageRead(m)).length;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">صندوق الرسائل</h1>
          <p className="text-muted-foreground">
            الرسائل المرسلة إليك من إدارة المدرسة
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>إجمالي الرسائل</CardDescription>
              <CardTitle className="text-3xl">{messages.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>الرسائل غير المقروءة</CardDescription>
              <CardTitle className="text-3xl text-primary">{unreadCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>الرسائل المقروءة</CardDescription>
              <CardTitle className="text-3xl text-muted-foreground">
                {messages.length - unreadCount}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Messages List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              الرسائل
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">جاري التحميل...</p>
            ) : messages.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">لا توجد رسائل</p>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => {
                  const isRead = isMessageRead(message);
                  return (
                    <div
                      key={message.id}
                      onClick={() => handleOpenMessage(message)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        !isRead ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${!isRead ? 'text-primary' : 'text-muted-foreground'}`}>
                          {!isRead ? <Mail className="w-5 h-5" /> : <MailOpen className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold truncate ${!isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {message.title}
                            </h3>
                            {message.is_important && (
                              <Badge variant="destructive" className="shrink-0">
                                <AlertCircle className="w-3 h-3 ml-1" />
                                مهم
                              </Badge>
                            )}
                            {!isRead && (
                              <Badge className="shrink-0">جديد</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {message.content}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>من: {message.sender?.full_name || 'الإدارة'}</span>
                            <span>•</span>
                            <span>{new Date(message.created_at).toLocaleDateString('ar-SA')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle className="flex-1">{selectedMessage?.title}</DialogTitle>
                {selectedMessage?.is_important && (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 ml-1" />
                    مهم
                  </Badge>
                )}
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>من: {selectedMessage?.sender?.full_name || 'الإدارة'}</p>
                <p>التاريخ: {selectedMessage && new Date(selectedMessage.created_at).toLocaleString('ar-SA')}</p>
              </div>
              <div className="border-t pt-4">
                <p className="whitespace-pre-wrap">{selectedMessage?.content}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
