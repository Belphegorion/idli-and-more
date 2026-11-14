'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/public/Navbar';
import { Hero } from '@/components/public/Hero';
import { BananaLeafTransition } from '@/components/CulturalMotifs';
import { SignaturePicks } from '@/components/public/SignaturePicks';
import { WhyUs } from '@/components/public/WhyUs';
import { MenuPage } from '@/components/public/MenuPage';
import { OurStory } from '@/components/public/OurStory';
import { OutletsSection } from '@/components/public/OutletsSection';
import { Footer } from '@/components/public/Footer';
import { CartDrawer } from '@/components/public/CartDrawer';
import { ReservationModal } from '@/components/public/ReservationModal';
import { PublicMenuItem, PublicCategory, PublicOutlet, CartItem } from '@/lib/types';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS, INITIAL_OUTLETS } from '@/lib/fallbackData';

export default function HomePage() {
  const [menuItems, setMenuItems] = useState<PublicMenuItem[]>(INITIAL_MENU_ITEMS);
  const [categories, setCategories] = useState<PublicCategory[]>(INITIAL_CATEGORIES);
  const [outlets, setOutlets] = useState<PublicOutlet[]>(INITIAL_OUTLETS);
  const [settings, setSettings] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReserveOpen, setIsReserveOpen] = useState(false);

  // Fetch initial data
  const fetchMenuAndSettings = async () => {
    try {
      const [menuRes, settingsRes, outletsRes] = await Promise.all([
        fetch('/api/menu', { cache: 'no-store' }),
        fetch('/api/settings/public', { cache: 'no-store' }),
        fetch('/api/outlets', { cache: 'no-store' }),
      ]);

      if (menuRes.ok) {
        const menuJson = await menuRes.json();
        if (menuJson.items) setMenuItems(menuJson.items);
        if (menuJson.categories) setCategories(menuJson.categories);
      }

      if (settingsRes.ok) {
        const settingsJson = await settingsRes.json();
        if (settingsJson.data) setSettings(settingsJson.data);
      }

      if (outletsRes.ok) {
        const outletsJson = await outletsRes.json();
        if (outletsJson.data) setOutlets(outletsJson.data);
      }
    } catch (err) {
      console.error('Failed to load menu data:', err);
    }
  };

  useEffect(() => {
    fetchMenuAndSettings();

    // 15-second polling for real-time sold-out changes on public menu
    const interval = setInterval(fetchMenuAndSettings, 15000);
    return () => clearInterval(interval);
  }, []);

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
  const totalCartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  const bannerText = settings?.banner?.isEnabled
    ? settings?.banner?.text
    : 'Now Steaming Live in Kolar Road & 7 No. Bhopal | Morning Breakfast starts 7:30 AM';

  // Construct Schema.org Menu JSON-LD structured data
  const menuJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'Idli & More Authentic South Indian Menu',
    description: 'Freshly steamed thatte idlis, podi idlis, medu vadas, dosas, and filter coffee in Bhopal.',
    hasMenuSection: categories.map((cat) => ({
      '@type': 'MenuSection',
      name: cat.name,
      hasMenuItem: menuItems
        .filter((item) => (item.categoryId?._id || item.categoryId) === cat._id)
        .map((item) => ({
          '@type': 'MenuItem',
          name: item.name,
          description: item.description,
          offers: {
            '@type': 'Offer',
            price: item.price,
            priceCurrency: 'INR',
            availability: item.inStock
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          },
          suitableForDiet: 'https://schema.org/VegetarianDiet',
        })),
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC] text-[#2B1D14]">
      {/* Schema.org Menu JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuJsonLd) }}
      />

      {/* Top Banner Notice */}
      <div className="bg-[#2F5D3A] text-[#FAF6EC] py-1.5 px-4 text-center text-xs font-medium tracking-wide flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E0A526] animate-badge-pulse"></span>
        <span>{bannerText}</span>
      </div>

      {/* Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenReserve={() => setIsReserveOpen(true)}
      />

      <main className="flex-1">
        <Hero
          onOrderClick={() => setIsCartOpen(true)}
          onMenuClick={() => {
            const menuEl = document.getElementById('menu');
            menuEl?.scrollIntoView({ behavior: 'smooth' });
          }}
          featuredItems={menuItems}
          onAddToCart={handleAddToCart}
          headline={settings?.hero?.headline}
          subline={settings?.hero?.subline}
          heroImage={settings?.hero?.heroImageUrl}
        />

        <BananaLeafTransition className="-mt-4 mb-2" />

        <SignaturePicks
          items={menuItems}
          onAddToCart={handleAddToCart}
          onViewAllClick={() => {
            const menuEl = document.getElementById('menu');
            menuEl?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <WhyUs />

        <MenuPage
          menuItems={menuItems}
          categories={categories}
          onAddToCart={handleAddToCart}
        />

        <OurStory storyText={settings?.hero?.storyText} />

        <OutletsSection outlets={outlets} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
      />

      {/* Reservation Dialog Modal */}
      <ReservationModal
        isOpen={isReserveOpen}
        onClose={() => setIsReserveOpen(false)}
      />

      {/* Sticky Quick-Order Bar on Mobile (if cart has items) */}
      {totalCartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#2F5D3A] text-white py-3.5 px-5 rounded-2xl shadow-xl flex items-center justify-between font-bold text-sm border border-[#E0A526] active:scale-98 transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="bg-[#E0A526] text-[#2B1D14] w-6 h-6 rounded-full flex items-center justify-center text-xs">
                {totalCartCount}
              </span>
              <span>View Order Tray</span>
            </div>
            <span className="text-[#E0A526]">Tap to Checkout →</span>
          </button>
        </div>
      )}
    </div>
  );
}
