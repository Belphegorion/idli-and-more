'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TempleBorder } from '../CulturalMotifs';
import { ShoppingBag, Menu as MenuIcon, X } from 'lucide-react';

interface NavbarProps {
  cartCount?: number;
  onOpenCart: () => void;
  onOpenReserve?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount = 0,
  onOpenCart,
  onOpenReserve,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/#hero', label: 'Home' },
    { href: '/#menu', label: 'Menu' },
    { href: '/#story', label: 'Our Story' },
    { href: '/#outlets', label: 'Outlets' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFDF7]/95 backdrop-blur-md transition-all duration-300 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-2.5' : 'py-4'}`}>
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-full bg-[#2F5D3A] flex items-center justify-center text-[#FAF6EC] font-serif text-xl font-bold shadow-xs transition-transform duration-200 group-hover:scale-105">
              i&m
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif font-bold text-xl sm:text-2xl tracking-tight text-[#2B1D14]">
                  Idli & More
                </span>
                <span className="text-xs text-[#2F5D3A] font-semibold opacity-75">
                  இட்லி
                </span>
              </div>
              <p className="text-[10px] tracking-wider uppercase text-[#6B5444] font-medium hidden sm:block">
                Temple-Morning Breakfast · Bhopal
              </p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#6B5444] hover:text-[#2F5D3A] transition-colors"
              >
                {link.label}
              </a>
            ))}

            {onOpenReserve && (
              <button
                onClick={onOpenReserve}
                className="text-sm font-medium text-[#6B5444] hover:text-[#2F5D3A] transition-colors cursor-pointer"
              >
                Book Table
              </button>
            )}
          </nav>

          {/* Right Actions: Cart & Admin */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full bg-[#FAF6EC] text-[#2B1D14] hover:bg-[#E8DCC4]/50 transition-colors focus-visible:ring-2 focus-visible:ring-[#2F5D3A] cursor-pointer"
              aria-label={`Order tray with ${cartCount} items`}
            >
              <ShoppingBag className="w-5 h-5 text-[#2F5D3A]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E0A526] text-[#2B1D14] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E8DCC4] text-[#6B5444] hover:text-[#2B1D14] hover:bg-[#FAF6EC]"
            >
              Staff / Admin
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#2B1D14] cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E8DCC4] space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-[#2B1D14] py-1"
              >
                {link.label}
              </a>
            ))}
            {onOpenReserve && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenReserve();
                }}
                className="block text-sm font-medium text-[#2F5D3A] py-1 text-left w-full cursor-pointer"
              >
                Book Table
              </button>
            )}
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-[#6B5444] pt-2 border-t border-[#E8DCC4]"
            >
              Staff / Owner Login →
            </Link>
          </div>
        )}
      </div>

      <TempleBorder variant="green" />
    </header>
  );
};
