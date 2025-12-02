import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import WaxButton from "@/components/WaxButton";
import FormInput from "@/components/FormInput";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    setLoading(true);
    setMessage("");

    try {
      const { data, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      if (!data.user) throw new Error("Failed to create user.");

      // Create profile record in 'profiles' table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ user_id: data.user.id, display_name: displayName }]);

      if (profileError) throw profileError;

      setMessage("Sign-up successful! Please check your email to confirm.");
      navigate("/"); // or navigate to a welcome page

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
        label="Display Name"
        value={displayName}
        onChange={(v) => setDisplayName(v)}
        placeholder="Enter your name"
      />
      <FormInput
        label="Email"
        value={email}
        onChange={(v) => setEmail(v)}
        placeholder="Enter your email"
      />
      <FormInput
        label="Password"
        type="password"
        value={password}
        onChange={(v) => setPassword(v)}
        placeholder="Enter your password"
      />
      
      <WaxButton onClick={handleSignup} disabled={loading} className="w-full mt-4">
        {loading ? "Signing up..." : "Sign Up"}
      </WaxButton>

      {message && <p className="mt-4 text-red-400">{message}</p>}

      <p className="mt-4 text-sm text-cream">
        Already have an account? <a href="/login" className="underline">Login</a>
      </p>
    </div>
  );
}
