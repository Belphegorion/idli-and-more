import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { SiteSettings } from '@/lib/models/SiteSettings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await SiteSettings.findOne({ isSingleton: true }).lean();

    if (!settings) {
      // Return sensible defaults if not yet created in DB
      return NextResponse.json({
        success: true,
        data: {
          brand: {
            name: 'Idli & More',
            tagline: 'Temple-Morning Breakfast · Bhopal',
            phone: '+91 98930 12345',
            whatsapp: '+91 98930 12345',
            email: 'hello@idliandmore.in',
            address: 'Kolar Road & 7 No. Stop, Bhopal, MP',
            mapUrl: 'https://maps.google.com/?q=Idli+and+More+Bhopal',
          },
          hero: {
            headline: 'Soft idlis. Hot sambar. Made like home.',
            subline:
              'Steamed live every 20 minutes on aromatic banana leaves. Pure cultured cow ghee, stone-ground podi, and the serene calm of a traditional temple morning in Bhopal.',
            heroImageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
            signaturePickIds: [],
            storyText:
              'Born out of devotion to early-morning South Indian breakfast traditions, Idli & More brings pure Karnataka & Tamil Nadu culinary craft to the heart of Bhopal.',
          },
          banner: {
            isEnabled: true,
            text: 'Now Steaming Live in Kolar Road & 7 No. Bhopal | Morning Breakfast starts 7:30 AM',
            linkUrl: '',
          },
          ordering: {
            isOrderingPaused: false,
            pauseMessage: '',
            minimumOrderAmount: 0,
            gstPercentage: 5,
            serviceChargePercentage: 0,
            allowOrderNotes: true,
            paymentMode: 'counter_only',
          },
          socialLinks: {
            instagram: 'https://www.instagram.com/idliandmore/?hl=en',
            googleReviews: 'https://share.google/iQAI6vNkOVJLFNBwY',
            swiggy: '',
            zomato: '',
          },
          seo: {
            metaTitle: 'Idli & More | South Indian Temple-Morning Experience Bhopal',
            metaDescription:
              'Experience fresh steamed idlis, ghee podi thatte idli, medu vada, and filter coffee in Bhopal. Visit our Kolar Road & 7 No. outlets.',
            ogImageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
          },
          themePreset: 'classic_temple',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.warn('MongoDB query warning in GET /api/settings/public, using defaults:', error.message);
    return NextResponse.json({
      success: true,
      data: {
        brand: {
          name: 'Idli & More',
          tagline: 'Temple-Morning Breakfast · Bhopal',
          phone: '+91 98930 12345',
          whatsapp: '+91 98930 12345',
          email: 'hello@idliandmore.in',
          address: 'Kolar Road & 7 No. Stop, Bhopal, MP',
          mapUrl: 'https://maps.google.com/?q=Idli+and+More+Bhopal',
        },
        hero: {
          headline: 'Soft idlis. Hot sambar. Made like home.',
          subline:
            'Steamed live every 20 minutes on aromatic banana leaves. Pure cultured cow ghee, stone-ground podi, and the serene calm of a traditional temple morning in Bhopal.',
          heroImageUrl:
            'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
          signaturePickIds: [],
          storyText:
            'Born out of devotion to early-morning South Indian breakfast traditions, Idli & More brings pure Karnataka & Tamil Nadu culinary craft to the heart of Bhopal.',
        },
        banner: {
          isEnabled: true,
          text: 'Now Steaming Live in Kolar Road & 7 No. Bhopal | Morning Breakfast starts 7:30 AM',
          linkUrl: '',
        },
        ordering: {
          isOrderingPaused: false,
          pauseMessage: '',
          minimumOrderAmount: 0,
          gstPercentage: 5,
          serviceChargePercentage: 0,
          allowOrderNotes: true,
          paymentMode: 'counter_only',
        },
        socialLinks: {
          instagram: 'https://www.instagram.com/idliandmore/?hl=en',
          googleReviews: 'https://share.google/iQAI6vNkOVJLFNBwY',
          swiggy: '',
          zomato: '',
        },
        seo: {
          metaTitle: 'Idli & More | South Indian Temple-Morning Experience Bhopal',
          metaDescription:
            'Experience fresh steamed idlis, ghee podi thatte idli, medu vada, and filter coffee in Bhopal. Visit our Kolar Road & 7 No. outlets.',
          ogImageUrl:
            'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
        },
        themePreset: 'classic_temple',
      },
    });
  }
}
