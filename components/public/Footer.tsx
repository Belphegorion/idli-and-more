import React from 'react';
import Link from 'next/link';
import { TempleBorder } from '../CulturalMotifs';
import { MapPin, Phone, Clock, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1F3F28] text-[#FAF6EC] pt-12 pb-8 border-t border-[#2F5D3A] relative">
      <TempleBorder variant="gold" className="absolute top-0 left-0 right-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand & Soul */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#E0A526] text-[#2B1D14] flex items-center justify-center font-serif font-bold text-lg">
                i&m
              </div>
              <span className="font-serif font-bold text-xl text-[#FAF6EC]">
                Idli & More
              </span>
            </div>
            <p className="text-xs text-[#FAF6EC]/80 leading-relaxed">
              Temple-morning South Indian comfort in Bhopal. Authentic naturally fermented batter, house-ground roasted podi, and fragrant desi ghee on fresh banana leaf.
            </p>
            <div className="pt-2">
              <span className="font-tamil text-sm text-[#E0A526] font-semibold">
                இனிமையான இட்லி மற்றும் பல
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#E0A526] tracking-wider uppercase">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF6EC]/80">
              <li>
                <a href="#hero" className="hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-white">
                  Breakfast & Idli Menu
                </a>
              </li>
              <li>
                <a href="#story" className="hover:text-white">
                  Our Heritage Story
                </a>
              </li>
              <li>
                <a href="#outlets" className="hover:text-white">
                  Find Bhopal Outlets
                </a>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-[#E0A526]">
                  Staff & Owner Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Outlets & Hours */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#E0A526] tracking-wider uppercase">
              Flagship & Timings
            </h4>
            <div className="space-y-2 text-xs text-[#FAF6EC]/80">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E0A526] shrink-0 mt-0.5" />
                <span>Kolar Road & 7 No. Stop, Arera Colony, Bhopal</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E0A526] shrink-0" />
                <span>Daily 7:30 AM – 10:30 PM</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#E0A526] shrink-0" />
                <span>+91 98930 12345</span>
              </p>
            </div>
          </div>

          {/* Col 4: Links & Social */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#E0A526] tracking-wider uppercase">
              Connect With Us
            </h4>
            <p className="text-xs text-[#FAF6EC]/80">
              Check out our Instagram reels and community posts:
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/idliandmore/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#FAF6EC]/10 hover:bg-[#FAF6EC]/20 text-xs font-semibold text-[#FAF6EC] transition-colors"
              >
                Instagram ↗
              </a>
              <a
                href="https://share.google/iQAI6vNkOVJLFNBwY"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#FAF6EC]/10 hover:bg-[#FAF6EC]/20 text-xs font-semibold text-[#FAF6EC] transition-colors"
              >
                Google Reviews ↗
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-[#FAF6EC]/15 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF6EC]/60 gap-3">
          <p>© {new Date().getFullYear()} Idli & More. 100% Pure Vegetarian South Indian Kitchen, Bhopal.</p>
          <p className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-[#B3261E] fill-current" />
            <span>for authentic South Indian food lovers</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
