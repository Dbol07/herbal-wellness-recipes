import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import { Leaf } from 'lucide-react';

type AuthPage = 'login' | 'signup' | 'forgot';

interface AuthWrapperProps {
  children?: React.ReactNode;
  initialPage?: AuthPage; // NEW: set the initial page
}

export default function AuthWrapper({ children, initialPage = 'login' }: AuthWrapperProps) {
  const { user, loading } = useAuth();
  const [authPage, setAuthPage] = useState<AuthPage>(initialPage);

  // Optional: handle query param mode (e.g., /auth?mode=signup)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'signup' || mode === 'forgot') setAuthPage(mode);
  }, []);

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

  if (!user) {
    switch (authPage) {
      case 'signup':
        return <SignupPage onNavigate={setAuthPage} />;
      case 'forgot':
        return <ForgotPasswordPage onNavigate={setAuthPage} />;
      default:
        return <LoginPage onNavigate={setAuthPage} />;
    }
  }

  return <>{children}</>;
}
