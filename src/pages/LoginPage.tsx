import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ParchmentCard from '@/components/ParchmentCard';
import WaxButton from '@/components/WaxButton';
import FloatingHerbs from '@/components/FloatingHerbs';
import { Leaf, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { IMAGES } from '@/constants/images';

interface LoginPageProps {
  onNavigate: (page: 'signup' | 'forgot') => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: `url(${IMAGES.background})`, backgroundSize: 'cover' }}>
      <div className="absolute inset-0 bg-[#1b302c]/90" />
      <FloatingHerbs />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#3c6150]/50 mb-4 border border-[#a77a72]/30">
            <Leaf className="w-8 h-8 text-[#a77a72]" />
          </div>
          <h1 className="font-serif text-3xl text-[#f2ebd7]">Welcome Back</h1>
          <p className="text-[#b8d3d5] mt-2">Enter your apothecary</p>
        </div>
        <ParchmentCard variant="leather" glow>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 rounded-lg bg-[#8b3a3a]/30 border border-[#8b3a3a]/50 text-[#f2ebd7] text-sm">{error}</div>}
            <div className="space-y-2">
              <label className="block font-serif text-[#f2ebd7] text-sm">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a77a72]" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#1b302c]/80 border border-[#3c6150]/50 text-[#f2ebd7] placeholder-[#b8d3d5]/50 focus:ring-2 focus:ring-[#a77a72]/50"
                  placeholder="herbalist@garden.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block font-serif text-[#f2ebd7] text-sm">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a77a72]" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-[#1b302c]/80 border border-[#3c6150]/50 text-[#f2ebd7] placeholder-[#b8d3d5]/50 focus:ring-2 focus:ring-[#a77a72]/50"
                  placeholder="Your secret blend" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a77a72]">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => onNavigate('forgot')} className="text-sm text-[#a77a72] hover:text-[#f2ebd7]">Forgot password?</button>
            </div>
            <WaxButton type="submit" className="w-full" disabled={loading}>{loading ? 'Entering...' : 'Enter the Garden'}</WaxButton>
          </form>
        </ParchmentCard>
        <p className="text-center mt-6 text-[#b8d3d5]">New to the apothecary? <button onClick={() => onNavigate('signup')} className="text-[#a77a72] hover:text-[#f2ebd7] font-medium">Create account</button></p>
      </div>
    </div>
  );
}
