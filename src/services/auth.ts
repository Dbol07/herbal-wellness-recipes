// src/services/auth.ts
import { supabase } from '../lib/supabase';

interface SignupProps {
  email: string;
  password: string;
  displayName?: string;
  dietaryGoals?: string;
  avatarUrl?: string;
}

export async function signUpNewUser({
  email,
  password,
  displayName,
  dietaryGoals,
  avatarUrl,
}: SignupProps) {
  try {
    // 1️⃣ Create user in Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('Supabase Auth error:', authError.message);
      return { success: false, error: authError.message };
    }

    const user = data.user;

    // 2️⃣ If user is null, email confirmation is likely required
    if (!user) {
      return {
        success: false,
        error:
          'Signup successful! Please check your email to confirm your account before logging in.',
      };
    }

    // 3️⃣ Insert profile in the DB
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: user.id,
      display_name: displayName || email,
      dietary_goals: dietaryGoals || null,
      avatar_url: avatarUrl || null,
    });

    if (profileError) {
      console.error('Database error saving profile:', profileError.message);
      // ❌ Do not delete user from client — use serverless function if needed
      return { success: false, error: profileError.message };
    }

    return { success: true, user };
  } catch (err: any) {
    console.error('Unexpected error during signup:', err);
    return { success: false, error: err.message || 'Unexpected error during signup' };
  }
}
