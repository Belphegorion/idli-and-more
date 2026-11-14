'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import {
  CheckSquare,
  Clock,
  UtensilsCrossed,
  QrCode,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

import { useAdminContext } from '@/components/admin/AdminContext';

export default function AdminDashboard() {
  const { onOpenMobileSidebar, userRole, userName } = useAdminContext();
  const [stats, setStats] = useState({
    activeOrders: 0,
    totalDishes: 0,
    soldOutCount: 0,
    tablesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [ordersRes, menuRes, tablesRes] = await Promise.all([
          fetch('/api/admin/orders?status=active'),
          fetch('/api/admin/menu'),
          fetch('/api/admin/tables'),
        ]);

        let activeOrders = 0;
        let totalDishes = 0;
        let soldOutCount = 0;
        let tablesCount = 0;

        if (ordersRes.ok) {
          const ordJson = await ordersRes.json();
          activeOrders = ordJson.orders?.length || 0;
        }

        if (menuRes.ok) {
          const menuJson = await menuRes.json();
          const items = menuJson.items || [];
          totalDishes = items.length;
          soldOutCount = items.filter((i: any) => !i.inStock).length;
        }

        if (tablesRes.ok) {
          const tabJson = await tablesRes.json();
          tablesCount = tabJson.tables?.length || 0;
        }

        setStats({ activeOrders, totalDishes, soldOutCount, tablesCount });
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Command Dashboard"
        subtitle={`Welcome back, ${userName} (${userRole})`}
        onOpenMobileMenu={onOpenMobileSidebar}
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Link
            href="/admin/orders"
            className="bg-[#FFFDF7] p-5 rounded-2xl border border-[#E8DCC4] shadow-xs hover:border-[#2F5D3A] transition-all card-subtle-hover flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-[#6B5444] block">Live Orders</span>
              <p className="font-serif font-bold text-3xl text-[#2B1D14] mt-1">
                {stats.activeOrders}
              </p>
              <span className="text-[11px] text-[#2F5D3A] font-medium">In kitchen right now</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#2F5D3A]/10 text-[#2F5D3A] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </Link>

          <Link
            href="/admin/availability"
            className="bg-[#FFFDF7] p-5 rounded-2xl border border-[#E8DCC4] shadow-xs hover:border-[#E0A526] transition-all card-subtle-hover flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-[#6B5444] block">Sold Out Dishes</span>
              <p className={`font-serif font-bold text-3xl mt-1 ${stats.soldOutCount > 0 ? 'text-[#B3261E]' : 'text-[#2B1D14]'}`}>
                {stats.soldOutCount}
              </p>
              <span className="text-[11px] text-[#6B5444] font-medium">
                {stats.soldOutCount > 0 ? 'Marked 86 / Sold Out' : 'All items in stock'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#E0A526]/10 text-[#E0A526] flex items-center justify-center">
              <CheckSquare className="w-6 h-6" />
            </div>
          </Link>

          <Link
            href="/admin/tables"
            className="bg-[#FFFDF7] p-5 rounded-2xl border border-[#E8DCC4] shadow-xs hover:border-[#2F5D3A] transition-all card-subtle-hover flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-[#6B5444] block">Active Tables</span>
              <p className="font-serif font-bold text-3xl text-[#2B1D14] mt-1">
                {stats.tablesCount}
              </p>
              <span className="text-[11px] text-[#2F5D3A] font-medium">With QR codes enabled</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#2F5D3A]/10 text-[#2F5D3A] flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
          </Link>

          <Link
            href="/admin/menu"
            className="bg-[#FFFDF7] p-5 rounded-2xl border border-[#E8DCC4] shadow-xs hover:border-[#2F5D3A] transition-all card-subtle-hover flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-[#6B5444] block">Menu Catalog</span>
              <p className="font-serif font-bold text-3xl text-[#2B1D14] mt-1">
                {stats.totalDishes}
              </p>
              <span className="text-[11px] text-[#6B5444] font-medium">Active items across outlets</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#2F5D3A]/10 text-[#2F5D3A] flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
          </Link>

        </div>

        {/* Quick Action Floor Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          <div className="bg-[#FFFDF7] p-6 rounded-3xl border border-[#E8DCC4] shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#2F5D3A]/10 text-[#2F5D3A] flex items-center justify-center">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#2B1D14]">
                Today’s Item Availability
              </h3>
              <p className="text-xs text-[#6B5444] leading-relaxed">
                Run out of thatte idli batter or ghee podi? Toggle items sold out instantly with large mobile touch targets. Sold out items are greyed out on the public menu and locked against new orders.
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/admin/availability"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F5D3A] text-white font-bold text-xs hover:bg-[#1F3F28] transition-colors"
              >
                <span>Open Availability Screen</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-[#FFFDF7] p-6 rounded-3xl border border-[#E8DCC4] shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#E0A526]/10 text-[#2B1D14] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#2B1D14]">
                Live Kitchen Orders & Table Bills
              </h3>
              <p className="text-xs text-[#6B5444] leading-relaxed">
                Incoming orders from table QRs appear within 5 seconds with an audible chime alert. Move orders forward, view running table bills, or mark tables clear & paid.
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E0A526] text-[#2B1D14] font-bold text-xs hover:bg-[#c9921e] transition-colors"
              >
                <span>Open Live Kitchen Orders</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
