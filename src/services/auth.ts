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

    // 2️⃣ If email confirmation is required, wait for confirmation
    if (!user) {
      return {
        success: false,
        error:
          'Signup successful! Please check your email to confirm your account before logging in.',
      };
    }

    // 3️⃣ Call edge function to create profile
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) {
      return { success: false, error: 'No access token found after signup' };
    }

    const res = await fetch(
      'https://<YOUR_PROJECT_REF>.functions.supabase.co/createProfile',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          displayName: displayName || email,
          dietaryGoals: dietaryGoals || null,
          avatarUrl: avatarUrl || null,
        }),
      }
    );

    const profileResult = await res.json();

    if (!profileResult.success) {
      console.error('Profile creation error:', profileResult.error);
      return { success: false, error: profileResult.error };
    }

    return { success: true, user };
  } catch (err: any) {
    console.error('Unexpected error during signup:', err);
    return { success: false, error: err.message || 'Unexpected error during signup' };
  }
}
