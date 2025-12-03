// src/pages/ResetPasswordPage.tsx
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase"; // only for updating password with token
import WaxButton from "@/components/WaxButton";
import FormInput from "@/components/FormInput";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    const accessToken = searchParams.get("access_token");
    if (!accessToken) {
      setMessage("Invalid reset link.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password }, { accessToken });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password successfully updated!");
      setTimeout(() => navigate("/login"), 2000);
    }

    setLoading(false);
  };

  return (
    <div className="page min-h-screen flex flex-col items-center justify-center bg-dark-cottagecore p-6">
      <h1 className="text-3xl font-serif text-cream mb-6">Reset Password</h1>

      <FormInput
        id="reset-password"
        name="password"
        type="password"
        label="New Password"
        value={password}
        onChange={(v) => setPassword(v)}
        placeholder="Enter your new password"
      />
      <FormInput
        id="reset-confirm-password"
        name="confirmPassword"
        type="password"
        label="Confirm Password"
        value={confirmPassword}
        onChange={(v) => setConfirmPassword(v)}
        placeholder="Confirm your new password"
      />

      <WaxButton onClick={handleReset} disabled={loading} className="w-full mt-4">
        {loading ? "Resetting..." : "Reset Password"}
      </WaxButton>

      {message && <p className="mt-4 text-red-400">{message}</p>}
    </div>
  );
}
