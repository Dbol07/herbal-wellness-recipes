import { Leaf, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto py-6 border-t border-[#3c6150]/30">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#b8d3d5]">
            <Leaf className="w-4 h-4 text-[#3c6150]" />
            <span className="font-serif text-sm">Apothecary Herb Garden</span>
          </div>
          
          <p className="text-xs text-[#b8d3d5]/70 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-[#a77a72]" /> for your wellness journey
          </p>
          
          <a 
            href="https://spoonacular.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-[#a77a72] hover:underline"
          >
            Powered by Spoonacular
          </a>
        </div>
      </div>
    </footer>
  );
}
