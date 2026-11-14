'use client';

import React from 'react';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { PublicOutlet } from '@/lib/types';

interface OutletsSectionProps {
  outlets?: PublicOutlet[];
}

export const OutletsSection: React.FC<OutletsSectionProps> = ({ outlets }) => {
  const fallbackOutlets: PublicOutlet[] = [
    {
      id: 'kolar',
      name: 'Kolar Road Flagship',
      address: 'Shop 4-5, Near Sarvdharm Bridge, Main Kolar Road, Bhopal, MP 462042',
      phone: '+91 98930 12345',
      mapUrl: 'https://maps.google.com/?q=Idli+and+More+Kolar+Road+Bhopal',
      slug: 'kolar-road',
    },
    {
      id: 'seven-no',
      name: '7 No. Stop Heritage Outlet',
      address: 'Near Old Subhash School, 7 No. Bus Stop, Bhopal, MP 462016',
      phone: '+91 98930 12346',
      mapUrl: 'https://maps.google.com/?q=Idli+and+More+7+No+Bhopal',
      slug: '7-no-stop',
    },
    {
      id: 'mp-nagar',
      name: 'MP Nagar Express',
      address: 'Plot 12, Commercial Zone, MP Nagar Zone-II, Bhopal, MP 462011',
      phone: '+91 98930 12347',
      mapUrl: 'https://maps.google.com/?q=MP+Nagar+Bhopal',
      slug: 'mp-nagar',
    },
  ];

  const list = outlets && outlets.length > 0 ? outlets : fallbackOutlets;

  return (
    <section id="outlets" className="py-14 bg-[#FAF6EC] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#2F5D3A] block mb-2">
            Visit Us in Bhopal
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2B1D14]">
            Locations Serving Hot Steamed Comfort
          </h2>
          <p className="text-sm text-[#6B5444] mt-2">
            Step into our temple-calm dining spaces or order fresh takeaway at your nearest outlet.
          </p>
        </div>

        {/* Outlets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {list.map((outlet, index) => {
            const isClosedToday = outlet.holidayOverride?.isClosed;
            const isFlagship = index === 0;

            return (
              <div
                key={outlet._id || outlet.id || outlet.slug}
                className={`bg-[#FFFDF7] rounded-2xl p-6 border card-subtle-hover flex flex-col justify-between ${
                  isFlagship
                    ? 'border-[#2F5D3A] ring-2 ring-[#2F5D3A]/20 shadow-md'
                    : 'border-[#E8DCC4] hover:border-[#2F5D3A]/40 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        !isClosedToday
                          ? 'bg-[#2F5D3A]/10 text-[#2F5D3A]'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          !isClosedToday ? 'bg-[#2F5D3A] animate-ping' : 'bg-stone-500'
                        }`}
                      ></span>
                      {!isClosedToday ? 'Open Today' : 'Closed Today (Holiday)'}
                    </span>
                    {isFlagship && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#E0A526] bg-[#FAF6EC] px-2 py-0.5 rounded-sm border border-[#E8DCC4]">
                        Flagship Kitchen
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-xl text-[#2B1D14] mb-2">
                    {outlet.name}
                  </h3>

                  <div className="space-y-2.5 text-xs text-[#6B5444] mb-6">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#2F5D3A] shrink-0 mt-0.5" />
                      <span>{outlet.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#2F5D3A] shrink-0" />
                      <span>Daily 7:30 AM – 10:30 PM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#2F5D3A] shrink-0" />
                      <a href={`tel:${outlet.phone}`} className="hover:underline font-semibold text-[#2B1D14]">
                        {outlet.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[#E8DCC4]/60">
                  <a
                    href={outlet.mapUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#2F5D3A] text-[#2F5D3A] hover:bg-[#2F5D3A]/10 text-xs font-semibold transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Directions</span>
                  </a>
                  <a
                    href={`tel:${outlet.phone}`}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#2F5D3A] hover:bg-[#1F3F28] text-white text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
