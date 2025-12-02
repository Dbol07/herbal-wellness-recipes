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

  // Fetch profile info & subscribe for live changes
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (data?.display_name) setDisplayName(data.display_name);

      if (data?.avatar_url) {
        const { data: urlData } = supabase
          .storage
          .from('profile-pics')
          .getPublicUrl(data.avatar_url);

        if (urlData?.publicUrl) setAvatarUrl(urlData.publicUrl);
      }
    };

    fetchProfile();

    const subscription = supabase
      .from(`profiles:user_id=eq.${user.id}`)
      .on('UPDATE', payload => {
        setDisplayName(payload.new.display_name);

        if (payload.new.avatar_url) {
          const { data: urlData } = supabase
            .storage
            .from('profile-pics')
            .getPublicUrl(payload.new.avatar_url);

          if (urlData?.publicUrl) setAvatarUrl(urlData.publicUrl);
        }
      })
      .subscribe();

    return () => supabase.removeSubscription(subscription);
  }, [user]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage displayName={displayName} />;
      case 'medications': return <MedicationsPage />;
      case 'supplements': return <SupplementsPage />;
      case 'allergies': return <AllergiesPage />;
      case 'preferences': return <PreferencesPage />;
      case 'recipes': return <RecipesPage />;
      case 'profile': return <UserProfilePage />;
      default: return <HomePage displayName={displayName} />;
    }
  };

  return (
    <div
      className="min-h-screen flex bg-[#1b302c]"
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
        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto flex items-center gap-4 mb-6">

            {/* Profile Picture */}
            <img
              src={
                avatarUrl ||
                '/default-avatar.png' // <- replace with your cottagecore silhouette if you want
              }
              alt="Profile"
              className="w-14 h-14 rounded-full border-2 border-[#f2ebd7] object-cover"
            />

            {/* Greeting */}
            <h1 className="text-3xl text-[#f2ebd7] font-serif">
              Welcome {displayName || 'Friend'}
            </h1>
          </div>

          {renderPage()}
        </main>

        <Footer />
      </div>
    </div>
  );
}
