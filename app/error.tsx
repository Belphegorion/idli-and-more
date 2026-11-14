'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { TempleBorder, KolamDivider } from '@/components/CulturalMotifs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF6EC] text-[#2B1D14] flex flex-col justify-between">
      <TempleBorder variant="gold" />

      <main className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#B3261E]/10 text-[#B3261E] flex items-center justify-center mx-auto text-2xl font-serif font-bold">
          500
        </div>

        <h1 className="font-serif text-3xl font-bold text-[#2B1D14]">
          The Kitchen Hit a Snag
        </h1>

        <p className="text-sm text-[#6B5444] leading-relaxed">
          We experienced a brief steam hiccup on our server. Please try refreshing the page or head back to the main menu.
        </p>

        <KolamDivider />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#E0A526] text-[#2B1D14] font-bold text-sm shadow-sm hover:bg-[#c9921e] transition-colors"
          >
            Retry Order
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#2F5D3A] text-[#2F5D3A] font-semibold text-sm hover:bg-[#2F5D3A]/5 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>

      <div className="pb-8 text-center text-xs text-[#6B5444]">
        Idli & More · Bhopal
      </div>
    </div>
  );
}
