
// Vercel Edge Function
import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
    });
  }

  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing userId' }), {
        status: 400,
      });
    }

    // ❗ Use service key safely on server
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Optional: delete profile explicitly (cascade is already set)
    await supabaseAdmin.from('profiles').delete().eq('user_id', userId);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'User deleted' }), {
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Server error' }), {
      status: 500,
    });
  }
}
