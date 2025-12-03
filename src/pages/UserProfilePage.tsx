// src/pages/UserProfilePage.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import WaxButton from "@/components/WaxButton";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function UserProfilePage() {
  const { user, signOut, deleteUser, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const navigate = useNavigate();

  // Check if user is soft-deleted
  useEffect(() => {
    if (!user) return;

    const checkDeleted = async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("deleted_at")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return;
      }

      setIsDeleted(!!profile?.deleted_at);
    };

    checkDeleted();
  }, [user]);

  if (!user) return <p className="p-6 text-cream">Loading...</p>;

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleDelete = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete your account? This can be restored later."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await deleteUser({ softDelete: true });

      if (result.success) {
        alert("Account marked as deleted.");
        setIsDeleted(true);
      } else {
        alert("Error deleting account: " + result.error);
      }
    } catch (err: any) {
      alert("Unexpected error: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ deleted_at: null })
        .eq("user_id", user.id);

      if (error) {
        alert("Error restoring account: " + error.message);
      } else {
        alert("Account restored successfully.");
        setIsDeleted(false);
      }
    } catch (err: any) {
      alert("Unexpected error: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page min-h-screen flex flex-col items-center justify-center bg-dark-cottagecore p-6">
      <h1 className="text-3xl font-serif text-cream mb-6">Profile</h1>
      <p className="text-cream mb-4"><strong>Email:</strong> {user.email}</p>

      <WaxButton onClick={handleLogout} className="w-full mb-2">
        Logout
      </WaxButton>

      {!isDeleted ? (
        <WaxButton
          onClick={handleDelete}
          className="w-full bg-red-600 hover:bg-red-700"
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete Account"}
        </WaxButton>
      ) : (
        <WaxButton
          onClick={handleRestore}
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={loading}
        >
          {loading ? "Restoring..." : "Restore Account"}
        </WaxButton>
      )}
    </div>
  );
}
