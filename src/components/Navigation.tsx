import { useAppStore, Page } from '@/hooks/useAppStore';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Pill, Leaf, AlertTriangle, Settings, BookOpen, LogOut, User } from 'lucide-react';

const navItems: { page: Page; label: string; icon: typeof Home }[] = [
  { page: 'home', label: 'Home', icon: Home },
  { page: 'medications', label: 'Medications', icon: Pill },
  { page: 'supplements', label: 'Supplements', icon: Leaf },
  { page: 'allergies', label: 'Allergies', icon: AlertTriangle },
  { page: 'preferences', label: 'Preferences', icon: Settings },
  { page: 'recipes', label: 'Recipes', icon: BookOpen },
  { page: 'profile', label: 'Profile', icon: User },
];

export default function Navigation() {
  const { currentPage, setPage } = useAppStore();
  const { signOut, user } = useAuth();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1b302c]/95 border-r border-[#3c6150]/30 backdrop-blur-sm">
        <div className="p-6 border-b border-[#3c6150]/30">
          <h1 className="font-serif text-2xl text-[#f2ebd7] flex items-center gap-2">
            <Leaf className="w-6 h-6 text-[#a77a72]" />
            Apothecary
          </h1>
          <p className="text-[#b8d3d5] text-sm mt-1">Herb Garden</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ page, label, icon: Icon }) => (
            <button
              key={page}
              onClick={() => setPage(page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentPage === page
                  ? 'bg-[#3c6150]/50 text-[#f2ebd7] shadow-lg shadow-[#a77a72]/20'
                  : 'text-[#b8d3d5] hover:bg-[#3c6150]/30 hover:text-[#f2ebd7]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#3c6150]/30">
          <p className="text-xs text-[#b8d3d5]/70 mb-2 truncate">{user?.email}</p>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#a77a72] hover:bg-[#8b3a3a]/20 hover:text-[#f2ebd7] transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1b302c]/95 border-t border-[#3c6150]/30 backdrop-blur-sm z-50">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 4).map(({ page, label, icon: Icon }) => (
            <button
              key={page}
              onClick={() => setPage(page)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                currentPage === page ? 'text-[#a77a72]' : 'text-[#b8d3d5]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
          <button
            onClick={() => setPage('profile')}
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${
              currentPage === 'profile' ? 'text-[#a77a72]' : 'text-[#b8d3d5]'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </nav>
    </>
  );
}
