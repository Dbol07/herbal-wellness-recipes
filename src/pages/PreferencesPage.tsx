import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore, DietaryPreference } from '@/hooks/useAppStore';
import ParchmentCard from '@/components/ParchmentCard';
import { BookOpen, Leaf, Fish, Wheat, Flame, Heart, Sparkles } from 'lucide-react';

const preferenceIcons: Record<string, typeof Leaf> = {
  vegan: Leaf, vegetarian: Leaf, keto: Flame, paleo: Sparkles,
  pescatarian: Fish, 'low-fodmap': Heart, 'anti-inflammatory': Heart,
  'low-histamine': Sparkles, 'gluten-free': Wheat, 'dairy-free': Sparkles,
};

export default function PreferencesPage() {
  const { user } = useAuth();
  const { preferences, setPreferences } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPreferences(); }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('dietary_preferences')
      .select('*')
      .eq('user_id', user.id)
      .order('preference');
    if (data) setPreferences(data);
    setLoading(false);
  };

  const togglePreference = async (pref: DietaryPreference) => {
    if (!user) return;
    await supabase
      .from('dietary_preferences')
      .update({ enabled: !pref.enabled })
      .eq('id', pref.id)
      .eq('user_id', user.id);
    fetchPreferences();
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
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#a77a72]">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
            <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="1"/>
          </svg>
        </div>
        
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
                  <div className={`p-2 rounded-full ${pref.enabled ? 'bg-[#3c6150]' : 'bg-[#3c6150]/30'}`}>
                    <Icon className={`w-5 h-5 ${pref.enabled ? 'text-[#f2ebd7]' : 'text-[#b8d3d5]'}`} />
                  </div>
                  <span className={`font-serif capitalize flex-1 ${pref.enabled ? 'text-[#f2ebd7]' : 'text-[#b8d3d5]'}`}>
                    {pref.preference.replace('-', ' ')}
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    pref.enabled ? 'bg-[#3c6150] border-[#3c6150]' : 'border-[#3c6150]/50'
                  }`}>
                    {pref.enabled && (
                      <svg className="w-3 h-3 text-[#f2ebd7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
