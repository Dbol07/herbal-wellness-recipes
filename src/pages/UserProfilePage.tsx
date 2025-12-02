// src/pages/UserProfilePage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ParchmentCard from '@/components/ParchmentCard';
import WaxButton from '@/components/WaxButton';
import FormInput from '@/components/FormInput';
import { User, Mail, Target, Save, CheckCircle, Trash2, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    display_name: '',
    dietary_goals: '',
    email: '',
    password: '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => { fetchProfile(); }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setForm({
        display_name: profileData.display_name || '',
        dietary_goals: profileData.dietary_goals || '',
        email: user.email || '',
        password: '',
      });
      setAvatarUrl(profileData.avatar_url || null);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);

    // Update profile table
    if (profile) {
      await supabase
        .from('profiles')
        .update({
          display_name: form.display_name,
          dietary_goals: form.dietary_goals,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          display_name: form.display_name,
          dietary_goals: form.dietary_goals,
          avatar_url: avatarUrl,
        });
    }

    // Update email
    if (form.email !== user.email) {
      const { error } = await supabase.auth.updateUser({ email: form.email });
      if (error) alert(error.message);
    }

    // Update password
    if (form.password) {
      const { error } = await supabase.auth.updateUser({ password: form.password });
      if (error) alert(error.message);
    }

    setSaving(false);
    setSaved(true);
    fetchProfile();
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDeleteAccount = async () => {
    if (!user) return alert("No user logged in.");
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    try {
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Error deleting account: ${data.error}`);
        return;
      }
      alert("Account deleted successfully.");
      navigate("/signup");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while deleting the account.");
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-[#a77a72] border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <User className="w-8 h-8 text-[#a77a72]" />
        <h1 className="font-serif text-3xl text-[#f2ebd7]">Your Profile</h1>
      </div>

      <ParchmentCard variant="leather">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#3c6150]/30">
            <div className="w-16 h-16 rounded-full bg-[#3c6150]/30 flex items-center justify-center relative">
              {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover" /> : <User className="w-8 h-8 text-[#a77a72]" />}
              <input type="file" className="absolute w-full h-full opacity-0 cursor-pointer" onChange={(e) => e.target.files && handleAvatarUpload(e.target.files[0])} />
              <Camera className="absolute bottom-0 right-0 w-5 h-5 text-[#f2ebd7]" />
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

          <FormInput label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="Update email" />
          <FormInput label="New Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="Update password" />

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

        <div className="mt-4">
          <WaxButton onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
            <Trash2 className="w-4 h-4 mr-2" /> Delete Account
          </WaxButton>
        </div>
      </ParchmentCard>
    </div>
  );
}
