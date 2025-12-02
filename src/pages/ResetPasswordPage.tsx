import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    setToken(accessToken);
  }, []);

  const updatePassword = async () => {
    if (!token) {
      setMessage("Invalid or missing token.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) setMessage(error.message);
    else setMessage("Password updated! You may now log in.");
  };

  return (
    <div className="page">
      <h1>Reset Password</h1>

      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={updatePassword}>Update Password</button>

      {message && <p>{message}</p>}
    </div>
  );
}
