import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/hooks/useAppStore';
import ParchmentCard from '@/components/ParchmentCard';
import WaxButton from '@/components/WaxButton';
import { Search, Filter, X, Info, Clock, Users, BookOpen } from 'lucide-react';
import { IMAGES } from '@/constants/images';

interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes?: number;
  servings?: number;
  summary?: string;
}

export default function RecipesPage() {
  const { user } = useAuth();
  const { preferences, allergies } = useAppStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, [user]);

  const fetchRecipes = async () => {
    if (!user) return;
    setLoading(true);
    const enabledDiets = preferences.filter(p => p.enabled).map(p => p.preference).join(',');
    const allergenList = allergies.map(a => a.name.toLowerCase()).join(',');
    
    try {
      const { data } = await supabase.functions.invoke('spoonacular-recipes', {
        body: { diet: enabledDiets, intolerances: allergenList, query: query || 'healthy', number: 12 }
      });
      
      if (data?.results) {
        setRecipes(data.results);
      }
    } catch (err) {
      console.error('Failed to fetch recipes', err);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    fetchRecipes();
  };

  const getSafetyNote = () => {
    const notes = [];
    const enabledPrefs = preferences.filter(p => p.enabled);
    if (enabledPrefs.length) notes.push(`Matches ${enabledPrefs[0].preference}`);
    if (allergies.length) notes.push(`Excludes ${allergies[0].name}`);
    return notes.length ? notes.join(', ') : 'Safe for your profile';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-[#a77a72]" />
        <h1 className="font-serif text-3xl text-[#f2ebd7]">Recipe Book</h1>
      </div>
      
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b8d3d5]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#1b302c]/80 border border-[#3c6150]/50 text-[#f2ebd7] placeholder-[#b8d3d5]/50 focus:outline-none focus:ring-2 focus:ring-[#a77a72]/50"
          />
        </div>
        <WaxButton type="submit"><Filter className="w-4 h-4" /> Search</WaxButton>
      </form>

      {loading ? (
        <div className="text-center py-12 text-[#b8d3d5]">Brewing recipes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe, i) => (
            <div
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className="rounded-xl overflow-hidden bg-[#f2ebd7]/10 border border-[#a77a72]/20 cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <img src={recipe.image || IMAGES.recipes[i % 8]} alt={recipe.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="font-serif text-[#f2ebd7] line-clamp-2">{recipe.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-xs text-[#b8d3d5]">
                  {recipe.readyInMinutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{recipe.readyInMinutes}m</span>}
                  {recipe.servings && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{recipe.servings}</span>}
                </div>
                <p className="text-xs text-[#3c6150] mt-2 flex items-center gap-1"><Info className="w-3 h-3" />{getSafetyNote()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRecipe(null)}>
          <ParchmentCard className="max-w-lg w-full max-h-[80vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedRecipe(null)} className="absolute top-4 right-4 text-[#5f3c43] z-10"><X /></button>
            <img src={selectedRecipe.image} alt={selectedRecipe.title} className="w-full h-48 object-cover rounded-lg mb-4" />
            <h2 className="font-serif text-2xl text-[#5f3c43] mb-2">{selectedRecipe.title}</h2>
            <p className="text-sm text-[#3c6150] prose prose-sm" dangerouslySetInnerHTML={{ __html: selectedRecipe.summary || 'A delicious recipe safe for your dietary profile.' }} />
          </ParchmentCard>
        </div>
      )}

      <p className="text-center text-xs text-[#b8d3d5]">Powered by <a href="https://spoonacular.com" target="_blank" rel="noopener noreferrer" className="text-[#a77a72] hover:underline">Spoonacular</a></p>
    </div>
  );
}
