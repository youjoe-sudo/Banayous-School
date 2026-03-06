-- Update the grade_level enum to new format
ALTER TYPE grade_level RENAME TO grade_level_old;

CREATE TYPE grade_level AS ENUM ('فصل 1/1', 'فصل 1/2', 'فصل 1/3', 'فصل 1/4', 'فصل 1/5');

-- Migrate profiles table
ALTER TABLE profiles ALTER COLUMN grade TYPE TEXT;
UPDATE profiles SET grade = 
  CASE 
    WHEN grade = 'الصف الأول' THEN 'فصل 1/1'
    WHEN grade = 'الصف الثاني' THEN 'فصل 1/2'
    WHEN grade = 'الصف الثالث' THEN 'فصل 1/3'
    WHEN grade = 'الصف الرابع' THEN 'فصل 1/4'
    WHEN grade = 'الصف الخامس' THEN 'فصل 1/5'
    ELSE grade
  END;
ALTER TABLE profiles ALTER COLUMN grade TYPE grade_level USING grade::grade_level;

-- Migrate responsible_grades array
ALTER TABLE profiles ALTER COLUMN responsible_grades TYPE TEXT[];
UPDATE profiles SET responsible_grades = 
  ARRAY(
    SELECT 
      CASE 
        WHEN unnest = 'الصف الأول' THEN 'فصل 1/1'
        WHEN unnest = 'الصف الثاني' THEN 'فصل 1/2'
        WHEN unnest = 'الصف الثالث' THEN 'فصل 1/3'
        WHEN unnest = 'الصف الرابع' THEN 'فصل 1/4'
        WHEN unnest = 'الصف الخامس' THEN 'فصل 1/5'
        ELSE unnest
      END
    FROM unnest(responsible_grades)
  )
WHERE responsible_grades IS NOT NULL;
ALTER TABLE profiles ALTER COLUMN responsible_grades TYPE grade_level[] USING responsible_grades::grade_level[];

-- Migrate students table
ALTER TABLE students ALTER COLUMN grade TYPE TEXT;
UPDATE students SET grade = 
  CASE 
    WHEN grade = 'الصف الأول' THEN 'فصل 1/1'
    WHEN grade = 'الصف الثاني' THEN 'فصل 1/2'
    WHEN grade = 'الصف الثالث' THEN 'فصل 1/3'
    WHEN grade = 'الصف الرابع' THEN 'فصل 1/4'
    WHEN grade = 'الصف الخامس' THEN 'فصل 1/5'
    ELSE grade
  END;
ALTER TABLE students ALTER COLUMN grade TYPE grade_level USING grade::grade_level;

-- Migrate schedules table
ALTER TABLE schedules ALTER COLUMN grade TYPE TEXT;
UPDATE schedules SET grade = 
  CASE 
    WHEN grade = 'الصف الأول' THEN 'فصل 1/1'
    WHEN grade = 'الصف الثاني' THEN 'فصل 1/2'
    WHEN grade = 'الصف الثالث' THEN 'فصل 1/3'
    WHEN grade = 'الصف الرابع' THEN 'فصل 1/4'
    WHEN grade = 'الصف الخامس' THEN 'فصل 1/5'
    ELSE grade
  END;
ALTER TABLE schedules ALTER COLUMN grade TYPE grade_level USING grade::grade_level;

-- Migrate honor_board table
ALTER TABLE honor_board ALTER COLUMN grade TYPE TEXT;
UPDATE honor_board SET grade = 
  CASE 
    WHEN grade = 'الصف الأول' THEN 'فصل 1/1'
    WHEN grade = 'الصف الثاني' THEN 'فصل 1/2'
    WHEN grade = 'الصف الثالث' THEN 'فصل 1/3'
    WHEN grade = 'الصف الرابع' THEN 'فصل 1/4'
    WHEN grade = 'الصف الخامس' THEN 'فصل 1/5'
    ELSE grade
  END;
ALTER TABLE honor_board ALTER COLUMN grade TYPE grade_level USING grade::grade_level;

-- Migrate exams table
ALTER TABLE exams ALTER COLUMN grade TYPE TEXT;
UPDATE exams SET grade = 
  CASE 
    WHEN grade = 'الصف الأول' THEN 'فصل 1/1'
    WHEN grade = 'الصف الثاني' THEN 'فصل 1/2'
    WHEN grade = 'الصف الثالث' THEN 'فصل 1/3'
    WHEN grade = 'الصف الرابع' THEN 'فصل 1/4'
    WHEN grade = 'الصف الخامس' THEN 'فصل 1/5'
    ELSE grade
  END;
ALTER TABLE exams ALTER COLUMN grade TYPE grade_level USING grade::grade_level;

-- Drop old enum
DROP TYPE grade_level_old;