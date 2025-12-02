import { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ParchmentCard from '@/components/ParchmentCard';
import WaxButton from '@/components/WaxButton';
import FormInput from '@/components/FormInput';
import { User, Mail, Target, Save, CheckCircle, Trash2, Lock, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserProfilePage() {
  const { user, setDisplayName } = useAuth(); // assuming you can store display name globally
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({
    display_name: '',
    dietary_goals: '',
    avatar_url: ''
  });

  const [emailForm, setEmailForm] = useState('');
  const [passwordForm, setPasswordForm] = useState('');

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [user]);

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
      setForm({
        display_name: data.display_name || '',
        dietary_goals: data.dietary_goals || '',
        avatar_url: data.avatar_url || ''
      });

      // Update global display name for homepage
      if (setDisplayName) setDisplayName(data.display_name || '');
    }
    setLoading(false);
  };

  // Save profile info
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSaved(false);

    if (profile) {
      await supabase
        .from('profiles')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('profiles')
        .insert({ ...form, user_id: user.id });
    }

    setSaving(false);
    setSaved(true);
    fetchProfile();
    setTimeout(() => setSaved(false), 3000);
  };

  // Email update
  const handleEmailUpdate = async () => {
    if (!emailForm || !user) return;
    const { error } = await supabase.auth.updateUser({ email: emailForm });
    if (error) alert(error.message);
    else alert('Check your email to confirm the new address.');
    setEmailForm('');
  };

  // Password update
  const handlePasswordUpdate = async () => {
    if (!passwordForm || !user) return;
    const { error } = await supabase.auth.updateUser({ password: passwordForm });
    if (error) alert(error.message);
    else alert('Password updated successfully.');
    setPasswordForm('');
  };

  // Avatar upload
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) return alert(uploadError.message);

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

    await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    setForm(prev => ({ ...prev, avatar_url: data.publicUrl }));
  };

  // Delete account (calls API route)
  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    const res = await fetch('/api/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id })
    });

    if (res.ok) {
      alert('Account deleted.');
      navigate('/signup');
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to delete account.');
    }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-[#a77a72] border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <User className="w-8 h-8 text-[#a77a72]" />
        <h1 className="font-serif text-3xl text-[#f2ebd7]">Your Profile</h1>
      </div>

      {/* Profile Info */}
      <ParchmentCard variant="leather">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#3c6150]/30">
            <div className="w-16 h-16 rounded-full bg-[#3c6150]/30 flex items-center justify-center overflow-hidden">
              {form.avatar_url ? <img src={form.avatar_url} className="w-16 h-16 object-cover rounded-full" /> : <User className="w-8 h-8 text-[#a77a72]" />}
            </div>
            <div>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="mt-2 text-sm text-[#5f3c43]" />
            </div>
          </div>

          <FormInput label="Display Name" value={form.display_name} onChange={(v) => setForm({ ...form, display_name: v })} placeholder="Enter your name" />

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#5f3c43]">
              <Target className="w-4 h-4 text-[#3c6150]" /> Dietary Goals
            </label>
            <FormInput label="" value={form.dietary_goals} onChange={(v) => setForm({ ...form, dietary_goals: v })} type="textarea" placeholder="e.g., Reduce sugar intake, eat more vegetables..." />
          </div>

          <WaxButton type="submit" disabled={saving}>
            {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Profile</>}
          </WaxButton>
          {saved && <span className="text-[#3c6150] flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Saved!</span>}
        </form>
      </ParchmentCard>

      {/* Account Info */}
      <ParchmentCard>
        <h3 className="font-serif text-lg text-[#5f3c43] mb-2">Account Information</h3>

        {/* Email update */}
        <div className="flex items-center gap-2 mb-2">
          <input type="email" placeholder="New email" value={emailForm} onChange={(e) => setEmailForm(e.target.value)} className="input-field flex-1" />
          <WaxButton onClick={handleEmailUpdate}><Mail className="w-4 h-4 mr-1" /> Update Email</WaxButton>
        </div>

        {/* Password update */}
        <div className="flex items-center gap-2 mb-2">
          <input type="password" placeholder="New password" value={passwordForm} onChange={(e) => setPasswordForm(e.target.value)} className="input-field flex-1" />
          <WaxButton onClick={handlePasswordUpdate}><Lock className="w-4 h-4 mr-1" /> Update Password</WaxButton>
        </div>

        <div className="space-y-2 text-sm mt-4">
          <p><span className="font-medium">Email:</span> {user?.email}</p>
          <p><span className="font-medium">Member since:</span> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
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
