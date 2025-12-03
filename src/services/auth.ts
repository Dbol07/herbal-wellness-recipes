// src/services/auth.ts
import { supabase } from '../lib/supabase'; // relative path from services/

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
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !user) {
      console.error('Supabase Auth error:', authError?.message);
      return { success: false, error: authError?.message || 'Auth failed' };
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        display_name: displayName || email,
        dietary_goals: dietaryGoals || null,
        avatar_url: avatarUrl || null,
      });

    if (profileError) {
      console.error('Database error saving profile:', profileError.message);
      await supabase.auth.admin.deleteUser(user.id);
      return { success: false, error: profileError.message };
    }

    return { success: true, user };
  } catch (err) {
    console.error('Unexpected error during signup:', err);
    return { success: false, error: 'Unexpected error during signup' };
  }
}
