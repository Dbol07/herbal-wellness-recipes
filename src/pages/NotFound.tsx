import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";
import { IMAGES } from "@/constants/images";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-[#1b302c] p-4"
      style={{
        backgroundImage: `url(${IMAGES.background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-[#a77a72]/30 bg-[#f2ebd7]/95 shadow-lg p-8 flex flex-col items-center text-center animate-fade-in">
        
        {/* Decorative leaves */}
        <img
          src={IMAGES.herbs[0]}
          alt=""
          className="absolute top-0 left-0 w-16 h-16 opacity-30 -translate-x-4 -translate-y-4"
        />
        <img
          src={IMAGES.herbs[1]}
          alt=""
          className="absolute bottom-0 right-0 w-16 h-16 opacity-30 translate-x-4 translate-y-4"
        />

        {/* 404 Heading */}
        <h1 className="text-6xl font-serif text-[#5f3c43] mb-4">404</h1>
        <p className="text-xl text-[#3c6150] mb-4">
          Oops! Looks like this path is lost in the forest 🌿
        </p>
        <p className="text-sm text-[#5f3c43] mb-6">
          The page <span className="font-mono">{location.pathname}</span> does not exist.
        </p>

        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-2 bg-[#7a9985] text-[#f2ebd7] font-serif rounded shadow hover:bg-[#7a9985]/90 transition-colors"
        >
          <Leaf className="w-4 h-4" /> Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
