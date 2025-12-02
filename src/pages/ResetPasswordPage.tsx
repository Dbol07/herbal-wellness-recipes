// src/pages/ResetPasswordPage.tsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Extract the access_token from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", "?"));
    const token = params.get("access_token");
    if (token) setAccessToken(token);
  }, []);

  const handleReset = async () => {
    if (!accessToken) {
      setMessage("Invalid or missing token.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password,
      accessToken,
    });
    setLoading(false);
    if (error) setMessage(error.message);
    else setMessage("Password updated! You can now log in.");
  };

  return (
    <div className="page min-h-screen flex flex-col items-center justify-center bg-dark-cottagecore p-6">
      <h1 className="text-3xl font-serif text-cream mb-6">Set New Password</h1>

      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input-field mb-6"
      />

      <button
        onClick={handleReset}
        className="primary-button mb-4"
        disabled={loading || !accessToken}
      >
        {loading ? "Updating..." : "Update Password"}
      </button>

      {message && <p className="mt-4 text-red-400">{message}</p>}
    </div>
  );
}
