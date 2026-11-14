'use client';

import React, { useState, useEffect } from 'react';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminTableSkeleton } from '@/components/admin/AdminSkeleton';
import { Plus, Edit2, Trash2, MapPin, Phone, Clock, CalendarX, CheckCircle2 } from 'lucide-react';
import { useAdminContext } from '@/components/admin/AdminContext';

export default function OutletsPage() {
  const { onOpenMobileSidebar, userRole } = useAdminContext();
  const [outlets, setOutlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<any | null>(null);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [isHolidayClosed, setIsHolidayClosed] = useState(false);
  const [holidayReason, setHolidayReason] = useState('');

  const fetchOutlets = async () => {
    try {
      const res = await fetch('/api/admin/outlets');
      if (res.ok) {
        const data = await res.json();
        setOutlets(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load outlets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  const handleOpenAdd = () => {
    setEditingOutlet(null);
    setName('');
    setAddress('');
    setPhone('+91 98930 12345');
    setMapUrl('');
    setIsHolidayClosed(false);
    setHolidayReason('');
    setModalOpen(true);
  };

  const handleOpenEdit = (outlet: any) => {
    setEditingOutlet(outlet);
    setName(outlet.name);
    setAddress(outlet.address);
    setPhone(outlet.phone);
    setMapUrl(outlet.mapUrl || '');
    setIsHolidayClosed(outlet.holidayOverride?.isClosed === true);
    setHolidayReason(outlet.holidayOverride?.reason || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      address,
      phone,
      mapUrl,
      holidayOverride: {
        isClosed: isHolidayClosed,
        reason: holidayReason,
      },
    };

    try {
      if (editingOutlet) {
        const res = await fetch('/api/admin/outlets', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingOutlet._id, ...payload }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchOutlets();
        }
      } else {
        const res = await fetch('/api/admin/outlets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchOutlets();
        }
      }
    } catch (err) {
      console.error('Save outlet error:', err);
    }
  };

  const handleDelete = async (id: string, outletName: string) => {
    if (!confirm(`Delete ${outletName}?`)) return;
    try {
      const res = await fetch(`/api/admin/outlets?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchOutlets();
    } catch (err) {
      console.error('Delete outlet error:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Bhopal Outlets & Operating Hours"
        subtitle="Manage locations, map directions, and emergency holiday closures"
        onOpenMobileMenu={onOpenMobileSidebar}
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E0A526] hover:bg-[#c9921e] text-[#2B1D14] font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Outlet</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
        
        {loading ? (
          <AdminTableSkeleton rows={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {outlets.map((outlet) => {
              const isClosed = outlet.holidayOverride?.isClosed;

              return (
                <div
                  key={outlet._id}
                  className="bg-[#FFFDF7] p-5 rounded-2xl border border-[#E8DCC4] flex flex-col justify-between shadow-xs space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-[#2B1D14]">
                          {outlet.name}
                        </h3>
                        <p className="text-xs text-[#6B5444] font-mono">slug: {outlet.slug}</p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          !isClosed
                            ? 'bg-[#2F5D3A]/10 text-[#2F5D3A]'
                            : 'bg-[#B3261E]/10 text-[#B3261E]'
                        }`}
                      >
                        {!isClosed ? 'Open Daily' : 'Closed Today (Holiday)'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#6B5444]">
                      <p className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#2F5D3A] shrink-0 mt-0.5" />
                        <span>{outlet.address}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#2F5D3A] shrink-0" />
                        <span>{outlet.phone}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#2F5D3A] shrink-0" />
                        <span>7:30 AM – 10:30 PM (Mon-Sun)</span>
                      </p>
                    </div>

                    {isClosed && (
                      <div className="p-2.5 bg-[#B3261E]/10 border border-[#B3261E]/20 rounded-xl text-xs text-[#B3261E]">
                        Holiday Notice: {outlet.holidayOverride?.reason || 'Closed today for kitchen maintenance'}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#E8DCC4] flex items-center justify-between text-xs">
                    <a
                      href={outlet.mapUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2F5D3A] font-semibold hover:underline"
                    >
                      View on Google Maps ↗
                    </a>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(outlet)}
                        className="p-1.5 rounded-lg text-[#6B5444] hover:text-[#2B1D14] hover:bg-[#FAF6EC]"
                        title="Edit outlet"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(outlet._id, outlet.name)}
                        className="p-1.5 rounded-lg text-[#B3261E] hover:bg-[#B3261E]/10"
                        title="Delete outlet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#FFFDF7] p-6 sm:p-8 rounded-3xl border border-[#E8DCC4] shadow-2xl max-w-md w-full space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DCC4]">
                <h3 className="font-serif font-bold text-lg text-[#2B1D14]">
                  {editingOutlet ? 'Edit Outlet' : 'Add New Outlet'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-sm font-bold">✕</button>
              </div>

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#2B1D14] mb-1">Outlet Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kolar Road Flagship"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1D14] mb-1">Full Address</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Street, Landmark, Bhopal, MP"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#2B1D14] mb-1">Phone</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#2B1D14] mb-1">Google Maps URL</label>
                    <input
                      type="url"
                      placeholder="https://maps.google.com/..."
                      value={mapUrl}
                      onChange={(e) => setMapUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14]"
                    />
                  </div>
                </div>

                {/* Holiday Override */}
                <div className="pt-2 border-t border-[#E8DCC4] space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#B3261E]">
                    <input
                      type="checkbox"
                      checked={isHolidayClosed}
                      onChange={(e) => setIsHolidayClosed(e.target.checked)}
                    />
                    <span>Closed Today / Holiday Override</span>
                  </label>

                  {isHolidayClosed && (
                    <input
                      type="text"
                      placeholder="Reason (e.g. Closed for Diwali cleaning)"
                      value={holidayReason}
                      onChange={(e) => setHolidayReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#B3261E]/30 text-xs"
                    />
                  )}
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
                    Save Outlet
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
