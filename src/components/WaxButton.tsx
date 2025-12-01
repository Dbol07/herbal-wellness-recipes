import { ReactNode } from 'react';

interface WaxButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
}

export default function WaxButton({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
}: WaxButtonProps) {
  const baseStyles = `
    relative px-6 py-3 rounded-full font-serif font-medium
    transition-all duration-300 transform
    hover:scale-105 hover:shadow-lg
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    before:absolute before:inset-0 before:rounded-full before:opacity-0
    before:transition-opacity hover:before:opacity-100
  `;

  const variants = {
    primary: `
      bg-gradient-to-br from-[#5f3c43] to-[#3c2a2e]
      text-[#f2ebd7] shadow-md shadow-[#5f3c43]/30
      before:bg-gradient-to-br before:from-[#a77a72] before:to-[#5f3c43]
      border border-[#a77a72]/30
    `,
    secondary: `
      bg-gradient-to-br from-[#3c6150] to-[#1b302c]
      text-[#f2ebd7] shadow-md shadow-[#3c6150]/30
      before:bg-gradient-to-br before:from-[#4a7a64] before:to-[#3c6150]
      border border-[#3c6150]/50
    `,
    danger: `
      bg-gradient-to-br from-[#8b3a3a] to-[#5c2828]
      text-[#f2ebd7] shadow-md shadow-[#8b3a3a]/30
      before:bg-gradient-to-br before:from-[#a54545] before:to-[#8b3a3a]
      border border-[#a54545]/30
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
