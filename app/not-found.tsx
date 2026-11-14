import Link from 'next/link';
import { TempleBorder, KolamDivider } from '@/components/CulturalMotifs';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF6EC] text-[#2B1D14] flex flex-col justify-between">
      <TempleBorder variant="green" />

      <main className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#2F5D3A]/10 text-[#2F5D3A] flex items-center justify-center mx-auto text-2xl font-serif font-bold">
          404
        </div>

        <h1 className="font-serif text-3xl font-bold text-[#2B1D14]">
          This Plate is Empty
        </h1>

        <p className="text-sm text-[#6B5444] leading-relaxed">
          The dish or page you are looking for might have been moved or is currently not on our menu.
        </p>

        <KolamDivider />

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#2F5D3A] text-white font-bold text-sm shadow-md hover:bg-[#1F3F28] transition-colors"
          >
            ← Return to Breakfast Menu
          </Link>
        </div>
      </main>

      <div className="pb-8 text-center text-xs text-[#6B5444]">
        Idli & More · Bhopal
      </div>
    </div>
  );
}
