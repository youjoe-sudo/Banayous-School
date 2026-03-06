import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Send, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getExamById, submitExamResult, getStudentExamResult } from '@/db/api';
import { toast } from 'sonner';

export default function TakeExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(new Date());

  useEffect(() => {
    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchExam = async () => {
    if (!examId || !user) return;

    try {
      // Check if already submitted
      const existingResult = await getStudentExamResult(examId, user.id);
      if (existingResult) {
        toast.error('لقد قمت بحل هذا الامتحان مسبقاً');
        navigate('/student/exams');
        return;
      }

      const data = await getExamById(examId);
      setExam(data);
      setTimeLeft(data.duration_minutes * 60); // Convert to seconds
    } catch (error) {
      console.error('خطأ في جلب الامتحان:', error);
      toast.error('فشل في جلب الامتحان');
      navigate('/student/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const calculateScore = () => {
    let score = 0;
    exam.exam_questions.forEach((question: any) => {
      const studentAnswer = answers[question.id];
      if (studentAnswer && studentAnswer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase()) {
        score += question.marks;
      }
    });
    return score;
  };

  const handleSubmit = async () => {
    if (submitting) return;

    // Check if all questions are answered
    const unanswered = exam.exam_questions.filter((q: any) => !answers[q.id]);
    if (unanswered.length > 0) {
      const confirm = window.confirm(
        `لم تجب على ${unanswered.length} سؤال. هل تريد التسليم؟`
      );
      if (!confirm) return;
    }

    setSubmitting(true);

    try {
      const score = calculateScore();
      const timeTaken = Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60);

      console.log('Submitting exam result:', {
        exam_id: examId,
        student_id: user!.id,
        score,
        total_marks: exam.total_marks,
        passed: score >= exam.passing_marks,
        time_taken_minutes: timeTaken,
      });

      const result = await submitExamResult({
        exam_id: examId!,
        student_id: user!.id,
        answers: answers,
        score: score,
        total_marks: exam.total_marks,
        passed: score >= exam.passing_marks,
        time_taken_minutes: timeTaken,
      });

      console.log('Exam result submitted successfully:', result);
      toast.success('تم تسليم الامتحان بنجاح');
      navigate('/student/exams');
    } catch (error: any) {
      console.error('خطأ في تسليم الامتحان:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });
      
      // Show more specific error message
      let errorMessage = 'فشل في تسليم الامتحان';
      if (error?.message) {
        errorMessage += ': ' + error.message;
      }
      if (error?.code === 'PGRST204') {
        errorMessage = 'خطأ في البيانات: حقل مفقود في قاعدة البيانات';
      } else if (error?.code === '42501') {
        errorMessage = 'خطأ في الصلاحيات: لا يمكنك تسليم هذا الامتحان';
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <p className="text-center text-muted-foreground">جاري التحميل...</p>
        </div>
      </MainLayout>
    );
  }

  if (!exam) {
    return (
      <MainLayout>
        <div className="container py-8">
          <p className="text-center text-muted-foreground">الامتحان غير موجود</p>
        </div>
      </MainLayout>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam.exam_questions.length;

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <Card className="mb-6 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{exam.title}</CardTitle>
                <CardDescription>{exam.description}</CardDescription>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${timeLeft < 300 ? 'text-red-600' : ''}`}>
                  <Clock className="w-6 h-6 inline ml-2" />
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-muted-foreground">الوقت المتبقي</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-muted-foreground">الأسئلة المجابة: </span>
                <span className="font-bold">{answeredCount} / {totalQuestions}</span>
              </div>
              <div>
                <span className="text-muted-foreground">الدرجة الكلية: </span>
                <span className="font-bold">{exam.total_marks} درجة</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            تأكد من الإجابة على جميع الأسئلة قبل التسليم. لن تتمكن من تعديل إجاباتك بعد التسليم.
          </AlertDescription>
        </Alert>

        {/* Questions */}
        <div className="space-y-6">
          {exam.exam_questions
            .sort((a: any, b: any) => a.order_number - b.order_number)
            .map((question: any, index: number) => (
              <Card key={question.id} className={answers[question.id] ? 'border-green-500' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    السؤال {index + 1} ({question.marks} درجة)
                  </CardTitle>
                  <CardDescription className="text-base text-foreground">
                    {question.question_text}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {question.question_type === 'multiple_choice' && (
                    <RadioGroup
                      value={answers[question.id] || ''}
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                    >
                      {question.options.map((option: string, optIndex: number) => (
                        <div key={optIndex} className="flex items-center space-x-2 space-x-reverse mb-3">
                          <RadioGroupItem value={option} id={`${question.id}-${optIndex}`} />
                          <Label
                            htmlFor={`${question.id}-${optIndex}`}
                            className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-muted"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.question_type === 'true_false' && (
                    <RadioGroup
                      value={answers[question.id] || ''}
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                    >
                      <div className="flex items-center space-x-2 space-x-reverse mb-3">
                        <RadioGroupItem value="صح" id={`${question.id}-true`} />
                        <Label
                          htmlFor={`${question.id}-true`}
                          className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-muted"
                        >
                          صح
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="خطأ" id={`${question.id}-false`} />
                        <Label
                          htmlFor={`${question.id}-false`}
                          className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-muted"
                        >
                          خطأ
                        </Label>
                      </div>
                    </RadioGroup>
                  )}

                  {question.question_type === 'short_answer' && (
                    <Input
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder="اكتب إجابتك هنا..."
                      className="text-lg"
                    />
                  )}
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Submit Button */}
        <Card className="mt-6 border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  أجبت على {answeredCount} من {totalQuestions} سؤال
                </p>
                <p className="text-sm text-muted-foreground">
                  تأكد من مراجعة إجاباتك قبل التسليم
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={submitting}
              >
                <Send className="w-5 h-5 ml-2" />
                {submitting ? 'جاري التسليم...' : 'تسليم الامتحان'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
