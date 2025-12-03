import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore, DietaryPreference } from '@/hooks/useAppStore';
import ParchmentCard from '@/components/ParchmentCard';
import { BookOpen, Leaf, Fish, Wheat, Flame, Heart, Sparkles } from 'lucide-react';

// Map preference names to icons
const preferenceIcons: Record<string, typeof Leaf> = {
  vegan: Leaf,
  vegetarian: Leaf,
  keto: Flame,
  paleo: Sparkles,
  pescatarian: Fish,
  'low-fodmap': Heart,
  'anti-inflammatory': Heart,
  'low-histamine': Sparkles,
  'gluten-free': Wheat,
  'dairy-free': Sparkles,
};

export default function PreferencesPage() {
  const { user } = useAuth();
  const { preferences, setPreferences } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('dietary_preferences')
      .select('*')
      .eq('user_id', user!.id)
      .order('preference');
    if (error) {
      console.error('Error fetching preferences:', error.message);
      setLoading(false);
      return;
    }
    setPreferences(data || []);
    setLoading(false);
  };

  const togglePreference = async (pref: DietaryPreference) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('dietary_preferences')
      .update({ enabled: !pref.enabled, updated_at: new Date().toISOString() })
      .eq('id', pref.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating preference:', error.message);
      return;
    }

    // Update local state immediately
    setPreferences((prev) =>
      prev.map((p) => (p.id === pref.id ? { ...p, enabled: !pref.enabled } : p))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-[#a77a72]" />
        <div>
          <h1 className="font-serif text-3xl text-[#f2ebd7]">Dietary Preferences</h1>
          <p className="text-[#b8d3d5] text-sm">Select your dietary requirements</p>
        </div>
      </div>

      <ParchmentCard variant="leather" className="relative overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-[#b8d3d5]">Loading preferences...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preferences.map((pref) => {
              const Icon = preferenceIcons[pref.preference] || Leaf;
              return (
                <button
                  key={pref.id}
                  onClick={() => togglePreference(pref)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    pref.enabled
                      ? 'bg-[#3c6150]/30 border-[#3c6150] shadow-lg shadow-[#3c6150]/20'
                      : 'bg-[#1b302c]/30 border-[#3c6150]/20 hover:border-[#3c6150]/50'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      pref.enabled ? 'bg-[#3c6150]' : 'bg-[#3c6150]/30'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${pref.enabled ? 'text-[#f2ebd7]' : 'text-[#b8d3d5]'}`}
                    />
                  </div>
                  <span
                    className={`font-serif capitalize flex-1 ${
                      pref.enabled ? 'text-[#f2ebd7]' : 'text-[#b8d3d5]'
                    }`}
                  >
                    {pref.preference.replace('-', ' ')}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      pref.enabled ? 'bg-[#3c6150] border-[#3c6150]' : 'border-[#3c6150]/50'
                    }`}
                  >
                    {pref.enabled && (
                      <svg
                        className="w-3 h-3 text-[#f2ebd7]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ParchmentCard>

      <p className="text-center text-[#b8d3d5] text-sm">
        Your preferences will be used to filter safe recipes
      </p>
    </div>
  );
}
