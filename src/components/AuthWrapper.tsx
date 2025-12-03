// src/components/AuthWrapper.tsx
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import { Leaf } from "lucide-react";

type AuthPage = "login" | "signup" | "forgot";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading } = useAuth();
  const [authPage, setAuthPage] = useState<AuthPage>("login");
  const navigate = useNavigate();

  // Redirect logged-in users automatically
  if (!loading && user) {
    navigate("/profile");
    return null;
  }

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1b302c]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#3c6150]/50 mb-4 border border-[#a77a72]/30 animate-pulse">
            <Leaf className="w-10 h-10 text-[#a77a72]" />
          </div>
          <p className="text-[#b8d3d5] font-serif">Gathering herbs...</p>
        </div>
      </div>
    );
  }

  // Show auth pages for unauthenticated users
  if (!user) {
    switch (authPage) {
      case "signup":
        return <SignupPage onNavigate={setAuthPage} />;
      case "forgot":
        return <ForgotPasswordPage onNavigate={setAuthPage} />;
      default:
        return <LoginPage onNavigate={setAuthPage} />;
    }
  }

  // Otherwise render children (should not happen due to redirect above)
  return <>{children}</>;
}
