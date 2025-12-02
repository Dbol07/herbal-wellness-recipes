import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return setMessage(error.message);

    if (data.user) {
      const { error: insertError } = await supabase
        .from("users")
        .insert([{ user_id: data.user.id, email }]);
      if (insertError) setMessage(insertError.message);
      else setMessage("Signup successful! Check your email.");
    }
  };

  return (
    <div className="page min-h-screen flex flex-col items-center justify-center bg-dark-cottagecore p-6">
      <h1 className="text-3xl font-serif text-cream mb-6">Create Account</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input-field mb-4"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input-field mb-6"
      />

      <button onClick={handleSignup} className="primary-button mb-4">
        Sign Up
      </button>

      <p className="text-sm text-cream">
        Already have an account?{" "}
        <a href="/login" className="underline text-cozy-green">
          Login
        </a>
      </p>

      {message && <p className="mt-4 text-red-400">{message}</p>}
    </div>
  );
}
