import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createExam, addExamQuestion } from '@/db/api';
import { toast } from 'sonner';
import type { GradeLevel } from '@/types';

interface Question {
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: string[];
  correct_answer: string;
  marks: number;
}

export default function CreateExamPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [examData, setExamData] = useState({
    title: '',
    description: '',
    subject: profile?.subject || '',
    grade: '' as GradeLevel | '',
    duration_minutes: 60,
    passing_marks: 50,
    start_date: '',
    end_date: '',
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      marks: 1,
    },
  ]);

  const grades: GradeLevel[] = ['فصل 1/1', 'فصل 1/2', 'فصل 1/3', 'فصل 1/4', 'فصل 1/5'];

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: '',
        marks: 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const calculateTotalMarks = () => {
    return questions.reduce((sum, q) => sum + q.marks, 0);
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();

    if (!user || !examData.grade || !examData.title) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (questions.length === 0) {
      toast.error('يجب إضافة سؤال واحد على الأقل');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text) {
        toast.error(`السؤال ${i + 1}: يرجى كتابة نص السؤال`);
        return;
      }
      if (!q.correct_answer) {
        toast.error(`السؤال ${i + 1}: يرجى تحديد الإجابة الصحيحة`);
        return;
      }
      if (q.question_type === 'multiple_choice' && q.options.some((opt) => !opt)) {
        toast.error(`السؤال ${i + 1}: يرجى ملء جميع الخيارات`);
        return;
      }
    }

    setLoading(true);

    try {
      const totalMarks = calculateTotalMarks();

      // Create exam
      const exam = await createExam({
        title: examData.title,
        description: examData.description || null,
        subject: examData.subject,
        grade: examData.grade,
        teacher_id: user.id,
        duration_minutes: examData.duration_minutes,
        total_marks: totalMarks,
        passing_marks: examData.passing_marks,
        start_date: examData.start_date || null,
        end_date: examData.end_date || null,
        is_published: publish,
      });

      // Add questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await addExamQuestion({
          exam_id: exam.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.question_type === 'multiple_choice' ? q.options : null,
          correct_answer: q.correct_answer,
          marks: q.marks,
          order_number: i + 1,
        });
      }

      toast.success('تم إنشاء الامتحان بنجاح');
      navigate('/teacher/exams');
    } catch (error) {
      console.error('خطأ في إنشاء الامتحان:', error);
      toast.error('فشل في إنشاء الامتحان');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">إنشاء امتحان جديد</h1>
        <p className="text-muted-foreground">أنشئ امتحاناً جديداً لطلابك</p>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Exam Details */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات الامتحان</CardTitle>
              <CardDescription>أدخل التفاصيل الأساسية للامتحان</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان الامتحان *</Label>
                  <Input
                    id="title"
                    value={examData.title}
                    onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                    placeholder="مثال: امتحان الفصل الأول"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">المادة</Label>
                  <Input
                    id="subject"
                    value={examData.subject}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    المادة محددة من ملفك الشخصي
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={examData.description}
                  onChange={(e) => setExamData({ ...examData, description: e.target.value })}
                  placeholder="وصف مختصر عن الامتحان..."
                  rows={3}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">الصف *</Label>
                  <Select
                    value={examData.grade}
                    onValueChange={(value) => setExamData({ ...examData, grade: value as GradeLevel })}
                  >
                    <SelectTrigger id="grade">
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">المدة (دقيقة) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={examData.duration_minutes}
                    onChange={(e) => setExamData({ ...examData, duration_minutes: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passing">درجة النجاح *</Label>
                  <Input
                    id="passing"
                    type="number"
                    min="0"
                    max={calculateTotalMarks()}
                    value={examData.passing_marks}
                    onChange={(e) => setExamData({ ...examData, passing_marks: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">وقت البداية (اختياري)</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={examData.start_date}
                    onChange={(e) => setExamData({ ...examData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">وقت النهاية (اختياري)</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={examData.end_date}
                    onChange={(e) => setExamData({ ...examData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">
                  <strong>إجمالي الدرجات:</strong> {calculateTotalMarks()} درجة
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>الأسئلة</CardTitle>
                  <CardDescription>أضف أسئلة الامتحان</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة سؤال
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question, qIndex) => (
                <Card key={qIndex} className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">السؤال {qIndex + 1}</CardTitle>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(qIndex)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>نص السؤال *</Label>
                      <Textarea
                        value={question.question_text}
                        onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                        placeholder="اكتب السؤال هنا..."
                        rows={2}
                        required
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>نوع السؤال</Label>
                        <Select
                          value={question.question_type}
                          onValueChange={(value) => {
                            updateQuestion(qIndex, 'question_type', value);
                            if (value === 'true_false') {
                              updateQuestion(qIndex, 'options', ['صح', 'خطأ']);
                            } else if (value === 'multiple_choice') {
                              updateQuestion(qIndex, 'options', ['', '', '', '']);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice">اختيار من متعدد</SelectItem>
                            <SelectItem value="true_false">صح أو خطأ</SelectItem>
                            <SelectItem value="short_answer">إجابة قصيرة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>الدرجة</Label>
                        <Input
                          type="number"
                          min="1"
                          value={question.marks}
                          onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value))}
                          required
                        />
                      </div>
                    </div>

                    {question.question_type === 'multiple_choice' && (
                      <div className="space-y-2">
                        <Label>الخيارات</Label>
                        {question.options.map((option, oIndex) => (
                          <Input
                            key={oIndex}
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            placeholder={`الخيار ${oIndex + 1}`}
                            required
                          />
                        ))}
                      </div>
                    )}

                    {question.question_type === 'true_false' && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          الخيارات: صح أو خطأ
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>الإجابة الصحيحة *</Label>
                      {question.question_type === 'multiple_choice' ? (
                        <Select
                          value={question.correct_answer}
                          onValueChange={(value) => updateQuestion(qIndex, 'correct_answer', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الإجابة الصحيحة" />
                          </SelectTrigger>
                          <SelectContent>
                            {question.options.filter(option => option.trim() !== '').map((option, oIndex) => (
                              <SelectItem key={oIndex} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : question.question_type === 'true_false' ? (
                        <Select
                          value={question.correct_answer}
                          onValueChange={(value) => updateQuestion(qIndex, 'correct_answer', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الإجابة الصحيحة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="صح">صح</SelectItem>
                            <SelectItem value="خطأ">خطأ</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={question.correct_answer}
                          onChange={(e) => updateQuestion(qIndex, 'correct_answer', e.target.value)}
                          placeholder="اكتب الإجابة الصحيحة..."
                          required
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/teacher/exams')}>
              إلغاء
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              disabled={loading}
              onClick={(e) => handleSubmit(e as any, false)}
            >
              <Save className="w-4 h-4 ml-2" />
              {loading ? 'جاري الحفظ...' : 'حفظ كمسودة'}
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              onClick={(e) => handleSubmit(e as any, true)}
            >
              <Save className="w-4 h-4 ml-2" />
              {loading ? 'جاري النشر...' : 'حفظ ونشر'}
            </Button>
          </div>
        </form>
    </div>
  );
}
