import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function UserProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [dietaryGoals, setDietaryGoals] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Fetch profile data
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, dietary_goals, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (data?.display_name) setDisplayName(data.display_name);
      if (data?.dietary_goals) setDietaryGoals(data.dietary_goals);
      if (data?.avatar_url) setAvatarUrl(data.avatar_url);
    };

    loadProfile();
  }, [user]);

  // Save profile changes
  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);

    await supabase.from('profiles').upsert({
      user_id: user.id,
      display_name: displayName,
      dietary_goals: dietaryGoals,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    });

    setSavingProfile(false);
    setMessage('Profile saved!');
    setTimeout(() => setMessage(''), 3000);
  };

  // Upload avatar
  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const filePath = `avatars/${user!.id}.png`;

      const { data, error } = await supabase.storage
        .from('profile-pics')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600',
          metadata: { owner: user!.id },
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('profile-pics')
        .getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl);

      // Save avatar URL to profile
      await supabase.from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('user_id', user!.id);

    } catch (err) {
      console.error(err);
      setMessage('Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  // Change email
  const changeEmail = async () => {
    if (!user) return;
    const { error } = await supabase.auth.updateUser({ email });
    if (error) setMessage(error.message);
    else setMessage('Check your new email to confirm change.');
  };

  // Change password
  const changePassword = async () => {
    if (!user) return;
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMessage(error.message);
    else setMessage('Password updated successfully.');
    setPassword('');
  };

  // Delete account
  const deleteAccount = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;

    // Call serverless function to delete account
    const res = await fetch('/api/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });

    const result = await res.json();
    if (res.ok) {
      alert('Account deleted.');
      signOut();
      navigate('/signup');
    } else {
      alert(`Failed: ${result.error}`);
    }
  };

  // Logout
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-[#f2ebd7] font-serif">
      <h1 className="text-3xl">Your Profile</h1>

      {/* Avatar */}
      <div className="space-y-2">
        <p className="text-lg">Profile Picture</p>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            className="w-32 h-32 rounded-full border-2 border-[#f2ebd7] object-cover"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-[#f2ebd7]/20 flex items-center justify-center">
            <span>No photo</span>
          </div>
        )}
        <label>
          <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
          <button
            className="px-4 py-2 bg-[#7a9985] rounded shadow"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload New Photo'}
          </button>
        </label>
      </div>

      {/* Display Name & Dietary Goals */}
      <div className="space-y-3">
        <label className="block text-lg">Display Name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-4 py-2 rounded bg-[#f2ebd7] text-[#1b302c]"
        />

        <label className="block text-lg">Dietary Goals</label>
        <textarea
          value={dietaryGoals}
          onChange={(e) => setDietaryGoals(e.target.value)}
          className="w-full px-4 py-2 rounded bg-[#f2ebd7] text-[#1b302c]"
        />

        <button
          onClick={saveProfile}
          disabled={savingProfile}
          className="px-4 py-2 bg-[#7a9985] rounded shadow"
        >
          {savingProfile ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Change Email */}
      <div className="space-y-2">
        <label className="block text-lg">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded bg-[#f2ebd7] text-[#1b302c]"
        />
        <button
          onClick={changeEmail}
          className="px-4 py-2 bg-[#7a9985] rounded shadow"
        >
          Update Email
        </button>
      </div>

      {/* Change Password */}
      <div className="space-y-2">
        <label className="block text-lg">New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded bg-[#f2ebd7] text-[#1b302c]"
        />
        <button
          onClick={changePassword}
          className="px-4 py-2 bg-[#7a9985] rounded shadow"
        >
          Update Password
        </button>
      </div>

      {/* Messages */}
      {message && <p className="text-red-400">{message}</p>}

      {/* Logout & Delete */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-[#a77a72] rounded shadow"
        >
          Logout
        </button>
        <button
          onClick={deleteAccount}
          className="px-4 py-2 bg-red-600 rounded shadow"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
