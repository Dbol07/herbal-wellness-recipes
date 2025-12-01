import { ReactNode, MouseEvent } from 'react';

interface ParchmentCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'leather' | 'linen';
  glow?: boolean;
  onClick?: (e: MouseEvent) => void;
}

export default function ParchmentCard({
  children,
  className = '',
  variant = 'default',
  glow = false,
  onClick,
}: ParchmentCardProps) {
  const variants = {
    default: 'bg-gradient-to-br from-[#f2ebd7] to-[#e8dfc8]',
    leather: 'bg-gradient-to-br from-[#5f3c43]/90 to-[#3c2a2e]/90',
    linen: 'bg-gradient-to-br from-[#2a3d38] to-[#1b302c]',
  };

  const textColors = {
    default: 'text-[#1b302c]',
    leather: 'text-[#f2ebd7]',
    linen: 'text-[#f2ebd7]',
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${variants[variant]}
        ${textColors[variant]}
        rounded-xl p-5 
        border border-[#a77a72]/20
        shadow-lg
        transition-all duration-300
        hover:shadow-xl hover:shadow-[#a77a72]/10
        ${glow ? 'ring-1 ring-[#a77a72]/30' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
