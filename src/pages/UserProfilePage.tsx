import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function UserProfilePage() {
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch profile data ---------------------------------------------
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (data?.display_name) setDisplayName(data.display_name);
      if (data?.avatar_url) setAvatarUrl(data.avatar_url);
    };

    loadProfile();
  }, [user]);

  // Handle display name save ----------------------------------------
  const saveProfile = async () => {
    if (!user) return;

    await supabase.from('profiles').update({
      display_name: displayName,
    })
    .eq('user_id', user.id);
  };

  // Upload avatar ----------------------------------------------------
  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);

      const file = event.target.files[0];
      if (!file) return;

      const filePath = `avatars/${user!.id}.png`;

      // Upload + enforce metadata.owner for policies
      const { data, error } = await supabase.storage
        .from('profile-pics')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600',
          metadata: { owner: user!.id },
        });

      if (error) throw error;

      // Create a public URL
      const { data: urlData } = supabase.storage
        .from('profile-pics')
        .getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl);

      // Save to profile
      await supabase.from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('user_id', user!.id);

    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="text-[#f2ebd7] font-serif space-y-6">
      <h2 className="text-2xl mb-4">Your Profile</h2>

      {/* Avatar Upload */}
      <div className="space-y-3">
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

        <label className="block">
          <input 
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            className="hidden"
          />
          <button
            className="px-4 py-2 bg-[#7a9985] rounded shadow"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload New Photo'}
          </button>
        </label>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <label className="block text-lg">Display Name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-4 py-2 rounded bg-[#f2ebd7] text-[#1b302c]"
        />
        <button
          onClick={saveProfile}
          className="px-4 py-2 bg-[#7a9985] rounded shadow"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
