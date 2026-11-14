import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteSettings extends Document {
  isSingleton: boolean;
  brand: {
    name: string;
    tagline: string;
    logoUrl: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    mapUrl: string;
  };
  hero: {
    headline: string;
    subline: string;
    heroImageUrl: string;
    signaturePickIds: mongoose.Types.ObjectId[];
    storyText: string;
  };
  banner: {
    isEnabled: boolean;
    text: string;
    linkUrl?: string;
    startsAt?: Date;
    endsAt?: Date;
  };
  ordering: {
    isOrderingPaused: boolean;
    pauseMessage?: string;
    minimumOrderAmount: number;
    gstPercentage: number;
    serviceChargePercentage: number;
    allowOrderNotes: boolean;
    paymentMode: 'counter_only' | 'razorpay_enabled';
  };
  socialLinks: {
    instagram: string;
    googleReviews: string;
    swiggy: string;
    zomato: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImageUrl: string;
  };
  themePreset: 'classic_temple' | 'emerald_leaf' | 'royal_sandalwood';
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    isSingleton: { type: Boolean, default: true, unique: true },
    brand: {
      name: { type: String, default: 'Idli & More' },
      tagline: { type: String, default: 'Temple-Morning Breakfast · Bhopal' },
      logoUrl: { type: String, default: '' },
      phone: { type: String, default: '+91 98930 12345' },
      whatsapp: { type: String, default: '+91 98930 12345' },
      email: { type: String, default: 'hello@idliandmore.in' },
      address: { type: String, default: 'Kolar Road & 7 No. Stop, Bhopal, MP' },
      mapUrl: { type: String, default: 'https://maps.google.com/?q=Idli+and+More+Bhopal' },
    },
    hero: {
      headline: { type: String, default: 'Soft idlis. Hot sambar. Made like home.' },
      subline: {
        type: String,
        default:
          'Steamed live every 20 minutes on aromatic banana leaves. Pure cultured cow ghee, stone-ground podi, and the serene calm of a traditional temple morning in Bhopal.',
      },
      heroImageUrl: {
        type: String,
        default: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
      },
      signaturePickIds: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }],
      storyText: {
        type: String,
        default:
          'Born out of devotion to early-morning South Indian breakfast traditions, Idli & More brings pure Karnataka & Tamil Nadu culinary craft to the heart of Bhopal.',
      },
    },
    banner: {
      isEnabled: { type: Boolean, default: true },
      text: {
        type: String,
        default: 'Now Steaming Live in Kolar Road & 7 No. Bhopal | Morning Breakfast starts 7:30 AM',
      },
      linkUrl: { type: String, default: '' },
      startsAt: { type: Date },
      endsAt: { type: Date },
    },
    ordering: {
      isOrderingPaused: { type: Boolean, default: false },
      pauseMessage: { type: String, default: 'Kitchen is at peak rush. QR ordering is temporarily paused for 10 mins.' },
      minimumOrderAmount: { type: Number, default: 0 },
      gstPercentage: { type: Number, default: 5 },
      serviceChargePercentage: { type: Number, default: 0 },
      allowOrderNotes: { type: Boolean, default: true },
      paymentMode: { type: String, enum: ['counter_only', 'razorpay_enabled'], default: 'counter_only' },
    },
    socialLinks: {
      instagram: { type: String, default: 'https://www.instagram.com/idliandmore/?hl=en' },
      googleReviews: { type: String, default: 'https://share.google/iQAI6vNkOVJLFNBwY' },
      swiggy: { type: String, default: '' },
      zomato: { type: String, default: '' },
    },
    seo: {
      metaTitle: { type: String, default: 'Idli & More | South Indian Temple-Morning Experience Bhopal' },
      metaDescription: {
        type: String,
        default:
          'Experience fresh steamed idlis, ghee podi thatte idli, medu vada, and filter coffee in Bhopal. Visit our Kolar Road & 7 No. outlets.',
      },
      ogImageUrl: {
        type: String,
        default: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
      },
    },
    themePreset: {
      type: String,
      enum: ['classic_temple', 'emerald_leaf', 'royal_sandalwood'],
      default: 'classic_temple',
    },
  },
  { timestamps: true }
);

export const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
