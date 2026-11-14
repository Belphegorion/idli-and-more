import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Idli & More | South Indian Temple-Morning Experience Bhopal',
  description:
    'Experience fresh steamed idlis, ghee podi thatte idli, crispy medu vada, and authentic degree filter coffee in Bhopal. Kolar Road & 7 No. Stop.',
  keywords: [
    'Idli and More',
    'Bhopal South Indian Restaurant',
    'Thatte Idli Bhopal',
    'Podi Idli Kolar Road',
    'Filter Coffee Bhopal',
    'Breakfast 7 No Stop Arera Colony',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Idli & More — South Indian Temple-Morning Comfort in Bhopal',
    description:
      'Steamed live every 20 minutes on aromatic banana leaves with pure cultured cow ghee and house-ground podi.',
    siteName: 'Idli & More',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Restaurant JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Restaurant',
              name: 'Idli & More',
              image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
              servesCuisine: 'South Indian',
              priceRange: '₹₹',
              telephone: '+919893012345',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Shop 4-5, Near Sarvdharm Bridge, Main Kolar Road',
                addressLocality: 'Bhopal',
                addressRegion: 'Madhya Pradesh',
                postalCode: '462042',
                addressCountry: 'IN',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: '23.1815',
                longitude: '77.4126',
              },
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                  ],
                  opens: '07:30',
                  closes: '22:30',
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-[#FAF6EC] text-[#2B1D14] antialiased selection:bg-[#E0A526]/30">
        {children}
      </body>
    </html>
  );
}
