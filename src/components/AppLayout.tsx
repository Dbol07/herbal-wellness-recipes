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

  // Fetch display name and subscribe to updates
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      if (data?.display_name) setDisplayName(data.display_name);
    };

    fetchProfile();

    const subscription = supabase
      .from(`profiles:user_id=eq.${user.id}`)
      .on('UPDATE', payload => {
        setDisplayName(payload.new.display_name);
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
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
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl text-[#f2ebd7] font-serif mb-6">
              Welcome {displayName || 'Friend'}
            </h1>
            {renderPage()}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
