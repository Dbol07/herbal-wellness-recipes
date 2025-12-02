import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return setMessage(error.message);
    if (data.user) window.location.href = "/";
  };

  return (
    <div className="page min-h-screen flex flex-col items-center justify-center bg-dark-cottagecore p-6">
      <h1 className="text-3xl font-serif text-cream mb-6">Welcome Back</h1>

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

      <button onClick={handleLogin} className="primary-button mb-4">
        Login
      </button>

      <p className="text-sm text-cream">
        Forgot password?{" "}
        <a href="/forgot-password" className="underline text-cozy-green">
          Reset here
        </a>
      </p>

      {message && <p className="mt-4 text-red-400">{message}</p>}
    </div>
  );
}
