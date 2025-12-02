import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp(
      { email, password },
      { data: { display_name: displayName } }
    );
    if (error) setMessage(error.message);
    else setMessage("Signup successful! Check your email for confirmation.");
  };

  return (
    <div className="page min-h-screen flex flex-col items-center justify-center bg-dark-cottagecore p-6">
      <h1 className="text-3xl font-serif text-cream mb-6">Sign Up</h1>

      <input
        type="text"
        placeholder="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="input-field mb-4"
      />
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

      {message && <p className="mt-4 text-red-400">{message}</p>}

      <p className="mt-4 text-sm text-cream">
        Already have an account? <Link to="/login" className="underline">Login here</Link>.
      </p>
    </div>
  );
}
