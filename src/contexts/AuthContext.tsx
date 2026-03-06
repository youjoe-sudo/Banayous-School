import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile, UserRole, GradeLevel } from '@/types';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('خطأ في جلب معلومات المستخدم:', error);
    return null;
  }
  return data;
}

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
  grade?: GradeLevel;
  studentName?: string; // For parents to specify their child's name
  subject?: string; // For teachers to specify their subject
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const profileData = await getProfile(user.id);
    setProfile(profileData);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id).then(setProfile);
      }
      setLoading(false);
    });
    // In this function, do NOT use any await calls. Use `.then()` instead to avoid deadlocks.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id).then(setProfile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user is approved (for parents and teachers)
      if (data.user) {
        const profileData = await getProfile(data.user.id);
        
        if (profileData && (profileData.role === 'parent' || profileData.role === 'teacher')) {
          if (!profileData.is_approved || profileData.approval_status !== 'approved') {
            // Sign out the user
            await supabase.auth.signOut();
            throw new Error('حسابك قيد المراجعة. يرجى انتظار موافقة المدير.');
          }
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (signUpError) throw signUpError;

      // Update profile with additional data immediately after signup
      if (signUpData.user) {
        const { error: updateError } = await (supabase as any)
          .from('profiles')
          .update({
            full_name: data.fullName,
            phone: data.phone || null,
            grade: data.grade || null,
            role: data.role || 'student',
            student_name: data.studentName || null,
            subject: data.subject || null,
          })
          .eq('id', signUpData.user.id);

        if (updateError) {
          console.error('خطأ في تحديث الملف الشخصي:', updateError);
        }
      }

      // For students and admins, auto sign in
      // For parents and teachers, don't sign in (they need approval first)
      if (data.role === 'student' || data.role === 'admin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) throw signInError;
      } else {
        // For parents and teachers, sign them out immediately
        await supabase.auth.signOut();
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
