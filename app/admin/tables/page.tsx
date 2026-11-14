'use client';

import React, { useState, useEffect } from 'react';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminTableSkeleton } from '@/components/admin/AdminSkeleton';
import { TempleBorder, KolamDivider } from '@/components/CulturalMotifs';
import {
  Plus,
  QrCode,
  Download,
  Printer,
  RefreshCw,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { useAdminContext } from '@/components/admin/AdminContext';

export default function TablesManagementPage() {
  const { onOpenMobileSidebar, userRole } = useAdminContext();
  const [tables, setTables] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutlet, setSelectedOutlet] = useState('all');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any | null>(null);
  const [label, setLabel] = useState('');
  const [seats, setSeats] = useState(4);
  const [outletId, setOutletId] = useState('');

  // Print Tent Cards Mode
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/admin/tables');
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables || []);
        setOutlets(data.outlets || []);
        if (data.outlets?.length > 0 && !outletId) {
          setOutletId(data.outlets[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Open Add Table Modal
  const handleOpenAddModal = () => {
    setEditingTable(null);
    setLabel(`Table ${tables.length + 1}`);
    setSeats(4);
    setOutletId(outlets[0]?._id || '');
    setModalOpen(true);
  };

  // Save Table
  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTable) {
        const res = await fetch('/api/admin/tables', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingTable._id,
            label,
            seats: Number(seats),
            outletId,
          }),
        });
        if (res.ok) {
          setModalOpen(false);
          showToast(`✓ Updated ${label}`);
          fetchTables();
        }
      } else {
        const res = await fetch('/api/admin/tables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            label,
            seats: Number(seats),
            outletId,
          }),
        });
        if (res.ok) {
          setModalOpen(false);
          showToast(`✓ Added ${label} with unguessable token.`);
          fetchTables();
        }
      }
    } catch (err) {
      console.error('Save table error:', err);
    }
  };

  // Toggle Table Enabled/Disabled
  const handleToggleEnabled = async (table: any) => {
    const nextState = !table.isEnabled;
    try {
      const res = await fetch('/api/admin/tables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: table._id,
          isEnabled: nextState,
        }),
      });
      if (res.ok) {
        showToast(nextState ? `✓ ${table.label} Enabled for ordering` : `✗ ${table.label} Disabled`);
        fetchTables();
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  // Regenerate Token
  const handleRegenerateToken = async (table: any) => {
    if (!confirm(`Regenerate QR token for ${table.label}? This will IMMEDIATELY invalidate the previous printed QR code.`)) return;

    try {
      const res = await fetch(`/api/admin/tables/${table._id}/regenerate`, { method: 'POST' });
      if (res.ok) {
        showToast(`✓ Rotated QR token for ${table.label}. Old QR is now dead.`);
        fetchTables();
      }
    } catch (err) {
      console.error('Regenerate token error:', err);
    }
  };

  // Delete Table
  const handleDeleteTable = async (id: string, tableLabel: string) => {
    if (!confirm(`Delete ${tableLabel}?`)) return;
    try {
      const res = await fetch(`/api/admin/tables?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Removed ${tableLabel}`);
        fetchTables();
      }
    } catch (err) {
      console.error('Delete table error:', err);
    }
  };

  const filteredTables = tables.filter((t) => {
    return selectedOutlet === 'all' || (t.outletId?._id || t.outletId) === selectedOutlet;
  });

  // If in Print Mode, render the clean A4 print view
  if (isPrintMode) {
    return (
      <div className="bg-white min-h-screen p-8 text-black">
        <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-gray-300">
          <div>
            <h2 className="text-xl font-bold">Print Table-Tent QR Cards (A4 Sheet Ready)</h2>
            <p className="text-sm text-gray-600">
              Each card features the Idli & More emblem, pure Kolam divider, table label, and scanned ordering QR.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-[#2F5D3A] text-white font-bold rounded-xl text-sm shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print All (Ctrl+P)</span>
            </button>
            <button
              onClick={() => setIsPrintMode(false)}
              className="px-4 py-2.5 border border-gray-400 font-bold rounded-xl text-sm cursor-pointer"
            >
              ← Back to Tables Manager
            </button>
          </div>
        </div>

        {/* 2x2 Grid of Tent Cards per A4 Page */}
        <div className="grid grid-cols-2 gap-8">
          {filteredTables.map((table) => {
            const outletSlug = table.outletId?.slug || 'kolar-road';
            const domain = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
            const targetUrl = `${domain}/t/${outletSlug}/${table.token}`;

            return (
              <div
                key={table._id}
                className="border-2 border-dashed border-[#2F5D3A] p-6 rounded-3xl flex flex-col items-center justify-between text-center bg-[#FFFDF7] shadow-xs"
                style={{ height: '420px' }}
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#2F5D3A] text-white flex items-center justify-center font-serif font-bold text-lg mx-auto mb-1">
                    i&m
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-[#2B1D14]">
                    Idli & More
                  </h3>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#E0A526]">
                    Temple-Morning Breakfast · Bhopal
                  </p>
                  <KolamDivider className="my-2 opacity-60" />
                </div>

                <div className="space-y-2">
                  {/* Generated QR Image */}
                  <img
                    src={`/api/admin/tables/${table._id}/qr?format=png`}
                    alt={`Scan to order at ${table.label}`}
                    className="w-44 h-44 mx-auto rounded-xl border border-[#E8DCC4]"
                  />
                  <div className="font-serif font-bold text-2xl text-[#2F5D3A]">
                    {table.label}
                  </div>
                  <p className="text-xs text-[#6B5444] font-medium">
                    Scan with Phone Camera to Order & Track Live
                  </p>
                </div>

                <div className="text-[10px] text-[#6B5444]/80">
                  {table.outletId?.name || 'Bhopal'} · Seats {table.seats}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Table QR & Dining Floor Manager"
        subtitle="Manage seats, rotate unguessable tokens, and print tent cards"
        onOpenMobileMenu={onOpenMobileSidebar}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPrintMode(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DCC4] text-xs font-semibold text-[#6B5444] hover:text-[#2B1D14] hover:bg-[#FAF6EC] transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print All Table Tents</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E0A526] hover:bg-[#c9921e] text-[#2B1D14] font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Table</span>
            </button>
          </div>
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

        {/* Filter bar */}
        <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#E8DCC4] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6B5444]">Filter Outlet:</span>
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-xs font-semibold text-[#2B1D14]"
            >
              <option value="all">All Bhopal Outlets</option>
              {outlets.map((o) => (
                <option key={o._id} value={o._id}>{o.name}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-[#6B5444]">
            Total Configured Tables: <span className="font-bold text-[#2B1D14]">{filteredTables.length}</span>
          </div>
        </div>

        {/* Tables Grid */}
        {loading ? (
          <AdminTableSkeleton rows={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTables.map((table) => {
              const outletSlug = table.outletId?.slug || 'kolar-road';

              return (
                <div
                  key={table._id}
                  className={`bg-[#FFFDF7] p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-xs ${
                    table.isEnabled
                      ? 'border-[#E8DCC4] hover:border-[#2F5D3A]/40'
                      : 'border-neutral-300 opacity-60 bg-neutral-100/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-xl text-[#2B1D14]">
                          {table.label}
                        </h3>
                        <p className="text-xs text-[#6B5444]">
                          {table.outletId?.name || 'Flagship'} · Seats {table.seats}
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleEnabled(table)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                          table.isEnabled
                            ? 'bg-[#2F5D3A]/10 text-[#2F5D3A]'
                            : 'bg-[#B3261E]/10 text-[#B3261E]'
                        }`}
                      >
                        {table.isEnabled ? 'Ordering Active' : 'Table Disabled'}
                      </button>
                    </div>

                    {/* QR Code Preview */}
                    <div className="bg-[#FAF6EC] p-3 rounded-xl border border-[#E8DCC4] flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg bg-white p-1 border border-[#E8DCC4] shrink-0">
                        <img
                          src={`/api/admin/tables/${table._id}/qr?format=png`}
                          alt={`QR for ${table.label}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-[11px] space-y-1 min-w-0">
                        <p className="font-semibold text-[#2B1D14] truncate">
                          Token: <span className="font-mono text-[10px] opacity-75">{table.token.slice(0, 12)}...</span>
                        </p>
                        <a
                          href={`/t/${outletSlug}/${table.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#2F5D3A] font-bold hover:underline"
                        >
                          <span>Open Customer View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-4 mt-3 border-t border-[#E8DCC4] flex items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      <a
                        href={`/api/admin/tables/${table._id}/qr?format=svg`}
                        download
                        className="p-2 rounded-lg bg-[#FAF6EC] text-[#6B5444] hover:text-[#2B1D14] hover:bg-[#E8DCC4]/50"
                        title="Download SVG QR"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleRegenerateToken(table)}
                        className="p-2 rounded-lg bg-[#FAF6EC] text-[#6B5444] hover:text-[#E0A526] hover:bg-[#E8DCC4]/50 cursor-pointer"
                        title="Rotate / Regenerate QR Token"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingTable(table);
                          setLabel(table.label);
                          setSeats(table.seats);
                          setOutletId(table.outletId?._id || table.outletId);
                          setModalOpen(true);
                        }}
                        className="p-2 rounded-lg text-[#6B5444] hover:text-[#2B1D14] hover:bg-[#FAF6EC] cursor-pointer"
                        title="Edit label & seats"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteTable(table._id, table.label)}
                        className="p-2 rounded-lg text-[#B3261E] hover:bg-[#B3261E]/10 cursor-pointer"
                        title="Delete table"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Add / Edit Table Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#FFFDF7] p-6 rounded-3xl border border-[#E8DCC4] shadow-2xl max-w-sm w-full space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DCC4]">
                <h3 className="font-serif font-bold text-lg text-[#2B1D14]">
                  {editingTable ? 'Edit Table' : 'Add Dining Table'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-sm font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveTable} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#2B1D14] mb-1">
                    Table Label
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Table 7"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1D14] mb-1">
                    Number of Seats
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={seats}
                    onChange={(e) => setSeats(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1D14] mb-1">
                    Outlet Assignment
                  </label>
                  <select
                    value={outletId}
                    onChange={(e) => setOutletId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14]"
                  >
                    {outlets.map((o) => (
                      <option key={o._id} value={o._id}>{o.name}</option>
                    ))}
                  </select>
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
                    Save Table
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
