'use client';

import React, { useState, useEffect } from 'react';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminTableSkeleton } from '@/components/admin/AdminSkeleton';
import { Plus, Edit2, Trash2, Tag, Calendar, Percent } from 'lucide-react';
import { useAdminContext } from '@/components/admin/AdminContext';

export default function OffersCombosPage() {
  const { onOpenMobileSidebar, userRole } = useAdminContext();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(15);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchOffers = async () => {
    try {
      const res = await fetch('/api/admin/offers');
      if (res.ok) {
        const data = await res.json();
        setOffers(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setTitle('');
    setDescription('');
    setCode('TEMPLE15');
    setDiscountPercentage(15);
    setStartsAt('');
    setEndsAt('');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (offer: any) => {
    setEditingOffer(offer);
    setTitle(offer.title);
    setDescription(offer.description);
    setCode(offer.code || '');
    setDiscountPercentage(offer.discountPercentage || 0);
    setStartsAt(offer.startsAt ? new Date(offer.startsAt).toISOString().split('T')[0] : '');
    setEndsAt(offer.endsAt ? new Date(offer.endsAt).toISOString().split('T')[0] : '');
    setIsActive(offer.isActive !== false);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      code,
      discountPercentage: Number(discountPercentage),
      startsAt: startsAt || null,
      endsAt: endsAt || null,
      isActive,
    };

    try {
      if (editingOffer) {
        const res = await fetch('/api/admin/offers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingOffer._id, ...payload }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchOffers();
        }
      } else {
        const res = await fetch('/api/admin/offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchOffers();
        }
      }
    } catch (err) {
      console.error('Save offer error:', err);
    }
  };

  const handleDelete = async (id: string, offerTitle: string) => {
    if (!confirm(`Delete offer "${offerTitle}"?`)) return;
    try {
      const res = await fetch(`/api/admin/offers?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchOffers();
    } catch (err) {
      console.error('Delete offer error:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Promotions, Combos & Offers"
        subtitle="Schedule discount campaigns and breakfast combos"
        onOpenMobileMenu={onOpenMobileSidebar}
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E0A526] hover:bg-[#c9921e] text-[#2B1D14] font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Offer / Combo</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
        
        {loading ? (
          <AdminTableSkeleton rows={3} />
        ) : offers.length === 0 ? (
          <div className="bg-[#FFFDF7] p-12 rounded-3xl border border-[#E8DCC4] text-center space-y-2">
            <Tag className="w-12 h-12 text-[#2F5D3A] mx-auto opacity-40" />
            <p className="font-serif font-bold text-lg text-[#2B1D14]">No active offers</p>
            <p className="text-xs text-[#6B5444]">
              Create seasonal combos (e.g. Thatte Idli + Filter Coffee Combo ₹299).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map((offer) => (
              <div
                key={offer._id}
                className="bg-[#FFFDF7] p-5 rounded-2xl border border-[#E8DCC4] flex flex-col justify-between shadow-xs space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#E0A526] block">
                        {offer.code ? `Code: ${offer.code}` : 'Seasonal Combo'}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-[#2B1D14]">
                        {offer.title}
                      </h3>
                    </div>
                    {offer.discountPercentage && (
                      <span className="px-2 py-0.5 rounded-full bg-[#2F5D3A]/10 text-[#2F5D3A] font-bold text-xs">
                        {offer.discountPercentage}% OFF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B5444] mt-2 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8DCC4] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#6B5444]">
                    {offer.startsAt ? `From ${new Date(offer.startsAt).toLocaleDateString()}` : 'Always Active'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(offer)}
                      className="p-1.5 rounded-lg text-[#6B5444] hover:text-[#2B1D14] hover:bg-[#FAF6EC]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(offer._id, offer.title)}
                      className="p-1.5 rounded-lg text-[#B3261E] hover:bg-[#B3261E]/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#FFFDF7] p-6 sm:p-8 rounded-3xl border border-[#E8DCC4] shadow-2xl max-w-md w-full space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DCC4]">
                <h3 className="font-serif font-bold text-lg text-[#2B1D14]">
                  {editingOffer ? 'Edit Promotion' : 'Create Promotion'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-sm font-bold">✕</button>
              </div>

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#2B1D14] mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weekend Temple Breakfast Combo"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1D14] mb-1">Promo Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. BHOPAL10"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1D14] mb-1">Discount %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1D14] mb-1">Description</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Details of the combo or coupon terms"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14]"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-[#E8DCC4]">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E8DCC4] font-semibold text-[#6B5444]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#E0A526] text-[#2B1D14] font-bold shadow-xs hover:bg-[#c9921e]"
                  >
                    Save Offer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
