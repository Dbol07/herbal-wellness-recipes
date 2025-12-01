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

export default function AppLayout() {
  const { currentPage } = useAppStore();

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
            {renderPage()}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
