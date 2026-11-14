import React from 'react';
import { KolamDivider } from '../CulturalMotifs';

export const OurStory: React.FC<{ storyText?: string }> = ({
  storyText = 'Born out of devotion to early-morning South Indian breakfast traditions, Idli & More brings pure Karnataka & Tamil Nadu culinary craft to the heart of Bhopal.',
}) => {
  return (
    <section id="story" className="py-14 bg-[#FFFDF7] relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10 flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#2F5D3A] block mb-2">
            Our Heritage & Craft
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1D14]">
            Born from a Craving for Pure Temple-Style Idlis
          </h2>
          <p className="text-xs text-[#2F5D3A] font-medium mt-1">
            Authentic South Indian Comfort · Steamed Fresh Daily
          </p>
        </div>

        {/* Narrative Block */}
        <div className="bg-[#FAF6EC] p-6 sm:p-10 rounded-3xl border border-[#E8DCC4] shadow-xs space-y-6 text-sm sm:text-base text-[#6B5444] leading-relaxed">
          <p className="first-letter:font-serif first-letter:text-4xl first-letter:font-bold first-letter:text-[#2F5D3A] first-letter:float-left first-letter:mr-3 first-letter:leading-none">
            {storyText}
          </p>

          <p>
            In the early mornings of Tamil Nadu and Karnataka, the day begins with the quiet rhythm of temple bells and the intoxicating fragrance of steaming urad dal and roasted gun-powder podi. When our founders settled in Bhopal, we missed that unhurried honesty — idlis that felt like soft clouds, sambar made with slow-simmered drumsticks, and filter coffee brewed with genuine patience.
          </p>

          <p>
            In 2019, we set up our very first outlet at <strong>7 No. Stop, Arera Colony</strong>. We didn’t rely on food soda or commercial preservatives. Instead, we spent months calibrating water hardness, rice grain ratios, and overnight natural fermentation in Bhopal’s changing seasons to recreate the true temple-morning texture.
          </p>

          {/* Timeline Milestones */}
          <div className="pt-8 border-t border-[#E8DCC4] space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#2B1D14]">
              Our Bhopal Journey Timeline
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-[#FFFDF7] p-4 rounded-xl border border-[#E8DCC4]">
                <span className="text-xs font-bold text-[#E0A526]">2019</span>
                <p className="font-serif font-bold text-base text-[#2B1D14] mt-0.5">7 No. Arera Colony</p>
                <p className="text-xs text-[#6B5444] mt-1">First traditional counter opened. The legendary podi idli was born.</p>
              </div>

              <div className="bg-[#FFFDF7] p-4 rounded-xl border border-[#E8DCC4]">
                <span className="text-xs font-bold text-[#E0A526]">2022</span>
                <p className="font-serif font-bold text-base text-[#2B1D14] mt-0.5">Kolar Road Flagship</p>
                <p className="text-xs text-[#6B5444] mt-1">Expanded to a spacious, temple-calm dine-in space with live steaming bar.</p>
              </div>

              <div className="bg-[#FFFDF7] p-4 rounded-xl border border-[#E8DCC4]">
                <span className="text-xs font-bold text-[#E0A526]">2024 & Beyond</span>
                <p className="font-serif font-bold text-base text-[#2B1D14] mt-0.5">MP Nagar & More</p>
                <p className="text-xs text-[#6B5444] mt-1">Expanding pure, wholesome breakfast comfort across central Madhya Pradesh.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
      <KolamDivider />
    </section>
  );
};
