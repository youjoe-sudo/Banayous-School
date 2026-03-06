-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('admin', 'teacher', 'student', 'parent');

-- Create grade enum
CREATE TYPE public.grade_level AS ENUM ('الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس');

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  phone text,
  full_name text,
  role public.user_role NOT NULL DEFAULT 'student',
  grade public.grade_level,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  grade public.grade_level NOT NULL,
  student_number text UNIQUE NOT NULL,
  birth_date date,
  parent_phone text,
  address text,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create teachers table
CREATE TABLE public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  specialization text NOT NULL,
  phone text,
  email text,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create schedules table
CREATE TABLE public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade public.grade_level NOT NULL,
  day_of_week text NOT NULL,
  period_number int NOT NULL,
  subject text NOT NULL,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  start_time time,
  end_time time,
  created_at timestamptz DEFAULT now()
);

-- Create news table
CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  published_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_published boolean DEFAULT true
);

-- Create honor_board table
CREATE TABLE public.honor_board (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  grade public.grade_level NOT NULL,
  rank int NOT NULL,
  total_score numeric(5,2) NOT NULL,
  semester text NOT NULL,
  year int NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.honor_board ENABLE ROW LEVEL SECURITY;

-- Create helper function to check admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- Profiles policies
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- Public view for profiles
CREATE VIEW public_profiles AS
  SELECT id, full_name, role FROM profiles;

-- Students policies
CREATE POLICY "Anyone can view students" ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage students" ON students FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Teachers policies
CREATE POLICY "Anyone can view teachers" ON teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage teachers" ON teachers FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Schedules policies
CREATE POLICY "Anyone can view schedules" ON schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage schedules" ON schedules FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- News policies
CREATE POLICY "Anyone can view published news" ON news FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage news" ON news FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Honor board policies
CREATE POLICY "Anyone can view honor board" ON honor_board FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage honor board" ON honor_board FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Create trigger function for new user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  INSERT INTO public.profiles (id, email, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'student'::public.user_role END
  );
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Insert sample news
INSERT INTO news (title, content, is_published) VALUES
('مرحباً بكم في العام الدراسي الجديد', 'نتمنى لجميع طلابنا عاماً دراسياً موفقاً مليئاً بالنجاح والتفوق', true),
('إعلان عن الامتحانات النهائية', 'ستبدأ الامتحانات النهائية للفصل الدراسي الأول في تاريخ 15/12/2026', true),
('تكريم الطلاب المتفوقين', 'تم تكريم الطلاب المتفوقين في الفصل الدراسي الماضي', true);