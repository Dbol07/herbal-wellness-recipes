import { useState } from "react";
import { supabase } from "../lib/supabase";
import WaxButton from "@/components/WaxButton";
import FormInput from "@/components/FormInput";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setMessage("Password reset email sent!");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page min-h-screen flex flex-col items-center justify-center bg-dark-cottagecore p-6">
      <h1 className="text-3xl font-serif text-cream mb-6">Reset Password</h1>

      <FormInput
        id="forgot-email"
        name="email"
        label="Email"
        value={email}
        onChange={(v) => setEmail(v)}
        placeholder="Enter your email"
      />

      <WaxButton onClick={handleReset} disabled={loading} className="w-full mt-4">
        {loading ? "Sending..." : "Send Reset Email"}
      </WaxButton>

      {message && <p className="mt-4 text-red-400">{message}</p>}
    </div>
  );
}
