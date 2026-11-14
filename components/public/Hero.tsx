'use client';

import React from 'react';
import Image from 'next/image';
import { SteamAnimation } from '../CulturalMotifs';
import { ArrowRight, Flame, Sparkles } from 'lucide-react';
import { PublicMenuItem } from '@/lib/types';

interface HeroProps {
  onOrderClick: () => void;
  onMenuClick: () => void;
  featuredItems: PublicMenuItem[];
  onAddToCart: (item: PublicMenuItem) => void;
  headline?: string;
  subline?: string;
  heroImage?: string;
}

export const Hero: React.FC<HeroProps> = ({
  onOrderClick,
  onMenuClick,
  featuredItems,
  onAddToCart,
  headline = 'Soft idlis. Hot sambar. Made like home.',
  subline = 'Steamed live every 20 minutes on aromatic banana leaves. Pure cultured cow ghee, stone-ground podi, and the serene calm of a traditional temple morning in Bhopal.',
  heroImage = 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
}) => {
  const topPick = featuredItems[0];

  return (
    <section id="hero" className="relative overflow-hidden pt-6 sm:pt-10 pb-16 bg-[#FAF6EC]">
      {/* Kolam corner subtle motif */}
      <div className="absolute top-2 right-4 w-48 h-48 opacity-15 pointer-events-none select-none hidden md:block">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-[#2F5D3A]">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" className="kolam-path-draw" />
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2F5D3A]/10 text-[#2F5D3A] text-xs font-semibold tracking-wide border border-[#2F5D3A]/20 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#2F5D3A] animate-badge-pulse"></span>
              <span>Kolar Road & 7 No. · Bhopal</span>
              <span className="opacity-40">|</span>
              <span className="text-[#6B5444] font-medium">Fresh Batter Ground Daily</span>
            </div>

            {/* Serif Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2B1D14] leading-[1.12]">
              Soft idlis. <br />
              <span className="text-[#2F5D3A] italic">Hot sambar.</span> <br />
              Made like home.
            </h1>

            {/* Sub-line */}
            <p className="text-base sm:text-lg text-[#6B5444] max-w-xl font-normal leading-relaxed">
              {subline}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOrderClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#E0A526] hover:bg-[#c9921e] text-[#2B1D14] font-bold text-base shadow-sm hover:shadow-md transition-all btn-gold-glow cursor-pointer"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onMenuClick}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-[#2F5D3A] text-[#2F5D3A] hover:bg-[#2F5D3A]/5 font-semibold text-base transition-all cursor-pointer"
              >
                <span>View Full Menu</span>
              </button>

              <div className="w-full sm:w-auto text-xs text-[#6B5444] flex items-center gap-1.5 pt-1 sm:pt-0 sm:pl-2">
                <span className="w-2 h-2 rounded-full bg-[#2F5D3A]"></span>
                <span>Steaming fresh every 20 minutes</span>
              </div>
            </div>

            {/* Trust Points */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E8DCC4]">
              <div className="space-y-1">
                <span className="font-serif font-bold text-xl sm:text-2xl text-[#2F5D3A] block">100%</span>
                <span className="text-[11px] sm:text-xs text-[#6B5444] block">Pure Desi Ghee</span>
              </div>
              <div className="space-y-1">
                <span className="font-serif font-bold text-xl sm:text-2xl text-[#2F5D3A] block">0%</span>
                <span className="text-[11px] sm:text-xs text-[#6B5444] block">Soda or Preservatives</span>
              </div>
              <div className="space-y-1">
                <span className="font-serif font-bold text-xl sm:text-2xl text-[#2F5D3A] block">7:30 AM</span>
                <span className="text-[11px] sm:text-xs text-[#6B5444] block">Hot Morning Breakfast</span>
              </div>
            </div>
          </div>

          {/* Right Visual Plinth: Live Steam + Banana Leaf Plate */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md">
              
              {/* Animated Rising Steam Wisps */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 z-20 pointer-events-none">
                <SteamAnimation />
              </div>

              {/* Banana Leaf Plinth Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FFFDF7] bg-[#2F5D3A] p-2">
                <div className="relative aspect-[4/3] max-h-[360px] w-full rounded-2xl overflow-hidden bg-[#FAF6EC]">
                  <img
                    src={heroImage}
                    alt="Authentic Ghee Podi Thatte Idli on fresh banana leaf"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Highlight pill on hero dish */}
                  <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#E0A526] block">
                        Signature Specialty
                      </span>
                      <p className="font-serif font-bold text-base sm:text-lg">
                        Ghee Podi Thatte Idli
                      </p>
                    </div>
                    {topPick && (
                      <button
                        onClick={() => onAddToCart(topPick)}
                        className="px-3 py-1.5 rounded-lg bg-[#E0A526] text-[#2B1D14] text-xs font-bold shadow-md hover:bg-[#c9921e] transition-colors"
                      >
                        + Add ₹250
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Floating review card */}
              <div className="absolute -bottom-4 -left-3 sm:-left-6 bg-[#FFFDF7] p-3 rounded-2xl border border-[#E8DCC4] shadow-lg flex items-center gap-3 max-w-[240px]">
                <div className="w-9 h-9 rounded-full bg-[#E0A526]/20 text-[#2B1D14] flex items-center justify-center font-serif font-bold text-sm shrink-0">
                  ★ 4.8
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#2B1D14]">4.8 Google Reviews</p>
                  <p className="text-[10px] text-[#6B5444]">Loved across Kolar & Arera Colony</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
