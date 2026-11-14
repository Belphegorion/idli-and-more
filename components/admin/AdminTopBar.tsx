'use client';

import React from 'react';
import Link from 'next/link';
import { TempleBorder } from '../CulturalMotifs';
import { Menu as MenuIcon, ExternalLink, Bell } from 'lucide-react';

interface AdminTopBarProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu: () => void;
  actions?: React.ReactNode;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  title,
  subtitle,
  onOpenMobileMenu,
  actions,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FFFDF7] border-b border-[#E8DCC4] shadow-xs">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-lg bg-[#FAF6EC] text-[#2B1D14] hover:bg-[#E8DCC4]/50 lg:hidden cursor-pointer"
            aria-label="Open sidebar navigation"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          <div>
            <h1 className="font-serif font-bold text-lg sm:text-xl text-[#2B1D14] leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-[#6B5444] hidden sm:block">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {actions}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DCC4] text-xs font-semibold text-[#6B5444] hover:text-[#2B1D14] hover:bg-[#FAF6EC] transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* The single authentic cultural motif allowed in Admin Design: thin temple border under top bar */}
      <TempleBorder variant="green" />
    </header>
  );
};
