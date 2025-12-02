import { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/hooks/useAppStore';
import ParchmentCard from '@/components/ParchmentCard';
import WaxButton from '@/components/WaxButton';
import FormInput from '@/components/FormInput';
import { User, Mail, Target, Save, CheckCircle, Trash2, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserProfilePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ display_name: '', dietary_goals: '' });
  const [emailForm, setEmailForm] = useState('');
  const [passwordForm, setPasswordForm] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => { fetchProfile(); }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) {
      setProfile(data);
      setForm({ display_name: data.display_name || '', dietary_goals: data.dietary_goals || '' });
      setAvatarUrl(data.avatar_url || '');
      setEmailForm(user.email || '');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);

    let avatar_path = profile?.avatar_url || '';
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-avatar.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage.from('avatars')
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) {
        alert(uploadError.message);
        setSaving(false);
        return;
      }

      const { publicURL } = supabase.storage.from('avatars').getPublicUrl(fileName);
      avatar_path = publicURL || '';
    }

    if (profile) {
      await supabase
        .from('profiles')
        .update({ ...form, avatar_url: avatar_path, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('profiles')
        .insert({ ...form, user_id: user.id, avatar_url: avatar_path });
    }

    setSaving(false);
    setSaved(true);
    fetchProfile();
    setTimeout(() => setSaved(false), 3000);
  };

  const handleEmailUpdate = async () => {
    if (!user) return;
    const { error } = await supabase.auth.updateUser({ email: emailForm });
    if (error) alert(error.message);
    else alert('Check your new email for a confirmation link.');
  };

  const handlePasswordUpdate = async () => {
    if (!user) return;
    const { error } = await supabase.auth.updateUser({ password: passwordForm });
    if (error) alert(error.message);
    else alert('Password updated successfully.');
    setPasswordForm('');
  };

  const handleDeleteAccount = async () => {
    if (!user) return alert("No user logged in.");
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    const res = await fetch('/api/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json();
    if (res.ok) {
      alert('Account deleted successfully.');
      setUser(null);
      navigate('/signup');
    } else {
      alert(data.error || 'Failed to delete account.');
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setAvatarFile(e.target.files[0]);
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
            <div className="relative w-16 h-16 rounded-full bg-[#3c6150]/30 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : <User className="w-8 h-8 text-[#a77a72]" />}
              <label className="absolute bottom-0 right-0 p-1 bg-[#a77a72] rounded-full cursor-pointer">
                <Camera className="w-3 h-3 text-[#f2ebd7]" />
                <input type="file" className="hidden" onChange={handleAvatarChange} />
              </label>
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
            <FormInput label="" value={form.dietary_goals} onChange={(v) => setForm({ ...form, dietary_goals: v })} type="textarea" placeholder="e.g., Reduce sugar intake, eat more vegetables..." />
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
          <FormInput label="Update Email" value={emailForm} onChange={(v) => setEmailForm(v)} placeholder="Enter new email" />
          <WaxButton onClick={handleEmailUpdate}>Update Email</WaxButton>

          <FormInput label="Update Password" type="password" value={passwordForm} onChange={(v) => setPasswordForm(v)} placeholder="Enter new password" />
          <WaxButton onClick={handlePasswordUpdate}>Update Password</WaxButton>

          <p className="text-[#3c6150]"><span className="font-medium">Member since:</span> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
        </div>

        <div className="mt-4">
          <WaxButton onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
            <Trash2 className="w-4 h-4 mr-2" /> Delete Account
          </WaxButton>
        </div>
      </ParchmentCard>
    </div>
  );
}
