import React from 'react';

export const SteamAnimation: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative pointer-events-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <path
          d="M35 110 C25 80, 50 60, 35 30 C28 15, 38 5, 42 0"
          stroke="url(#steamGradient1)"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="animate-steam-1"
        />
        <path
          d="M50 115 C62 85, 40 55, 55 25 C60 12, 52 2, 48 0"
          stroke="url(#steamGradient2)"
          strokeWidth="4"
          strokeLinecap="round"
          className="animate-steam-2"
        />
        <path
          d="M65 110 C75 80, 55 60, 68 35 C72 20, 65 10, 62 0"
          stroke="url(#steamGradient1)"
          strokeWidth="3"
          strokeLinecap="round"
          className="animate-steam-3"
        />
        <defs>
          <linearGradient id="steamGradient1" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#FFFDF7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FAF6EC" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="steamGradient2" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FFFDF7" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#FAF6EC" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FAF6EC" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export const KolamDivider: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-3 my-8 opacity-45 select-none ${className}`} aria-hidden="true">
      <div className="h-[1px] w-12 sm:w-24 bg-[#E8DCC4] transition-all duration-500" />
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-[#2F5D3A] overflow-visible">
        <circle cx="14" cy="14" r="3" fill="currentColor" />
        <circle cx="6" cy="14" r="1.5" fill="currentColor" />
        <circle cx="22" cy="14" r="1.5" fill="currentColor" />
        <circle cx="14" cy="6" r="1.5" fill="currentColor" />
        <circle cx="14" cy="22" r="1.5" fill="currentColor" />
        <path
          d="M14 6 C18 6, 22 10, 22 14 C22 18, 18 22, 14 22 C10 22, 6 18, 6 14 C6 10, 10 6, 14 6 Z"
          stroke="currentColor"
          strokeWidth="1.2"
          className="kolam-path-draw"
        />
      </svg>
      <div className="h-[1px] w-12 sm:w-24 bg-[#E8DCC4] transition-all duration-500" />
    </div>
  );
};

export const TempleBorder: React.FC<{ variant?: 'green' | 'gold'; className?: string }> = ({
  variant = 'green',
  className = '',
}) => {
  return (
    <div
      className={`w-full ${variant === 'green' ? 'temple-border' : 'temple-border-gold'} ${className}`}
      aria-hidden="true"
    />
  );
};

export const BananaLeafTransition: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full overflow-hidden leading-none select-none pointer-events-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="relative block w-full h-8 sm:h-12 text-[#2F5D3A]/15 fill-current"
      >
        <path d="M0,0 C150,90 350,-40 600,60 C850,160 1050,30 1200,0 L1200,120 L0,120 Z" />
      </svg>
    </div>
  );
};

export const VegIcon: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <span
      className={`inline-flex items-center justify-center w-4 h-4 border border-[#2F5D3A] p-[2px] rounded-xs bg-[#FFFDF7] ${className}`}
      title="100% Pure Vegetarian"
      aria-label="Pure Vegetarian"
    >
      <span className="w-2 h-2 rounded-full bg-[#2F5D3A]"></span>
    </span>
  );
};
