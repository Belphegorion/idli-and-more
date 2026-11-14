'use client';

import React, { useState } from 'react';
import { PublicMenuItem, PublicCategory } from '@/lib/types';
import { VegIcon } from '../CulturalMotifs';
import { Search, Plus, Check } from 'lucide-react';

interface MenuPageProps {
  menuItems: PublicMenuItem[];
  categories?: PublicCategory[];
  onAddToCart: (item: PublicMenuItem) => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  menuItems,
  categories = [],
  onAddToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);

  const defaultCategories = [
    { id: 'all', label: 'All Items' },
    { id: 'idlis', label: 'All Day Breakfast & Idlis' },
    { id: 'vada-snacks', label: 'Vada & Snacks' },
    { id: 'pav-bhaji', label: 'Pav Bhaji & More' },
    { id: 'beverages', label: 'Filter Coffee & Drinks' },
  ];

  const categoryList =
    categories.length > 0
      ? [{ id: 'all', label: 'All Items' }, ...categories.map((c) => ({ id: c.slug || c._id, label: c.name }))]
      : defaultCategories;

  const filterTags = [
    { id: 'Ghee', label: 'Desi Ghee' },
    { id: 'Spicy', label: 'Spicy' },
    { id: 'Cheesy', label: 'Cheesy' },
    { id: 'Fried', label: 'Crispy Fried' },
    { id: 'Bestseller', label: 'Bestseller' },
  ];

  const handleAdd = (item: PublicMenuItem) => {
    if (!item.inStock) return;
    onAddToCart(item);
    const itemId = item._id || item.id || item.slug;
    setRecentlyAdded(itemId);
    setTimeout(() => {
      setRecentlyAdded(null);
    }, 1500);
  };

  const filteredItems = menuItems.filter((item) => {
    // Category match: checks category slug or categoryId slug
    const itemCat = item.category || (item.categoryId as any)?.slug || (item.categoryId as any)?._id || '';
    const matchesCategory =
      selectedCategory === 'all' ||
      itemCat === selectedCategory ||
      (item.categoryId && (item.categoryId as any)?.slug === selectedCategory);

    // Search query match
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.nameHindi && item.nameHindi.includes(q));

    // Tag filter
    const matchesTag =
      !activeFilter ||
      (item.tags && item.tags.some((t) => t.toLowerCase() === activeFilter.toLowerCase()));

    return matchesCategory && matchesSearch && matchesTag;
  });

  return (
    <section id="menu" className="py-8 sm:py-12 bg-[#FAF6EC] min-h-[80vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1D14]">
            Our Temple-Morning Menu
          </h1>
          <p className="text-sm text-[#6B5444] mt-2">
            Steamed live upon order. Served with authentic drumstick sambar & fresh coconut chutney.
          </p>
        </div>

        {/* Search bar & Tag filters */}
        <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#E8DCC4] shadow-xs mb-8 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-[#6B5444] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search idli, vada, thatte, cheese, filter coffee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-sm text-[#2B1D14] placeholder-[#6B5444]/60 focus:outline-hidden focus:ring-2 focus:ring-[#2F5D3A]"
            />
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-[#6B5444] mr-1">Filter by:</span>
            {filterTags.map((tag) => {
              const isSelected = activeFilter === tag.id;
              return (
                <button
                  key={tag.id}
                  onClick={() => setActiveFilter(isSelected ? null : tag.id)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#2F5D3A] text-white shadow-xs'
                      : 'bg-[#FAF6EC] text-[#6B5444] hover:bg-[#E8DCC4]/50 border border-[#E8DCC4]'
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(null)}
                className="text-xs text-[#B3261E] font-semibold hover:underline ml-2 cursor-pointer"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {categoryList.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#2F5D3A] text-white shadow-sm'
                    : 'bg-[#FFFDF7] text-[#6B5444] hover:bg-[#FAF6EC] border border-[#E8DCC4]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-[#FFFDF7] rounded-3xl border border-[#E8DCC4] p-8">
            <p className="font-serif text-xl font-bold text-[#2B1D14]">No dishes match your selection</p>
            <p className="text-xs text-[#6B5444] mt-2">Try clearing your search keyword or selected tag filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter(null);
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#2F5D3A] text-white text-xs font-bold"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const itemId = item._id || item.id || item.slug;
              const isAdded = recentlyAdded === itemId;
              const isSoldOut = !item.inStock;

              return (
                <div
                  key={itemId}
                  className={`bg-[#FFFDF7] rounded-2xl p-4 border card-subtle-hover flex flex-col justify-between ${
                    isSoldOut
                      ? 'border-neutral-300 bg-neutral-50/70 opacity-60'
                      : 'border-[#E8DCC4] hover:border-[#2F5D3A]/40'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Dish thumbnail */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#FAF6EC] shrink-0 border border-[#E8DCC4]/50">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-1.5 left-1.5">
                        <VegIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Dish text */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <h2 className="font-serif font-bold text-base text-[#2B1D14] leading-snug">
                          {item.name}
                        </h2>
                      </div>
                      {item.nameHindi && (
                        <p className="font-hindi text-xs text-[#6B5444] opacity-80">
                          {item.nameHindi}
                        </p>
                      )}
                      <p className="text-xs text-[#6B5444] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Sold out tag */}
                      {isSoldOut && (
                        <span className="inline-block text-[10px] font-bold text-[#B3261E] bg-[#B3261E]/10 px-2 py-0.5 rounded-sm mt-1">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom bar: Price and Add button */}
                  <div className="pt-3 mt-3 border-t border-[#E8DCC4]/50 flex items-center justify-between">
                    <span className="font-serif font-bold text-base text-[#2B1D14]">
                      ₹{item.price}
                    </span>

                    {isSoldOut ? (
                      <span className="text-xs text-neutral-400 font-medium px-3 py-1 bg-neutral-200/50 rounded-xl cursor-not-allowed">
                        Unavailable
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAdd(item)}
                        className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-[#2F5D3A] text-white'
                            : 'bg-[#E0A526] hover:bg-[#c9921e] text-[#2B1D14] shadow-xs'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Tray</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
