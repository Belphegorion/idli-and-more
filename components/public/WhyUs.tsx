import React from 'react';
import { Sparkles, SunMedium, Flame, CheckCircle2 } from 'lucide-react';

export const WhyUs: React.FC = () => {
  const pillars = [
    {
      icon: Sparkles,
      title: 'Fresh Batter Daily',
      subtitle: 'Naturally Fermented · No Preservatives',
      description:
        'Ground every morning using premium rice and whole urad dal. Slow natural 12-hour fermentation gives that authentic, airy temple fluffiness.',
    },
    {
      icon: Flame,
      title: 'Desi Ghee & In-House Podi',
      subtitle: 'Slow-Roasted Traditional Spices',
      description:
        'Our gun-powder podi is hand-roasted and ground weekly. Drenched generously in pure cultured cow ghee for an irresistible nutty aroma.',
    },
    {
      icon: SunMedium,
      title: 'All-Day Breakfast Soul',
      subtitle: '7:30 AM to 10:30 PM Daily',
      description:
        'Hot drumstick sambar, freshly ground coconut chutney, and piping steam available anytime your craving strikes across Bhopal.',
    },
  ];

  return (
    <section className="py-14 bg-[#FAF6EC] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#2F5D3A] block mb-2">
            The Idli & More Promise
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2B1D14]">
            Why Bhopal Starts Its Mornings With Us
          </h2>
          <p className="text-sm text-[#6B5444] mt-2">
            Honest ingredients, patient traditional technique, zero compromises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className="bg-[#FFFDF7] p-6 sm:p-8 rounded-2xl border border-[#E8DCC4] shadow-xs hover:border-[#2F5D3A]/40 card-subtle-hover text-left flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#2F5D3A]/10 text-[#2F5D3A] flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#2B1D14] mb-1 group-hover:text-[#2F5D3A] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#E0A526] mb-3">
                    {pillar.subtitle}
                  </p>
                  <p className="text-sm text-[#6B5444] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-[#E8DCC4]/50 flex items-center gap-1.5 text-xs text-[#2F5D3A] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#2F5D3A]" />
                  <span>Verified Daily Quality Standard</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
