// src/services/auth.ts
import { supabase } from '../lib/supabase';

interface SignupProps {
  email: string;
  password: string;
  displayName?: string;
}

export async function signUpNewUser({
  email,
  password,
  displayName,
}: SignupProps) {
  try {
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('Supabase Auth error:', authError.message);
      return { success: false, error: authError.message };
    }

    if (!data.user) {
      return {
        success: false,
        error:
          'Signup successful! Please check your email to confirm your account before logging in.',
      };
    }

    // ✅ Profile creation will be handled by Edge Function after confirmation
    return { success: true, user: data.user };
  } catch (err: any) {
    console.error('Unexpected error during signup:', err);
    return { success: false, error: err.message || 'Unexpected error during signup' };
  }
}
