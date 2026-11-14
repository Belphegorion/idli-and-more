'use client';

import React, { useState, useEffect } from 'react';
import { TempleBorder, VegIcon } from '@/components/CulturalMotifs';
import { CartDrawer } from '@/components/public/CartDrawer';
import { PublicMenuItem, CartItem } from '@/lib/types';
import { ShoppingBag, Plus, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface TablePageProps {
  params: {
    outletSlug: string;
    token: string;
  };
}

export default function TableOrderPage({ params }: { params: { outletSlug: string; token: string } }) {
  const { outletSlug, token } = params;

  const [table, setTable] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);

  const [menuItems, setMenuItems] = useState<PublicMenuItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  // Live order status state
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [orderStatusData, setOrderStatusData] = useState<any>(null);

  // 1. Resolve Table & Menu
  const loadTableAndMenu = async () => {
    try {
      const [tableRes, menuRes] = await Promise.all([
        fetch(`/api/table/${token}`),
        fetch('/api/menu'),
      ]);

      const tableData = await tableRes.json();
      if (!tableRes.ok) {
        setTableError(tableData.error || 'Table not found or ordering disabled.');
        setLoading(false);
        return;
      }
      setTable(tableData.table);

      const menuData = await menuRes.json();
      if (menuData.items) setMenuItems(menuData.items);
      if (menuData.categories) setCategories(menuData.categories);

      setLoading(false);
    } catch (err: any) {
      setTableError('Failed to load table details. Please check your connection.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTableAndMenu();
    // Poll menu every 15s for stock updates
    const interval = setInterval(loadTableAndMenu, 15000);
    return () => clearInterval(interval);
  }, [token]);

  // Check localStorage for active order for this table
  useEffect(() => {
    const savedOrderId = localStorage.getItem(`active_order_${token}`);
    if (savedOrderId) {
      setActiveOrderId(savedOrderId);
    }
  }, [token]);

  // 2. Poll Active Order Status every 5 seconds
  useEffect(() => {
    if (!activeOrderId) return;

    const pollOrderStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${activeOrderId}/status`);
        if (res.ok) {
          const json = await res.json();
          if (json.order) {
            setOrderStatusData(json.order);
            // If served or cancelled, customer can clear after observing
          }
        }
      } catch (err) {
        console.error('Error checking order status:', err);
      }
    };

    pollOrderStatus();
    const statusInterval = setInterval(pollOrderStatus, 5000);
    return () => clearInterval(statusInterval);
  }, [activeOrderId]);

  // Cart operations
  const handleAddToCart = (item: PublicMenuItem) => {
    if (!item.inStock) return;
    const itemId = item._id || item.id || item.slug;

    setCart((prev) => {
      const existing = prev.find((ci) => (ci.item._id || ci.item.id || ci.item.slug) === itemId);
      if (existing) {
        return prev.map((ci) =>
          (ci.item._id || ci.item.id || ci.item.slug) === itemId
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((ci) => {
          const ciId = ci.item._id || ci.item.id || ci.item.slug;
          if (ciId === id) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleClearCart = () => setCart([]);

  // Place Order to Kitchen
  const handlePlaceTableOrder = async () => {
    if (cart.length === 0) return;
    setIsOrdering(true);

    try {
      const itemsPayload = cart.map((ci) => ({
        menuItemId: ci.item._id || ci.item.id,
        qty: ci.quantity,
        note: ci.note || '',
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          items: itemsPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to place order. Please try again.');
        setIsOrdering(false);
        return;
      }

      // Order success!
      setActiveOrderId(data.orderId);
      localStorage.setItem(`active_order_${token}`, data.orderId);
      setCart([]);
      setIsCartOpen(false);
      setIsOrdering(false);
    } catch (err: any) {
      alert('Network error while sending order. Please ask staff.');
      setIsOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6EC] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-[#2F5D3A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-serif font-bold text-lg text-[#2B1D14]">Loading Your Table Menu...</p>
          <p className="text-xs text-[#6B5444]">Connecting directly to Idli & More kitchen</p>
        </div>
      </div>
    );
  }

  if (tableError) {
    return (
      <div className="min-h-screen bg-[#FAF6EC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#FFFDF7] p-8 rounded-3xl border border-[#E8DCC4] shadow-xl text-center space-y-4">
          <AlertCircle className="w-14 h-14 text-[#B3261E] mx-auto" />
          <h1 className="font-serif font-bold text-2xl text-[#2B1D14]">Table Unavailable</h1>
          <p className="text-sm text-[#6B5444] leading-relaxed">{tableError}</p>
          <p className="text-xs text-[#6B5444]/80">
            Please ask our dining staff for assistance or to activate this table.
          </p>
        </div>
      </div>
    );
  }

  const totalCartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  // Status mapping
  const statusSteps = ['received', 'preparing', 'ready', 'served'];
  const currentStatusIndex = statusSteps.indexOf(orderStatusData?.status || 'received');

  return (
    <div className="min-h-screen bg-[#FAF6EC] text-[#2B1D14] flex flex-col pb-20">
      <TempleBorder variant="green" />

      {/* Table Header Banner */}
      <header className="bg-[#FFFDF7] border-b border-[#E8DCC4] px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg text-[#2B1D14]">
                {table.label}
              </span>
              <span className="text-[10px] font-bold bg-[#2F5D3A]/10 text-[#2F5D3A] px-2 py-0.5 rounded-full">
                Active Table
              </span>
            </div>
            <p className="text-xs text-[#6B5444]">
              {table.outlet?.name || 'Idli & More Flagship'} · Bhopal
            </p>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-3.5 py-2 rounded-xl bg-[#2F5D3A] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Tray ({totalCartCount})</span>
          </button>
        </div>
      </header>

      {/* Active Order Live Tracker (if order placed) */}
      {orderStatusData && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-4">
          <div className="bg-[#FFFDF7] rounded-2xl border-2 border-[#2F5D3A] p-4 sm:p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E0A526] block">
                  Live Order Tracker
                </span>
                <h3 className="font-serif font-bold text-xl text-[#2B1D14]">
                  Order #{orderStatusData.orderNo}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#6B5444] block">Bill Total</span>
                <span className="font-serif font-bold text-lg text-[#2B1D14]">
                  ₹{orderStatusData.total}
                </span>
              </div>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
              {[
                { key: 'received', label: 'Received' },
                { key: 'preparing', label: 'Preparing' },
                { key: 'ready', label: 'Ready' },
                { key: 'served', label: 'Served' },
              ].map((step, idx) => {
                const isPassed = currentStatusIndex >= idx;
                const isCurrent = currentStatusIndex === idx;
                return (
                  <div key={step.key} className="space-y-1">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isCurrent
                          ? 'bg-[#E0A526] animate-pulse'
                          : isPassed
                          ? 'bg-[#2F5D3A]'
                          : 'bg-neutral-200'
                      }`}
                    />
                    <span
                      className={`block text-[11px] font-semibold ${
                        isCurrent
                          ? 'text-[#E0A526] font-bold'
                          : isPassed
                          ? 'text-[#2F5D3A]'
                          : 'text-[#6B5444]/60'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {orderStatusData.status === 'cancelled' && (
              <div className="p-3 bg-[#B3261E]/10 rounded-xl text-xs text-[#B3261E] font-medium">
                Order was cancelled: {orderStatusData.cancellationReason || 'Please speak with kitchen staff.'}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-[#E8DCC4] text-xs">
              <span className="text-[#6B5444] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#2F5D3A]" />
                <span>Status updates live every 5s</span>
              </span>

              {orderStatusData.status === 'served' && (
                <button
                  onClick={() => {
                    localStorage.removeItem(`active_order_${token}`);
                    setActiveOrderId(null);
                    setOrderStatusData(null);
                  }}
                  className="text-xs font-bold text-[#2F5D3A] hover:underline"
                >
                  Order Additional Dishes →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Menu for Table Ordering */}
      <main className="max-w-4xl mx-auto w-full px-4 pt-6 space-y-6">
        
        {/* Search & Category Tabs */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Search items for your table..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#FFFDF7] border border-[#E8DCC4] text-sm text-[#2B1D14] focus:outline-hidden focus:ring-2 focus:ring-[#2F5D3A]"
          />

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCat('all')}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedCat === 'all'
                  ? 'bg-[#2F5D3A] text-white'
                  : 'bg-[#FFFDF7] text-[#6B5444] border border-[#E8DCC4]'
              }`}
            >
              All Items
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedCat(c.slug || c._id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  selectedCat === (c.slug || c._id)
                    ? 'bg-[#2F5D3A] text-white'
                    : 'bg-[#FFFDF7] text-[#6B5444] border border-[#E8DCC4]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dishes List */}
        <div className="space-y-3">
          {menuItems
            .filter((item) => {
              const itemCat = item.category || (item.categoryId as any)?.slug || (item.categoryId as any)?._id || '';
              const matchesCat = selectedCat === 'all' || itemCat === selectedCat;
              const matchesSearch =
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase());
              return matchesCat && matchesSearch;
            })
            .map((item) => {
              const itemId = item._id || item.id || item.slug;
              const isSoldOut = !item.inStock;

              return (
                <div
                  key={itemId}
                  className={`bg-[#FFFDF7] p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                    isSoldOut
                      ? 'border-neutral-300 opacity-60 bg-neutral-100/50'
                      : 'border-[#E8DCC4] hover:border-[#2F5D3A]/40'
                  }`}
                >
                  <div className="flex gap-3 items-center min-w-0 flex-1">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF6EC] shrink-0 border border-[#E8DCC4]/50">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <VegIcon className="w-3.5 h-3.5 shrink-0" />
                        <h4 className="font-serif font-bold text-sm text-[#2B1D14] truncate">
                          {item.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[#6B5444] line-clamp-1">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="font-serif font-bold text-sm text-[#2B1D14]">
                          ₹{item.price}
                        </span>
                        {isSoldOut && (
                          <span className="text-[10px] font-bold text-[#B3261E] bg-[#B3261E]/10 px-1.5 py-0.2 rounded-xs">
                            Sold Out
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add button */}
                  <div>
                    {isSoldOut ? (
                      <span className="text-[11px] text-neutral-400 font-medium px-2.5 py-1 bg-neutral-200/50 rounded-lg">
                        Unavailable
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="px-3.5 py-2 rounded-xl bg-[#E0A526] hover:bg-[#c9921e] text-[#2B1D14] font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </main>

      {/* Cart Drawer for Table Order */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        tableLabel={table.label}
        onPlaceTableOrder={handlePlaceTableOrder}
        isTableOrderLoading={isOrdering}
      />

      {/* Sticky Bottom Order Bar on Mobile if cart has items */}
      {totalCartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#2F5D3A] text-white py-3.5 px-5 rounded-2xl shadow-xl flex items-center justify-between font-bold text-sm border border-[#E0A526] active:scale-98 transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="bg-[#E0A526] text-[#2B1D14] w-6 h-6 rounded-full flex items-center justify-center text-xs">
                {totalCartCount}
              </span>
              <span>{table.label} · View Tray</span>
            </div>
            <span className="text-[#E0A526]">Confirm Order →</span>
          </button>
        </div>
      )}
    </div>
  );
}
