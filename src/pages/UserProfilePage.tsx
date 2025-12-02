import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
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
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    display_name: "",
    dietary_goals: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Email + password update fields
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) console.log(error);

    if (data) {
      setProfile(data);
      setForm({
        display_name: data.display_name || "",
        dietary_goals: data.dietary_goals || "",
      });
      setNewEmail(user.email || "");
    }

    setLoading(false);
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return null;

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    // Upload
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.log(uploadError);
      return null;
    }

    // Get public URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError("");

    try {
      let avatar_url = profile?.avatar_url || null;

      if (avatarFile) {
        avatar_url = await uploadAvatar(avatarFile);
      }

      const updateData = {
        display_name: form.display_name,
        dietary_goals: form.dietary_goals,
        avatar_url,
        updated_at: new Date().toISOString(),
      };

      if (profile) {
        await supabase
          .from("profiles")
          .update(updateData)
          .eq("user_id", user.id);
      } else {
        await supabase.from("profiles").insert({
          ...updateData,
          user_id: user.id,
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      fetchProfile();
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    }

    setSaving(false);
  };

  const updateEmail = async () => {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) return alert(error.message);
    alert("Email updated! Check your inbox for confirmation.");
  };

  const updatePassword = async () => {
    if (newPassword.length < 6)
      return alert("Password must be at least 6 characters.");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return alert(error.message);
    alert("Password updated!");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Delete your account permanently?")) return;

    const response = await fetch("/api/deleteUser", {
      method: "POST",
      body: JSON.stringify({ user_id: user?.id }),
    });

    const result = await response.json();

    if (result.error) {
      alert(result.error);
    } else {
      alert("Account deleted.");
      navigate("/signup");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-[#a77a72] border-t-transparent rounded-full"></div>
      </div>
    );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <User className="w-8 h-8 text-[#a77a72]" />
        <h1 className="font-serif text-3xl text-[#f2ebd7]">Your Profile</h1>
      </div>

      {/* Profile Form */}
      <ParchmentCard variant="leather">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 border-b border-[#3c6150]/30 pb-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#3c6150]/30 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  className="object-cover w-full h-full"
                />
              ) : (
                <User className="w-10 h-10 text-[#a77a72]" />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#3c6150] flex items-center gap-2 cursor-pointer">
                <ImageIcon className="w-4 h-4" />
                <span>Change Profile Picture</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
              </label>

              <p className="font-serif text-lg text-[#5f3c43]">
                {form.display_name || "Set your name"}
              </p>
            </div>
          </div>

          <FormInput
            label="Display Name"
            value={form.display_name}
            onChange={(v) => setForm({ ...form, display_name: v })}
            placeholder="Enter your name"
          />

          <FormInput
            label="Dietary Goals"
            type="textarea"
            value={form.dietary_goals}
            onChange={(v) => setForm({ ...form, dietary_goals: v })}
            placeholder="e.g., Reduce sugar, more protein"
          />

          <WaxButton type="submit" disabled={saving}>
            {saving ? "Saving..." : <Save className="w-4 h-4" />}
            Save Profile
          </WaxButton>

          {saved && (
            <span className="text-[#3c6150] flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Saved!
            </span>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      </ParchmentCard>

      {/* Email + Password Section */}
      <ParchmentCard>
        <h3 className="font-serif text-lg text-[#5f3c43] mb-2">
          Account Settings
        </h3>

        {/* Email */}
        <FormInput
          label="Email"
          value={newEmail}
          onChange={setNewEmail}
          placeholder="Update Email"
        />
        <WaxButton onClick={updateEmail}>
          <Mail className="w-4 h-4 mr-2" /> Update Email
        </WaxButton>

        {/* Password */}
        <FormInput
          label="New Password"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Enter new password"
        />
        <WaxButton onClick={updatePassword}>
          <Lock className="w-4 h-4 mr-2" /> Update Password
        </WaxButton>
      </ParchmentCard>

      {/* Delete Account */}
      <ParchmentCard>
        <WaxButton
          onClick={handleDeleteAccount}
          className="bg-red-600 hover:bg-red-700"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete Account
        </WaxButton>
      </ParchmentCard>
    </div>
  );
}
