'use client';

import React, { useState, useEffect } from 'react';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminTableSkeleton } from '@/components/admin/AdminSkeleton';
import { Save, AlertCircle, CheckCircle2, Shield, PauseCircle, PlayCircle, CreditCard } from 'lucide-react';
import { useAdminContext } from '@/components/admin/AdminContext';

export default function RestaurantSettingsPage() {
  const { onOpenMobileSidebar, userRole } = useAdminContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [settings, setSettings] = useState({
    brand: {
      name: 'Idli & More',
      tagline: 'Temple-Morning Breakfast · Bhopal',
      logoUrl: '',
      phone: '+91 98930 12345',
      whatsapp: '+91 98930 12345',
      email: 'hello@idliandmore.in',
      address: 'Kolar Road & 7 No. Stop, Bhopal, MP',
      mapUrl: 'https://maps.google.com/?q=Idli+and+More+Bhopal',
    },
    hero: {
      headline: 'Soft idlis. Hot sambar. Made like home.',
      subline:
        'Steamed live every 20 minutes on aromatic banana leaves. Pure cultured cow ghee, stone-ground podi, and the serene calm of a traditional temple morning in Bhopal.',
      heroImageUrl:
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
      storyText:
        'Born out of devotion to early-morning South Indian breakfast traditions, Idli & More brings pure Karnataka & Tamil Nadu culinary craft to the heart of Bhopal.',
      signaturePickIds: [],
    },
    banner: {
      isEnabled: true,
      text: 'Now Steaming Live in Kolar Road & 7 No. Bhopal | Morning Breakfast starts 7:30 AM',
      linkUrl: '',
    },
    ordering: {
      isOrderingPaused: false,
      pauseMessage: 'Kitchen is at peak rush. QR ordering is temporarily paused for 10 mins.',
      minimumOrderAmount: 0,
      gstPercentage: 5,
      serviceChargePercentage: 0,
      allowOrderNotes: true,
      paymentMode: 'counter_only' as 'counter_only' | 'razorpay_enabled',
    },
    socialLinks: {
      instagram: 'https://www.instagram.com/idliandmore/?hl=en',
      googleReviews: 'https://share.google/iQAI6vNkOVJLFNBwY',
      swiggy: '',
      zomato: '',
    },
    seo: {
      metaTitle: 'Idli & More | South Indian Temple-Morning Experience Bhopal',
      metaDescription:
        'Experience fresh steamed idlis, ghee podi thatte idli, medu vada, and filter coffee in Bhopal. Visit our Kolar Road & 7 No. outlets.',
      ogImageUrl:
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
    },
    themePreset: 'classic_temple' as 'classic_temple' | 'emerald_leaf' | 'royal_sandalwood',
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings((prev) => ({
            ...prev,
            ...data.settings,
            brand: { ...prev.brand, ...data.settings.brand },
            hero: { ...prev.hero, ...data.settings.hero },
            banner: { ...prev.banner, ...data.settings.banner },
            ordering: { ...prev.ordering, ...data.settings.ordering },
            socialLinks: { ...prev.socialLinks, ...data.settings.socialLinks },
            seo: { ...prev.seo, ...data.settings.seo },
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        showToast('✓ Settings updated and public site revalidated immediately without redeploy!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save settings.');
      }
    } catch (err) {
      alert('Network error while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <AdminTopBar title="Restaurant Settings" onOpenMobileMenu={onOpenMobileSidebar} />
        <main className="p-8 max-w-4xl">
          <AdminTableSkeleton rows={8} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Restaurant Settings"
        subtitle="Saved to DB with instant on-demand revalidation — no redeploy required"
        onOpenMobileMenu={onOpenMobileSidebar}
        actions={
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E0A526] hover:bg-[#c9921e] text-[#2B1D14] font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Revalidating...' : 'Save & Publish Live'}</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
        
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-[#2F5D3A] text-white font-semibold text-xs shadow-lg flex items-center justify-between animate-in fade-in duration-200">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="p-1 font-bold">✕</button>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
          
          {/* Emergency Kitchen Pause Switch */}
          <div
            className={`p-5 rounded-2xl border transition-colors ${
              settings.ordering.isOrderingPaused
                ? 'bg-[#B3261E]/10 border-[#B3261E]'
                : 'bg-[#FFFDF7] border-[#E8DCC4]'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {settings.ordering.isOrderingPaused ? (
                    <PauseCircle className="w-5 h-5 text-[#B3261E]" />
                  ) : (
                    <PlayCircle className="w-5 h-5 text-[#2F5D3A]" />
                  )}
                  <h3 className="font-serif font-bold text-base text-[#2B1D14]">
                    Master Ordering Pause Switch
                  </h3>
                </div>
                <p className="text-xs text-[#6B5444]">
                  Pause table QR ordering during heavy kitchen rush with a single toggle.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    ordering: {
                      ...settings.ordering,
                      isOrderingPaused: !settings.ordering.isOrderingPaused,
                    },
                  })
                }
                className={`px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                  settings.ordering.isOrderingPaused
                    ? 'bg-[#B3261E] text-white'
                    : 'bg-[#2F5D3A] text-white'
                }`}
              >
                {settings.ordering.isOrderingPaused ? 'PAUSED (Tap to Resume)' : 'Active (Tap to Pause)'}
              </button>
            </div>

            {settings.ordering.isOrderingPaused && (
              <div className="pt-3 mt-3 border-t border-[#B3261E]/20">
                <label className="block font-semibold text-[#B3261E] mb-1">
                  Customer Pause Notice
                </label>
                <input
                  type="text"
                  value={settings.ordering.pauseMessage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ordering: { ...settings.ordering, pauseMessage: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#B3261E]/30 text-xs text-[#2B1D14]"
                />
              </div>
            )}
          </div>

          {/* Ordering & Payment Mode Settings */}
          <div className="bg-[#FFFDF7] p-6 rounded-2xl border border-[#E8DCC4] space-y-4 shadow-xs">
            <h3 className="font-serif font-bold text-base text-[#2B1D14] pb-2 border-b border-[#E8DCC4]">
              Ordering & Billing Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#2B1D14] mb-1">
                  GST Percentage (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={settings.ordering.gstPercentage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ordering: { ...settings.ordering, gstPercentage: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B1D14] mb-1">
                  Minimum Order (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={settings.ordering.minimumOrderAmount}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ordering: { ...settings.ordering, minimumOrderAmount: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B1D14] mb-1">
                  Payment Mode Feature Flag
                </label>
                <select
                  value={settings.ordering.paymentMode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ordering: { ...settings.ordering, paymentMode: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4]"
                >
                  <option value="counter_only">Pay at Counter (Default)</option>
                  <option value="razorpay_enabled">Razorpay / UPI Integration</option>
                </select>
              </div>
            </div>
          </div>

          {/* Announcement Banner */}
          <div className="bg-[#FFFDF7] p-6 rounded-2xl border border-[#E8DCC4] space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DCC4]">
              <h3 className="font-serif font-bold text-base text-[#2B1D14]">
                Top Announcement Banner
              </h3>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#2B1D14]">
                <input
                  type="checkbox"
                  checked={settings.banner.isEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      banner: { ...settings.banner, isEnabled: e.target.checked },
                    })
                  }
                />
                <span>Banner Active</span>
              </label>
            </div>

            <div>
              <label className="block font-semibold text-[#2B1D14] mb-1">
                Banner Announcement Text
              </label>
              <input
                type="text"
                value={settings.banner.text}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    banner: { ...settings.banner, text: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4]"
              />
            </div>
          </div>

          {/* Brand Info */}
          <div className="bg-[#FFFDF7] p-6 rounded-2xl border border-[#E8DCC4] space-y-4 shadow-xs">
            <h3 className="font-serif font-bold text-base text-[#2B1D14] pb-2 border-b border-[#E8DCC4]">
              Brand & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#2B1D14] mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={settings.brand.name}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      brand: { ...settings.brand, name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B1D14] mb-1">Tagline</label>
                <input
                  type="text"
                  value={settings.brand.tagline}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      brand: { ...settings.brand, tagline: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B1D14] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={settings.brand.phone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      brand: { ...settings.brand, phone: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B1D14] mb-1">WhatsApp Order Line</label>
                <input
                  type="text"
                  value={settings.brand.whatsapp}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      brand: { ...settings.brand, whatsapp: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4]"
                />
              </div>
            </div>
          </div>

          {/* Safe Approved Theme Presets (Limited so brand cannot be broken) */}
          <div className="bg-[#FFFDF7] p-6 rounded-2xl border border-[#E8DCC4] space-y-4 shadow-xs">
            <h3 className="font-serif font-bold text-base text-[#2B1D14] pb-2 border-b border-[#E8DCC4]">
              Brand Design Token Presets (Approved Schemes Only)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'classic_temple', name: 'Classic Temple Morning', desc: 'Banana Leaf Green + Turmeric Gold' },
                { id: 'emerald_leaf', name: 'Deep Emerald Leaf', desc: 'Forest Green + Sandalwood' },
                { id: 'royal_sandalwood', name: 'Royal Sandalwood', desc: 'Warm Coconut + Coffee Brown' },
              ].map((p) => {
                const isSelected = settings.themePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, themePreset: p.id as any })}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2F5D3A] ring-2 ring-[#2F5D3A]/20 bg-[#FAF6EC]'
                        : 'border-[#E8DCC4] bg-[#FFFDF7]'
                    }`}
                  >
                    <p className="font-serif font-bold text-sm text-[#2B1D14]">{p.name}</p>
                    <p className="text-[11px] text-[#6B5444] mt-1">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="bg-[#FFFDF7] p-6 rounded-2xl border border-[#E8DCC4] space-y-4 shadow-xs">
            <h3 className="font-serif font-bold text-base text-[#2B1D14] pb-2 border-b border-[#E8DCC4]">
              Search Engine Optimization (SEO)
            </h3>

            <div>
              <label className="block font-semibold text-[#2B1D14] mb-1">Meta Title</label>
              <input
                type="text"
                value={settings.seo.metaTitle}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    seo: { ...settings.seo, metaTitle: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2B1D14] mb-1">Meta Description</label>
              <textarea
                rows={2}
                value={settings.seo.metaDescription}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    seo: { ...settings.seo, metaDescription: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4]"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-[#E0A526] hover:bg-[#c9921e] text-[#2B1D14] font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Publishing Changes...' : 'Save & Publish Live to Storefront'}
            </button>
          </div>

        </form>

      </main>
    </div>
  );
}
