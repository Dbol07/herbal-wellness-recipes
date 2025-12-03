// src/pages/UserProfilePage.tsx
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import WaxButton from "@/components/WaxButton";
import { useNavigate } from "react-router-dom";

export default function UserProfilePage() {
  const { user, signOut, deleteUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!user) return <p>Loading...</p>;

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete your account? This cannot be undone.");
    if (!confirmed) return;

    setLoading(true);
    const result = await deleteUser();
    setLoading(false);

    if (result.success) {
      alert("Account deleted successfully.");
      navigate("/signup");
    } else {
      alert("Error deleting account: " + result.error);
    }
  };

  return (
    <div className="page min-h-screen flex flex-col items-center justify-center bg-dark-cottagecore p-6">
      <h1 className="text-3xl font-serif text-cream mb-6">Profile</h1>
      <p className="text-cream mb-4">Email: {user.email}</p>

      <WaxButton onClick={handleLogout} className="w-full mb-2">
        Logout
      </WaxButton>
      <WaxButton onClick={handleDelete} className="w-full" disabled={loading}>
        {loading ? "Deleting..." : "Delete Account"}
      </WaxButton>
    </div>
  );
}
