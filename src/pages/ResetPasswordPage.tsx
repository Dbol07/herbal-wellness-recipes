import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const tokenMatch = hash.match(/access_token=([^&]+)/);
    if (tokenMatch) setAccessToken(tokenMatch[1]);
  }, []);

  const handleUpdate = async () => {
    if (!accessToken) return setMessage("Invalid or expired token.");
    const { error } = await supabase.auth.updateUser({ access_token: accessToken, password });
    if (error) setMessage(error.message);
    else {
      setMessage("Password updated successfully!");
      setTimeout(() => navigate("/login"), 2000);
    }
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

      <button onClick={handleUpdate} className="primary-button mb-4">
        Update Password
      </button>

      {message && <p className="mt-4 text-red-400">{message}</p>}

      <p className="mt-4 text-sm text-cream">
        <Link to="/login" className="underline">Back to Login</Link>
      </p>
    </div>
  );
}
