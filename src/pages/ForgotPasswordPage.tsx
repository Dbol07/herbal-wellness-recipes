import { useState } from "react";
import { supabase } from "../lib/supabase";
import WaxButton from "@/components/WaxButton";
import FormInput from "@/components/FormInput";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://herbal-wellness-recipes.vercel.app/reset-password",
    });
    if (error) setMessage(error.message);
    else setMessage("Check your email for the reset link.");
  };

  return (
    <div className="page min-h-screen flex flex-col items-center justify-center bg-dark-cottagecore p-6">
      <h1 className="text-3xl font-serif text-cream mb-6">Reset Password</h1>

      <FormInput label="Email" value={email} onChange={(v) => setEmail(v)} placeholder="Enter your email" />

      <WaxButton onClick={handleReset} className="w-full mt-4">
        Send Reset Link
      </WaxButton>

      {message && <p className="mt-4 text-red-400">{message}</p>}
    </div>
  );
}
