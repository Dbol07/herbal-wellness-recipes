// src/pages/ForgotPasswordPage.tsx
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import WaxButton from "@/components/WaxButton";
import FormInput from "@/components/FormInput";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    setMessage("");

    const result = await resetPassword(email);
    if (result.success) {
      setMessage("Password reset email sent. Check your inbox.");
    } else {
      setMessage(result.error || "Failed to send reset email.");
    }

    setLoading(false);
  };

  return (
    <div className="page min-h-screen flex flex-col items-center justify-center bg-dark-cottagecore p-6">
      <h1 className="text-3xl font-serif text-cream mb-6">Forgot Password</h1>

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
