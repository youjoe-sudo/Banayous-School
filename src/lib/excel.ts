import * as XLSX from 'xlsx';
import type { Student, Teacher } from '@/types';

// Export students to Excel
export function exportStudentsToExcel(students: Student[], filename: string = 'students.xlsx') {
  const data = students.map(student => ({
    'رقم الطالب': student.student_number,
    'الاسم الكامل': student.full_name,
    'الصف': student.grade,
    'تاريخ الميلاد': student.birth_date || '',
    'رقم ولي الأمر': student.parent_phone || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'الطلاب');

  // Set column widths
  const maxWidth = 20;
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: maxWidth },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  XLSX.writeFile(workbook, filename);
}

// Export teachers to Excel
export function exportTeachersToExcel(teachers: Teacher[], filename: string = 'teachers.xlsx') {
  const data = teachers.map(teacher => ({
    'الاسم الكامل': teacher.full_name,
    'التخصص': teacher.specialization,
    'رقم الهاتف': teacher.phone || '',
    'البريد الإلكتروني': teacher.email || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'المدرسون');

  // Set column widths
  const maxWidth = 25;
  worksheet['!cols'] = [
    { wch: maxWidth },
    { wch: 20 },
    { wch: 15 },
    { wch: maxWidth },
  ];

  XLSX.writeFile(workbook, filename);
}

// Import students from Excel
export async function importStudentsFromExcel(file: File): Promise<Partial<Student>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const students: Partial<Student>[] = jsonData.map((row: any) => ({
          student_number: row['رقم الطالب'] || '',
          full_name: row['الاسم الكامل'] || '',
          grade: row['الصف'] || '',
          birth_date: row['تاريخ الميلاد'] || null,
          parent_phone: row['رقم ولي الأمر'] || null,
        }));

        resolve(students);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('فشل في قراءة الملف'));
    };

    reader.readAsBinaryString(file);
  });
}

// Import teachers from Excel
export async function importTeachersFromExcel(file: File): Promise<Partial<Teacher>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const teachers: Partial<Teacher>[] = jsonData.map((row: any) => ({
          full_name: row['الاسم الكامل'] || '',
          specialization: row['التخصص'] || '',
          phone: row['رقم الهاتف'] || null,
          email: row['البريد الإلكتروني'] || null,
        }));

        resolve(teachers);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('فشل في قراءة الملف'));
    };

    reader.readAsBinaryString(file);
  });
}

// Download Excel template for students
export function downloadStudentsTemplate() {
  const data = [
    {
      'رقم الطالب': 'STU00001',
      'الاسم الكامل': 'محمد أحمد',
      'الصف': 'فصل 1/1',
      'تاريخ الميلاد': '2015-01-01',
      'رقم ولي الأمر': '0501234567',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'الطلاب');

  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  XLSX.writeFile(workbook, 'students_template.xlsx');
}

// Download Excel template for teachers
export function downloadTeachersTemplate() {
  const data = [
    {
      'الاسم الكامل': 'أحمد محمد',
      'التخصص': 'رياضيات',
      'رقم الهاتف': '0501234567',
      'البريد الإلكتروني': 'ahmad@school.com',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'المدرسون');

  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 20 },
    { wch: 15 },
    { wch: 25 },
  ];

  XLSX.writeFile(workbook, 'teachers_template.xlsx');
}
