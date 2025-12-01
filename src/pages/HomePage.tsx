import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/hooks/useAppStore';
import { IMAGES } from '@/constants/images';
import ParchmentCard from '@/components/ParchmentCard';
import { Pill, Leaf, AlertTriangle, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { userName, medications, supplements, allergies, setPage, setMedications, setSupplements, setAllergies } = useAppStore();

  useEffect(() => {
    const fetchData = async () => {
      const [medsRes, suppsRes, allergiesRes] = await Promise.all([
        supabase.from('medications').select('*'),
        supabase.from('supplements').select('*'),
        supabase.from('allergies').select('*'),
      ]);
      if (medsRes.data) setMedications(medsRes.data);
      if (suppsRes.data) setSupplements(suppsRes.data);
      if (allergiesRes.data) setAllergies(allergiesRes.data);
    };
    fetchData();
  }, []);

  const quickRecipes = [
    { id: 1, title: 'Herbal Comfort Soup', safe: 'No allergens detected', img: IMAGES.recipes[0] },
    { id: 2, title: 'Sage Roasted Vegetables', safe: 'Matches your preferences', img: IMAGES.recipes[1] },
    { id: 3, title: 'Lavender Honey Tea', safe: 'No medication conflicts', img: IMAGES.recipes[2] },
    { id: 4, title: 'Rosemary Bread', safe: 'Gluten-free option available', img: IMAGES.recipes[3] },
  ];

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1b302c] to-[#3c6150] p-8 border border-[#a77a72]/20">
        <div className="absolute top-0 right-0 w-48 h-48 opacity-20">
          <img src={IMAGES.herbs[0]} alt="" className="w-full h-full object-contain" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-[#f2ebd7] mb-2">
          Welcome back, <span className="text-[#a77a72]">{userName}</span>
        </h1>
        <p className="text-[#b8d3d5]">Your herbal wellness companion awaits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ParchmentCard className="cursor-pointer hover:scale-[1.02]" onClick={() => setPage('medications')}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#5f3c43]/20">
              <Pill className="w-6 h-6 text-[#5f3c43]" />
            </div>
            <div>
              <p className="text-sm text-[#5f3c43]/70">Medications Today</p>
              <p className="font-serif text-2xl text-[#5f3c43]">{medications.length}</p>
            </div>
          </div>
        </ParchmentCard>

        <ParchmentCard className="cursor-pointer hover:scale-[1.02]" onClick={() => setPage('supplements')}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#3c6150]/20">
              <Leaf className="w-6 h-6 text-[#3c6150]" />
            </div>
            <div>
              <p className="text-sm text-[#3c6150]/70">Supplements Today</p>
              <p className="font-serif text-2xl text-[#3c6150]">{supplements.length}</p>
            </div>
          </div>
        </ParchmentCard>

        <ParchmentCard className="cursor-pointer hover:scale-[1.02]" onClick={() => setPage('allergies')}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#a77a72]/20">
              <AlertTriangle className="w-6 h-6 text-[#a77a72]" />
            </div>
            <div>
              <p className="text-sm text-[#a77a72]/70">Active Allergens</p>
              <p className="font-serif text-2xl text-[#a77a72]">{allergies.length}</p>
            </div>
          </div>
        </ParchmentCard>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#a77a72]" />
          <h2 className="font-serif text-xl text-[#f2ebd7]">Quick Recipe Suggestions</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {quickRecipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => setPage('recipes')}
              className="flex-shrink-0 w-56 rounded-xl overflow-hidden bg-[#f2ebd7]/10 border border-[#a77a72]/20 cursor-pointer hover:scale-105 transition-transform"
            >
              <img src={recipe.img} alt={recipe.title} className="w-full h-32 object-cover" />
              <div className="p-3">
                <h3 className="font-serif text-[#f2ebd7] truncate">{recipe.title}</h3>
                <p className="text-xs text-[#3c6150] mt-1">{recipe.safe}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
