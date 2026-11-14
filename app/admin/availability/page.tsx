'use client';

import React, { useState, useEffect } from 'react';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminCardSkeleton } from '@/components/admin/AdminSkeleton';
import { VegIcon } from '@/components/CulturalMotifs';
import { Search, RefreshCw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useAdminContext } from '@/components/admin/AdminContext';

export default function AvailabilityPage() {
  const { onOpenMobileSidebar, userRole } = useAdminContext();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/menu');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch availability menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Optimistic stock toggle
  const handleToggleStock = async (itemId: string, currentInStock: boolean) => {
    const nextStock = !currentInStock;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) => (item._id === itemId ? { ...item, inStock: nextStock } : item))
    );

    try {
      const res = await fetch(`/api/admin/menu/${itemId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: nextStock }),
      });

      if (!res.ok) {
        // Rollback on error
        setItems((prev) =>
          prev.map((item) => (item._id === itemId ? { ...item, inStock: currentInStock } : item))
        );
        showToast('Error: Failed to update stock status on server.');
        return;
      }

      const data = await res.json();
      showToast(
        nextStock
          ? `✓ Marked "${data.name}" back IN STOCK.`
          : `✗ Marked "${data.name}" as SOLD OUT (86).`
      );
    } catch (err) {
      // Rollback
      setItems((prev) =>
        prev.map((item) => (item._id === itemId ? { ...item, inStock: currentInStock } : item))
      );
      showToast('Network error while updating stock.');
    }
  };

  // Reset all items to in-stock
  const handleResetAllStock = async () => {
    if (!confirm('Mark all active menu items back IN STOCK for today?')) return;

    try {
      const res = await fetch('/api/admin/menu/reset-stock', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`✓ All dishes restored to IN STOCK (${data.modifiedCount} items).`);
        fetchItems();
      }
    } catch (err) {
      showToast('Error resetting stock.');
    }
  };

  const filteredItems = items.filter((item) => {
    const itemCat = item.categoryId?._id || item.categoryId || '';
    const matchesCat = selectedCat === 'all' || itemCat === selectedCat;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.nameHindi && item.nameHindi.includes(search));
    return matchesCat && matchesSearch;
  });

  const soldOutCount = items.filter((i) => !i.inStock).length;

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Today's Availability (86 List)"
        subtitle="One-tap stock controls for floor and kitchen staff"
        onOpenMobileMenu={onOpenMobileSidebar}
        actions={
          <button
            onClick={handleResetAllStock}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2F5D3A] text-white font-bold text-xs shadow-xs hover:bg-[#1F3F28] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All to In-Stock</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
        
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-[#2F5D3A] text-white font-semibold text-xs shadow-lg flex items-center justify-between animate-in fade-in duration-200">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="p-1 font-bold">✕</button>
          </div>
        )}

        {/* Top Controls: Search + Sold Out Indicator */}
        <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#E8DCC4] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6B5444] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes to toggle availability..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-xs text-[#2B1D14] focus:outline-hidden focus:ring-2 focus:ring-[#2F5D3A]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B5444]">Currently Sold Out:</span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                soldOutCount > 0 ? 'bg-[#B3261E] text-white' : 'bg-[#2F5D3A]/10 text-[#2F5D3A]'
              }`}
            >
              {soldOutCount} items
            </span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCat('all')}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCat === 'all'
                ? 'bg-[#2F5D3A] text-white shadow-xs'
                : 'bg-[#FFFDF7] text-[#6B5444] border border-[#E8DCC4]'
            }`}
          >
            All Categories ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => (i.categoryId?._id || i.categoryId) === cat._id).length;
            return (
              <button
                key={cat._id}
                onClick={() => setSelectedCat(cat._id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCat === cat._id
                    ? 'bg-[#2F5D3A] text-white shadow-xs'
                    : 'bg-[#FFFDF7] text-[#6B5444] border border-[#E8DCC4]'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Large Tap Target Availability Grid */}
        {loading ? (
          <AdminCardSkeleton count={8} />
        ) : filteredItems.length === 0 ? (
          <div className="bg-[#FFFDF7] p-12 rounded-3xl border border-[#E8DCC4] text-center space-y-2">
            <p className="font-serif font-bold text-lg text-[#2B1D14]">No dishes found</p>
            <p className="text-xs text-[#6B5444]">Try a different search keyword or category tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const isInStock = item.inStock;

              return (
                <div
                  key={item._id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[140px] ${
                    isInStock
                      ? 'bg-[#FFFDF7] border-[#E8DCC4] shadow-xs'
                      : 'bg-neutral-100 border-neutral-300 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <VegIcon className="w-3.5 h-3.5" />
                        <h3 className="font-serif font-bold text-base text-[#2B1D14] leading-snug">
                          {item.name}
                        </h3>
                      </div>
                      {item.nameHindi && (
                        <p className="font-hindi text-xs text-[#6B5444] opacity-80">
                          {item.nameHindi}
                        </p>
                      )}
                      <p className="font-serif font-bold text-sm text-[#2F5D3A]">
                        ₹{item.price}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                        isInStock
                          ? 'bg-[#2F5D3A]/10 text-[#2F5D3A]'
                          : 'bg-[#B3261E]/10 text-[#B3261E]'
                      }`}
                    >
                      {isInStock ? 'In Stock' : 'Sold Out'}
                    </span>
                  </div>

                  {/* Big Touch-Friendly Toggle Button (Minimum 48px height for kitchen phone/tablet taps) */}
                  <div className="pt-4 mt-2 border-t border-[#E8DCC4]/50">
                    <button
                      onClick={() => handleToggleStock(item._id, isInStock)}
                      className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer ${
                        isInStock
                          ? 'bg-[#FAF6EC] text-[#6B5444] border border-[#E8DCC4] hover:bg-[#B3261E]/10 hover:text-[#B3261E] hover:border-[#B3261E]'
                          : 'bg-[#2F5D3A] text-white hover:bg-[#1F3F28]'
                      }`}
                      style={{ minHeight: '48px' }}
                    >
                      {isInStock ? (
                        <>
                          <XCircle className="w-4 h-4 text-[#B3261E]" />
                          <span>Mark Sold Out (86)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#E0A526]" />
                          <span>Mark In Stock</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
