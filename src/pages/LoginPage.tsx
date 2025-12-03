// src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WaxButton from "@/components/WaxButton";
import FormInput from "@/components/FormInput";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { loginUser, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");

    const result = await loginUser(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      navigate("/profile"); // or "/" depending on your flow
    } else {
      setMessage(result.error || "Login failed.");
    }

    setLoading(false);
  };

  return (
    <div className="page min-h-screen flex flex-col items-center justify-center bg-dark-cottagecore p-6">
      <h1 className="text-3xl font-serif text-cream mb-6">Login</h1>

      <FormInput
        id="login-email"
        name="email"
        label="Email"
        value={email}
        onChange={(v) => setEmail(v)}
        placeholder="Enter your email"
      />
      <FormInput
        id="login-password"
        name="password"
        type="password"
        label="Password"
        value={password}
        onChange={(v) => setPassword(v)}
        placeholder="Enter your password"
      />

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
