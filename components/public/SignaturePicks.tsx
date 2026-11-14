'use client';

import React from 'react';
import { PublicMenuItem } from '@/lib/types';
import { VegIcon } from '../CulturalMotifs';
import { Plus, Flame, Sparkles } from 'lucide-react';

interface SignaturePicksProps {
  items: PublicMenuItem[];
  onAddToCart: (item: PublicMenuItem) => void;
  onViewAllClick: () => void;
}

export const SignaturePicks: React.FC<SignaturePicksProps> = ({
  items,
  onAddToCart,
  onViewAllClick,
}) => {
  const signatureItems = items.filter((i) => i.isChefPick || i.tags?.includes('Bestseller')).slice(0, 6);
  const displayList = signatureItems.length > 0 ? signatureItems : items.slice(0, 6);

  return (
    <section className="py-12 bg-[#FFFDF7] border-y border-[#E8DCC4]/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2F5D3A] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Crowd Favorites</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1D14]">
              Signature Picks from the Tawa & Steamer
            </h2>
          </div>
          <button
            onClick={onViewAllClick}
            className="text-sm font-semibold text-[#2F5D3A] hover:text-[#1F3F28] flex items-center gap-1 group self-start sm:self-auto cursor-pointer"
          >
            <span>Explore full menu</span>
            <span className="transform transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayList.map((item) => {
            const isSoldOut = !item.inStock;
            return (
              <div
                key={item._id || item.id || item.slug}
                className={`group bg-[#FAF6EC] rounded-2xl p-4 border card-subtle-hover flex flex-col justify-between ${
                  isSoldOut
                    ? 'border-neutral-300 opacity-60'
                    : 'border-[#E8DCC4] hover:border-[#2F5D3A]/40'
                }`}
              >
                <div>
                  {/* Photo plinth - calibrated height, perfectly framed */}
                  <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden mb-3.5 bg-[#FAF6EC] border border-[#E8DCC4]/60 shrink-0">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Veg Indicator */}
                    <div className="absolute top-2.5 left-2.5">
                      <VegIcon />
                    </div>

                    {/* Tag Badges */}
                    <div className="absolute top-2.5 right-2.5 flex gap-1">
                      {isSoldOut ? (
                        <span className="bg-[#B3261E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                          Sold Out
                        </span>
                      ) : (
                        <>
                          {item.tags?.includes('Ghee') && (
                            <span className="bg-[#E0A526] text-[#2B1D14] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              Desi Ghee
                            </span>
                          )}
                          {item.tags?.includes('Spicy') && (
                            <span className="bg-[#B3261E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5" /> Spicy
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5">
                    <h3 className="font-serif font-bold text-lg text-[#2B1D14] group-hover:text-[#2F5D3A] transition-colors">
                      {item.name}
                    </h3>
                    {item.nameHindi && (
                      <p className="text-xs text-[#6B5444] opacity-80">
                        {item.nameHindi}
                      </p>
                    )}
                    <p className="text-xs text-[#6B5444] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Price & Add to Cart button */}
                <div className="pt-4 mt-4 border-t border-[#E8DCC4]/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#6B5444]">Price</span>
                    <p className="font-serif font-bold text-lg text-[#2B1D14]">₹{item.price}</p>
                  </div>

                  {isSoldOut ? (
                    <span className="text-xs font-bold text-[#B3261E] bg-[#B3261E]/10 px-3 py-1.5 rounded-xl">
                      Sold out
                    </span>
                  ) : (
                    <button
                      onClick={() => onAddToCart(item)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F5D3A] text-white text-xs font-bold shadow-xs hover:bg-[#1F3F28] active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
