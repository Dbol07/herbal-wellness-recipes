import { useState } from "react";
import { supabase } from "../lib/supabase";
import WaxButton from "@/components/WaxButton";
import FormInput from "@/components/FormInput";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const accessToken = searchParams.get("access_token");

  const handleReset = async () => {
    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password }, { accessToken });
      if (error) throw error;

      setMessage("Password successfully updated!");
      navigate("/login");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page min-h-screen flex flex-col items-center justify-center bg-dark-cottagecore p-6">
      <h1 className="text-3xl font-serif text-cream mb-6">Set New Password</h1>

      <FormInput
        id="reset-password"
        name="password"
        type="password"
        label="New Password"
        value={password}
        onChange={(v) => setPassword(v)}
        placeholder="Enter new password"
      />
      <FormInput
        id="reset-confirm-password"
        name="confirmPassword"
        type="password"
        label="Confirm Password"
        value={confirmPassword}
        onChange={(v) => setConfirmPassword(v)}
        placeholder="Confirm new password"
      />

      <WaxButton onClick={handleReset} disabled={loading} className="w-full mt-4">
        {loading ? "Updating..." : "Update Password"}
      </WaxButton>

      {message && <p className="mt-4 text-red-400">{message}</p>}
    </div>
  );
}
