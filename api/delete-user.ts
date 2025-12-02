import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = JSON.parse(req.body || "{}");
    const { user_id } = body;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    // Authenticate with SERVICE ROLE key (required for deleting auth users)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // 1. Delete from profiles table first
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", user_id);

    if (profileError) {
      console.log("Profile delete error:", profileError);
      // Not fatal — continue deleting auth user anyway
    }

    // 2. Delete the user from Supabase auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      user_id
    );

    if (authError) {
      console.log("Auth delete error:", authError);
      return res.status(400).json({
        error: authError.message || "Failed to delete user",
      });
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.log("Server error:", err);
    return res.status(500).json({ error: "Server error while deleting user" });
  }
}
