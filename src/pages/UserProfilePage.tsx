import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/hooks/useAppStore';
import ParchmentCard from '@/components/ParchmentCard';
import WaxButton from '@/components/WaxButton';
import FormInput from '@/components/FormInput';
import { User, Mail, Target, Save, CheckCircle } from 'lucide-react';

export default function UserProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ display_name: '', dietary_goals: '' });

  useEffect(() => { fetchProfile(); }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
    if (data) {
      setProfile(data);
      setForm({ display_name: data.display_name || '', dietary_goals: data.dietary_goals || '' });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);
    
    if (profile) {
      await supabase.from('user_profiles').update({ ...form, updated_at: new Date().toISOString() }).eq('user_id', user.id);
    } else {
      await supabase.from('user_profiles').insert({ ...form, user_id: user.id });
    }
    
    setSaving(false);
    setSaved(true);
    fetchProfile();
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-[#a77a72] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <User className="w-8 h-8 text-[#a77a72]" />
        <h1 className="font-serif text-3xl text-[#f2ebd7]">Your Profile</h1>
      </div>

      <ParchmentCard variant="leather">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#3c6150]/30">
            <div className="w-16 h-16 rounded-full bg-[#3c6150]/30 flex items-center justify-center">
              <User className="w-8 h-8 text-[#a77a72]" />
            </div>
            <div>
              <p className="font-serif text-lg text-[#5f3c43]">{form.display_name || 'Set your name'}</p>
              <p className="text-sm text-[#3c6150] flex items-center gap-1"><Mail className="w-3 h-3" /> {user?.email}</p>
            </div>
          </div>

          <FormInput label="Display Name" value={form.display_name} onChange={(v) => setForm({ ...form, display_name: v })} placeholder="Enter your name" />
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#5f3c43]">
              <Target className="w-4 h-4 text-[#3c6150]" /> Dietary Goals
            </label>
            <FormInput label="" value={form.dietary_goals} onChange={(v) => setForm({ ...form, dietary_goals: v })} type="textarea" placeholder="e.g., Reduce sugar intake, eat more vegetables, follow Mediterranean diet..." />
          </div>

          <div className="flex items-center gap-4">
            <WaxButton type="submit" disabled={saving}>
              {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Profile</>}
            </WaxButton>
            {saved && <span className="text-[#3c6150] flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Saved!</span>}
          </div>
        </form>
      </ParchmentCard>

      <ParchmentCard>
        <h3 className="font-serif text-lg text-[#5f3c43] mb-2">Account Information</h3>
        <div className="space-y-2 text-sm">
          <p className="text-[#3c6150]"><span className="font-medium">Email:</span> {user?.email}</p>
          <p className="text-[#3c6150]"><span className="font-medium">Member since:</span> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
        </div>
      </ParchmentCard>
    </div>
  );
}
