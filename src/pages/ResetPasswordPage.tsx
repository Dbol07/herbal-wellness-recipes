import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import WaxButton from "@/components/WaxButton";
import FormInput from "@/components/FormInput";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Read access_token from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      const params = new URLSearchParams(hash.replace("#", ""));
      window.sessionStorage.setItem("supabaseAccessToken", params.get("access_token") || "");
    }
  }, []);

  const handleReset = async () => {
    const token = window.sessionStorage.getItem("supabaseAccessToken");
    if (!token) return setMessage("Invalid or expired token.");
    
    const { error } = await supabase.auth.updateUser({ password, access_token: token });
    if (error) setMessage(error.message);
    else {
      setMessage("Password updated successfully!");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  return (
    <div className="page min-h-screen flex flex-col items-center justify-center bg-dark-cottagecore p-6">
      <h1 className="text-3xl font-serif text-cream mb-6">Set New Password</h1>

      <FormInput label="New Password" type="password" value={password} onChange={(v) => setPassword(v)} placeholder="Enter new password" />

      <WaxButton onClick={handleReset} className="w-full mt-4">
        Reset Password
      </WaxButton>

      {message && <p className="mt-4 text-red-400">{message}</p>}
    </div>
  );
}
