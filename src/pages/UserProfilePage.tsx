import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/hooks/useAppStore';
import ParchmentCard from '@/components/ParchmentCard';
import WaxButton from '@/components/WaxButton';
import FormInput from '@/components/FormInput';
import { User, Mail, Target, Save, CheckCircle, Trash2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ display_name: '', dietary_goals: '' });
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
      setForm({
        display_name: data.display_name || '',
        dietary_goals: data.dietary_goals || ''
      });
    }
    setLoading(false);
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
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

  const handleUpdateEmail = async () => {
    if (!user || !newEmail) return alert('Enter a new email');
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) alert(error.message);
    else alert('Check your new email to confirm');
  };

  const handleUpdatePassword = async () => {
    if (!user || !newPassword) return alert('Enter a new password');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert(error.message);
    else alert('Password updated successfully');
  };

  const handleUploadAvatar = async (file: File) => {
    if (!user) return alert('No user logged in');

    const { data, error } = await supabase
      .storage
      .from('profile-pics')
      .upload(`avatars/${user.id}.png`, file, {
        cacheControl: '3600',
        upsert: true,
        metadata: { owner: user.id }
      });

    if (error) {
      console.error('Upload failed:', error.message);
      alert('Failed to upload avatar');
    } else {
      const { publicUrl } = supabase
        .storage
        .from('profile-pics')
        .getPublicUrl(`avatars/${user.id}.png`);

      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      alert('Profile picture updated!');
      fetchProfile();
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return alert('No user logged in');
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;

    // Call API route to delete user
    const res = await fetch('/api/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    const result = await res.json();
    if (res.ok) {
      alert('Account deleted successfully.');
      navigate('/signup');
    } else alert(result.error);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">
      <div className="animate-spin w-8 h-8 border-2 border-[#a77a72] border-t-transparent rounded-full" />
    </div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-center gap-3">
        <User className="w-8 h-8 text-[#a77a72]" />
        <h1 className="font-serif text-3xl text-[#f2ebd7]">Your Profile</h1>
      </div>

      {/* Profile Info */}
      <ParchmentCard variant="leather">
        <form onSubmit={handleSubmitProfile} className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#3c6150]/30">
            <div className="w-16 h-16 rounded-full bg-[#3c6150]/30 flex items-center justify-center">
              {profile?.avatar_url 
                ? <img src={profile.avatar_url} className="w-16 h-16 rounded-full object-cover" />
                : <User className="w-8 h-8 text-[#a77a72]" />}
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

          {/* Avatar Upload */}
          <div>
            <label className="text-sm text-[#5f3c43] font-medium">Profile Picture</label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUploadAvatar(e.target.files[0])} />
          </div>

          <div className="flex items-center gap-4">
            <WaxButton type="submit" disabled={saving}>
              {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Profile</>}
            </WaxButton>
            {saved && <span className="text-[#3c6150] flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Saved!</span>}
          </div>
        </form>
      </ParchmentCard>

      {/* Email & Password Update */}
      <ParchmentCard>
        <h3 className="font-serif text-lg text-[#5f3c43] mb-2">Account Settings</h3>
        <div className="space-y-4">
          <div>
            <FormInput label="New Email" value={newEmail} onChange={(v) => setNewEmail(v)} placeholder="Enter new email" />
            <WaxButton onClick={handleUpdateEmail} className="mt-2">Update Email</WaxButton>
          </div>
          <div>
            <FormInput label="New Password" value={newPassword} onChange={(v) => setNewPassword(v)} type="password" placeholder="Enter new password" />
            <WaxButton onClick={handleUpdatePassword} className="mt-2">Update Password</WaxButton>
          </div>
        </div>
      </ParchmentCard>

      {/* Delete Account */}
      <ParchmentCard>
        <h3 className="font-serif text-lg text-[#5f3c43] mb-2">Danger Zone</h3>
        <WaxButton onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
          <Trash2 className="w-4 h-4 mr-2" /> Delete Account
        </WaxButton>
      </ParchmentCard>
    </div>
  );
}
