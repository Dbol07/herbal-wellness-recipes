import { useAppStore } from '@/hooks/useAppStore';
import Navigation from '@/components/Navigation';
import FloatingHerbs from '@/components/FloatingHerbs';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import MedicationsPage from '@/pages/MedicationsPage';
import SupplementsPage from '@/pages/SupplementsPage';
import AllergiesPage from '@/pages/AllergiesPage';
import PreferencesPage from '@/pages/PreferencesPage';
import RecipesPage from '@/pages/RecipesPage';
import UserProfilePage from '@/pages/UserProfilePage';
import { IMAGES } from '@/constants/images';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AppLayout() {
  const { currentPage } = useAppStore();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Fetch profile info from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (profile?.display_name) setDisplayName(profile.display_name);
      if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
    };
    fetchProfile();
  }, [user]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'medications': return <MedicationsPage />;
      case 'supplements': return <SupplementsPage />;
      case 'allergies': return <AllergiesPage />;
      case 'preferences': return <PreferencesPage />;
      case 'recipes': return <RecipesPage />;
      case 'profile': return <UserProfilePage />;
      default: return <HomePage />;
    }
  };

  return (
    <div 
      className="min-h-screen flex bg-[#1b302c] relative"
      style={{
        backgroundImage: `url(${IMAGES.background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-[#1b302c]/85" />
      <FloatingHerbs />
      <Navigation />

      <div className="flex-1 flex flex-col relative z-10">
        {/* Header with Welcome message and avatar */}
        <header className="p-6 md:p-8 flex items-center gap-4 text-cream font-serif text-2xl">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-cream"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#3c6150] flex items-center justify-center text-sm font-semibold text-cream">
              {displayName ? displayName.charAt(0).toUpperCase() : 'F'}
            </div>
          )}
          <span>Welcome, {displayName || 'Friend'}</span>
        </header>

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {renderPage()}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
