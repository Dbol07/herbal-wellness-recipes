import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/hooks/useAppStore";
import { useNavigate } from "react-router-dom";

import ParchmentCard from "@/components/ParchmentCard";
import WaxButton from "@/components/WaxButton";
import FormInput from "@/components/FormInput";

import {
  User,
  Mail,
  Target,
  Save,
  CheckCircle,
  Trash2,
  Image as ImageIcon,
  KeyRound,
} from "lucide-react";

export default function UserProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form fields
  const [form, setForm] = useState({
    display_name: "",
    dietary_goals: "",
  });

  // Avatar
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Email & Password forms
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load profile
  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user?.id)
      .single();

    if (!error && data) {
      setProfile(data);
      setForm({
        display_name: data.display_name || "",
        dietary_goals: data.dietary_goals || "",
      });
    }

    setLoading(false);
  };

  // Save profile text fields
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSaved(false);

    let err = null;

    if (profile) {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          ...form,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      err = error;
    } else {
      const { error } = await supabase
        .from("user_profiles")
        .insert({
          ...form,
          user_id: user.id,
        });
      err = error;
    }

    if (err) {
      alert("Failed to save: " + err.message);
    } else {
      setSaved(true);
      fetchProfile();
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
  };

  // Upload avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);

    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (error) {
      alert("Upload failed: " + error.message);
      setUploadingAvatar(false);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    // Save to profile
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("user_id", user.id);

    if (updateError) alert(updateError.message);
    else fetchProfile();

    setUploadingAvatar(false);
  };

  // Update email
  const handleEmailUpdate = async () => {
    if (!newEmail) return alert("Enter a valid email.");

    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) alert(error.message);
    else alert("Verification link sent to your new email.");
  };

  // Update password
  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6)
      return alert("Password must be at least 6 characters.");

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) alert(error.message);
    else alert("Password updated!");
  };

  // Delete account (via server route)
  const handleDeleteAccount = async () => {
    if (!confirm("Delete your account permanently?")) return;

    const res = await fetch("/api/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Unable to delete account.");
      return;
    }

    alert("Account deleted.");
    navigate("/signup");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-[#a77a72] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <User className="w-8 h-8 text-[#a77a72]" />
        <h1 className="font-serif text-3xl text-[#f2ebd7]">Your Profile</h1>
      </div>

      {/* Avatar + Profile form */}
      <ParchmentCard variant="leather">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="flex items-center gap-4 border-b pb-4 border-[#3c6150]/30">
            {/* Avatar */}
            <label htmlFor="avatarInput" className="cursor-pointer">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#3c6150]/20 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-[#a77a72]" />
                )}
              </div>
              <input
                id="avatarInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </label>

            <div>
              <p className="font-serif text-xl text-[#5f3c43]">
                {form.display_name || "Set your name"}
              </p>
              <p className="text-sm text-[#3c6150] flex items-center gap-1">
                <Mail className="w-3 h-3" /> {user?.email}
              </p>
            </div>
          </div>

          {/* Display Name */}
          <FormInput
            label="Display Name"
            value={form.display_name}
            onChange={(v) => setForm({ ...form, display_name: v })}
            placeholder="Enter your name"
          />

          {/* Dietary goals */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#5f3c43] flex items-center gap-2">
              <Target className="w-4 h-4 text-[#3c6150]" />
              Dietary Goals
            </label>
            <FormInput
              type="textarea"
              value={form.dietary_goals}
              onChange={(v) => setForm({ ...form, dietary_goals: v })}
              placeholder="e.g., reduce sugar, eat more plants..."
            />
          </div>

          {/* Save button */}
          <div className="flex items-center gap-4">
            <WaxButton type="submit" disabled={saving}>
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile
                </>
              )}
            </WaxButton>
            {saved && (
              <span className="text-[#3c6150] flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Saved!
              </span>
            )}
          </div>
        </form>
      </ParchmentCard>

      {/* Email update */}
      <ParchmentCard>
        <h3 className="font-serif text-lg text-[#5f3c43] mb-2">
          Update Email
        </h3>
        <FormInput
          label="New Email"
          value={newEmail}
          onChange={setNewEmail}
          placeholder="Enter new email"
        />
        <WaxButton onClick={handleEmailUpdate}>Update Email</WaxButton>
      </ParchmentCard>

      {/* Password update */}
      <ParchmentCard>
        <h3 className="font-serif text-lg text-[#5f3c43] mb-2">
          Update Password
        </h3>
        <FormInput
          type="password"
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Enter new password"
        />
        <WaxButton onClick={handlePasswordUpdate}>
          <KeyRound className="w-4 h-4 mr-1" /> Update Password
        </WaxButton>
      </ParchmentCard>

      {/* Delete account */}
      <ParchmentCard>
        <h3 className="font-serif text-lg text-[#5f3c43]">Danger Zone</h3>
        <p className="text-[#3c6150] text-sm mb-3">
          Permanently delete your account and all associated data.
        </p>
        <WaxButton
          onClick={handleDeleteAccount}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete Account
        </WaxButton>
      </ParchmentCard>
    </div>
  );
}
