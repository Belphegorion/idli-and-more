'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminTableSkeleton } from '@/components/admin/AdminSkeleton';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Volume2,
  VolumeX,
  CreditCard,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useAdminContext } from '@/components/admin/AdminContext';

export default function LiveOrdersPage() {
  const { onOpenMobileSidebar, userRole } = useAdminContext();
  const [orders, setOrders] = useState<any[]>([]);
  const [tableBills, setTableBills] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'all' | 'received' | 'preparing' | 'ready'>('active');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const previousOrderCountRef = useRef<number>(0);

  // Web Audio Synth Chime for New Kitchen Orders
  const playKitchenChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (err) {
      console.warn('Web Audio playback blocked until user interaction:', err);
    }
  };

  const fetchOrders = async (isInitial = false) => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        const incomingOrders = data.orders || [];

        // Check if there are new orders since last poll
        if (!isInitial && incomingOrders.length > previousOrderCountRef.current) {
          playKitchenChime();
        }
        previousOrderCountRef.current = incomingOrders.length;

        setOrders(incomingOrders);
        setTableBills(data.tableBills || {});
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);

    // 5-second polling interval for live orders
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Update order status forward
  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        fetchOrders(false);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Cancel order with reason
  const handleConfirmCancel = async () => {
    if (!cancellingOrderId) return;
    try {
      await fetch(`/api/admin/orders/${cancellingOrderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          reason: cancelReason || 'Cancelled by kitchen staff',
        }),
      });

      setCancellingOrderId(null);
      setCancelReason('');
      fetchOrders(false);
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  };

  // Clear Table / Mark Paid
  const handleClearTable = async (tableId: string) => {
    if (!confirm('Mark all active orders on this table as SERVED and bill PAID?')) return;
    try {
      const res = await fetch(`/api/admin/tables/${tableId}/clear`, { method: 'POST' });
      if (res.ok) {
        fetchOrders(false);
      }
    } catch (err) {
      console.error('Error clearing table:', err);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'active') {
      return ['received', 'preparing', 'ready'].includes(order.status);
    }
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Live Kitchen Orders"
        subtitle="Auto-refreshing every 5s with audio chime alert"
        onOpenMobileMenu={onOpenMobileSidebar}
        actions={
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-[#2F5D3A]/10 text-[#2F5D3A] border-[#2F5D3A]/30'
                : 'bg-neutral-100 text-neutral-500 border-neutral-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Chime Alert ON' : 'Chime Alert Muted'}</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
        
        {/* Table-Wise Running Bills Bar */}
        {Object.keys(tableBills).length > 0 && (
          <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#E8DCC4] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2B1D14] uppercase tracking-wider">
                Table Running Bills (Active Dining)
              </span>
              <span className="text-[11px] text-[#6B5444]">
                {Object.keys(tableBills).length} occupied tables
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(tableBills).map(([tableId, info]: [string, any]) => (
                <div
                  key={tableId}
                  className="bg-[#FAF6EC] p-3 rounded-xl border border-[#E8DCC4] flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-serif font-bold text-sm text-[#2B1D14]">{info.tableLabel}</p>
                    <p className="text-[11px] text-[#6B5444]">
                      {info.activeOrderCount} {info.activeOrderCount === 1 ? 'order' : 'orders'} · ₹{info.totalAmount}
                    </p>
                  </div>
                  <button
                    onClick={() => handleClearTable(tableId)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#2F5D3A] text-white font-bold text-[11px] hover:bg-[#1F3F28] transition-colors shrink-0"
                  >
                    Clear Bill
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'active', label: 'All Active' },
            { id: 'received', label: '1. Received' },
            { id: 'preparing', label: '2. Preparing' },
            { id: 'ready', label: '3. Ready' },
            { id: 'all', label: 'All History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#2F5D3A] text-white shadow-xs'
                  : 'bg-[#FFFDF7] text-[#6B5444] border border-[#E8DCC4]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live Orders Grid */}
        {loading ? (
          <AdminTableSkeleton rows={4} />
        ) : filteredOrders.length === 0 ? (
          <div className="bg-[#FFFDF7] p-16 rounded-3xl border border-[#E8DCC4] text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#2F5D3A] mx-auto opacity-70" />
            <p className="font-serif font-bold text-lg text-[#2B1D14]">All Orders Clear!</p>
            <p className="text-xs text-[#6B5444]">
              Kitchen is all caught up. New QR orders will appear here automatically within 5s.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map((order) => {
              const table = order.tableId;
              const isReceived = order.status === 'received';
              const isPreparing = order.status === 'preparing';
              const isReady = order.status === 'ready';

              return (
                <div
                  key={order._id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-xs ${
                    isReceived
                      ? 'bg-[#FFFDF7] border-[#E0A526] ring-2 ring-[#E0A526]/20'
                      : isPreparing
                      ? 'bg-[#FFFDF7] border-[#2F5D3A]'
                      : isReady
                      ? 'bg-[#FFFDF7] border-[#2F5D3A]/40'
                      : 'bg-neutral-50 border-neutral-300 opacity-70'
                  }`}
                >
                  <div className="space-y-3">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between pb-3 border-b border-[#E8DCC4]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-lg text-[#2B1D14]">
                            {table?.label || 'Dine-In Table'}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                              isReceived
                                ? 'bg-[#E0A526] text-[#2B1D14]'
                                : isPreparing
                                ? 'bg-[#2F5D3A] text-white'
                                : isReady
                                ? 'bg-[#2F5D3A]/10 text-[#2F5D3A]'
                                : 'bg-neutral-200 text-neutral-600'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B5444] mt-0.5">
                          Order #{order.orderNo} · {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-serif font-bold text-base text-[#2B1D14]">
                          ₹{order.total}
                        </span>
                        <span className="block text-[10px] text-[#6B5444] capitalize">
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Pay at Counter'}
                        </span>
                      </div>
                    </div>

                    {/* Item lines */}
                    <div className="space-y-1.5 py-1">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-[#2B1D14] font-semibold">
                            <span className="font-bold text-[#2F5D3A] mr-1.5">{item.qty}x</span>
                            {item.nameSnapshot}
                          </span>
                          <span className="text-[#6B5444]">₹{item.priceSnapshot * item.qty}</span>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 mt-3 border-t border-[#E8DCC4] flex items-center justify-between gap-2">
                    <button
                      onClick={() => setCancellingOrderId(order._id)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-[#B3261E] hover:bg-[#B3261E]/10 transition-colors"
                    >
                      Cancel Order
                    </button>

                    <div className="flex items-center gap-2">
                      {isReceived && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'preparing')}
                          className="px-4 py-2.5 rounded-xl bg-[#E0A526] hover:bg-[#c9921e] text-[#2B1D14] font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                        >
                          <span>Start Preparing</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isPreparing && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'ready')}
                          className="px-4 py-2.5 rounded-xl bg-[#2F5D3A] hover:bg-[#1F3F28] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                        >
                          <span>Mark Ready</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isReady && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'served')}
                          className="px-4 py-2.5 rounded-xl bg-[#2F5D3A] hover:bg-[#1F3F28] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                        >
                          <span>Mark Served</span>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Cancellation Reason Modal */}
        {cancellingOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#FFFDF7] p-6 rounded-3xl border border-[#E8DCC4] shadow-2xl max-w-sm w-full space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#2B1D14]">Cancel Order</h3>
              <p className="text-xs text-[#6B5444]">
                Please enter a brief cancellation reason for the customer and audit log:
              </p>
              <input
                type="text"
                placeholder="e.g. Out of batter, Customer requested change"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-xs text-[#2B1D14]"
              />
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setCancellingOrderId(null)}
                  className="px-3.5 py-2 rounded-xl border border-[#E8DCC4] text-xs font-semibold text-[#6B5444]"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="px-3.5 py-2 rounded-xl bg-[#B3261E] text-white text-xs font-bold shadow-xs hover:bg-red-800"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
