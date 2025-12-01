import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  rotation: number;
}

export default function FloatingHerbs() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      speed: Math.random() * 20 + 30,
      opacity: Math.random() * 0.4 + 0.1,
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            transform: `rotate(${p.rotation}deg)`,
            animationDuration: `${p.speed}s`,
            animationDelay: `${p.id * 0.5}s`,
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-[#3c6150]">
            <path d="M12 2C8 2 4 6 4 10c0 3 2 5 4 6v4c0 1 1 2 2 2h4c1 0 2-1 2-2v-4c2-1 4-3 4-6 0-4-4-8-8-8zm0 2c3 0 6 3 6 6 0 2-1 4-3 5l-1 .5V20h-4v-4.5l-1-.5c-2-1-3-3-3-5 0-3 3-6 6-6z"/>
          </svg>
        </div>
      ))}
      {/* Spores */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={`spore-${i}`}
          className="absolute rounded-full bg-[#a77a72] animate-spore"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            opacity: 0.2 + Math.random() * 0.3,
            animationDuration: `${15 + Math.random() * 20}s`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}
