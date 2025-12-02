import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://herbal-wellness-recipes.vercel.app/reset-password'
});
    if (error) setMessage(error.message);
    else setMessage("Check your email for the reset link.");
  };

  return (
    <div className="page min-h-screen flex flex-col items-center justify-center bg-dark-cottagecore p-6">
      <h1 className="text-3xl font-serif text-cream mb-6">Reset Password</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input-field mb-6"
      />

      <button onClick={handleReset} className="primary-button mb-4">
        Send Reset Link
      </button>

      {message && <p className="mt-4 text-red-400">{message}</p>}
    </div>
  );
}
