import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import WaxButton from "@/components/WaxButton";
import FormInput from "@/components/FormInput";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      setUser(data.user);
      navigate("/");

    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page min-h-screen flex flex-col items-center justify-center bg-dark-cottagecore p-6">
      <h1 className="text-3xl font-serif text-cream mb-6">Sign Up</h1>

      <FormInput
        id="signup-email"
        name="email"
        label="Email"
        value={email}
        onChange={(v) => setEmail(v)}
        placeholder="Enter your email"
      />
      <FormInput
        id="signup-password"
        name="password"
        type="password"
        label="Password"
        value={password}
        onChange={(v) => setPassword(v)}
        placeholder="Enter your password"
      />
      <FormInput
        id="signup-confirm-password"
        name="confirmPassword"
        type="password"
        label="Confirm Password"
        value={confirmPassword}
        onChange={(v) => setConfirmPassword(v)}
        placeholder="Confirm your password"
      />

      <WaxButton onClick={handleSignup} disabled={loading} className="w-full mt-4">
        {loading ? "Signing up..." : "Sign Up"}
      </WaxButton>

      {message && <p className="mt-4 text-red-400">{message}</p>}

      <p className="mt-4 text-sm text-cream">
        Already have an account? <a href="/login" className="underline">Log in</a>
      </p>
    </div>
  );
}
