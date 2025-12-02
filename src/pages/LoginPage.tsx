import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import WaxButton from "@/components/WaxButton";
import FormInput from "@/components/FormInput";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setMessage(error.message);
    else navigate("/");
  };

  return (
    <div className="page min-h-screen flex flex-col items-center justify-center bg-dark-cottagecore p-6">
      <h1 className="text-3xl font-serif text-cream mb-6">Login</h1>
      
      <FormInput label="Email" value={email} onChange={(v) => setEmail(v)} placeholder="Enter your email" />
      <FormInput label="Password" type="password" value={password} onChange={(v) => setPassword(v)} placeholder="Enter your password" />
      
      <WaxButton onClick={handleLogin} disabled={loading} className="w-full mt-4">
        {loading ? "Logging in..." : "Login"}
      </WaxButton>

      {message && <p className="mt-4 text-red-400">{message}</p>}

      <p className="mt-4 text-sm text-cream">
        <a href="/signup" className="underline">Sign up</a> | 
        <a href="/forgot-password" className="underline ml-2">Forgot Password?</a>
      </p>
    </div>
  );
}
