'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CheckSquare,
  Clock,
  QrCode,
  UtensilsCrossed,
  FolderTree,
  Settings,
  Store,
  Tag,
  Users,
  History,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface AdminSidebarProps {
  userRole?: 'owner' | 'staff';
  userEmail?: string;
  userName?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  userRole = 'owner',
  userEmail = 'owner@idliandmore.in',
  userName = 'Admin',
  isOpen = false,
  onClose,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Nav links categorized by role
  const staffLinks = [
    { href: '/admin/availability', label: "Today's Availability", icon: CheckSquare },
    { href: '/admin/orders', label: 'Live Kitchen Orders', icon: Clock },
    { href: '/admin/tables', label: 'Tables & QR Manager', icon: QrCode },
  ];

  const ownerLinks = [
    { href: '/admin/menu', label: 'Food Management', icon: UtensilsCrossed },
    { href: '/admin/categories', label: 'Categories', icon: FolderTree },
    { href: '/admin/settings', label: 'Restaurant Settings', icon: Settings },
    { href: '/admin/outlets', label: 'Bhopal Outlets', icon: Store },
    { href: '/admin/offers', label: 'Offers & Combos', icon: Tag },
    { href: '/admin/users', label: 'Staff Accounts', icon: Users },
    { href: '/admin/audit', label: 'Audit Log & Undo', icon: History },
  ];

  const navItemClass = (href: string) => {
    const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
    return `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-[#FAF6EC] text-[#2F5D3A] shadow-xs font-bold'
        : 'text-[#FAF6EC]/85 hover:bg-[#1F3F28] hover:text-white'
    }`;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#2F5D3A] text-[#FAF6EC] z-50 flex flex-col justify-between p-4 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5 border-b border-[#FAF6EC]/15 mb-4">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#E0A526] text-[#2B1D14] flex items-center justify-center font-serif font-bold text-base shadow-xs">
                i&m
              </div>
              <div>
                <span className="font-serif font-bold text-lg text-white block leading-tight">
                  Idli & More
                </span>
                <span className="text-[10px] text-[#FAF6EC]/70 tracking-wider uppercase block">
                  Management Desk
                </span>
              </div>
            </Link>

            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden text-white/70 hover:text-white text-lg font-bold p-1"
                aria-label="Close sidebar"
              >
                ✕
              </button>
            )}
          </div>

          {/* User info badge */}
          <div className="bg-[#1F3F28] p-3 rounded-xl mb-4 border border-[#FAF6EC]/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate max-w-[130px]">
                {userName}
              </span>
              <span
                className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                  userRole === 'owner' ? 'bg-[#E0A526] text-[#2B1D14]' : 'bg-white/20 text-white'
                }`}
              >
                {userRole}
              </span>
            </div>
            <p className="text-[10px] text-[#FAF6EC]/60 truncate mt-0.5">{userEmail}</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 scrollbar-none">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#FAF6EC]/50 px-3 py-1 block">
              Floor & Kitchen
            </span>
            {staffLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={navItemClass(item.href)}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {userRole === 'owner' && (
              <>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#FAF6EC]/50 px-3 pt-3 pb-1 block">
                  Owner Controls
                </span>
                {ownerLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={navItemClass(item.href)}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#FAF6EC]/15 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#FAF6EC]/80 hover:bg-[#1F3F28] hover:text-white transition-colors"
          >
            <span>View Public Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#B3261E]/20 text-[#FAF6EC] hover:bg-[#B3261E] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
