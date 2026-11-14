import crypto from 'crypto';
import connectToDatabase from './db';
import { User } from './models/User';
import { Category } from './models/Category';
import { MenuItem } from './models/MenuItem';
import { Outlet } from './models/Outlet';
import { Table } from './models/Table';
import { SiteSettings } from './models/SiteSettings';
import { hashPassword } from './auth';

export async function runDatabaseSeed() {
  await connectToDatabase();
  console.log('Connected to MongoDB for database seeding.');

  // 1. Seed Owner User
  const adminEmail = (process.env.ADMIN_EMAIL || 'owner@idliandmore.in').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'IdliTempleMorning2026!';
  const existingOwner = await User.findOne({ email: adminEmail });

  if (!existingOwner) {
    const passwordHash = await hashPassword(adminPassword);
    await User.create({
      email: adminEmail,
      passwordHash,
      role: 'owner',
      name: 'Owner Admin',
    });
    console.log(`Created initial owner account: ${adminEmail}`);
  } else {
    console.log(`Owner account already exists: ${adminEmail}`);
  }

  // 2. Seed Default Categories
  const categoryDefs = [
    { name: 'All Day Breakfast & Idlis', slug: 'idlis', order: 1 },
    { name: 'Vada & Traditional Snacks', slug: 'vada-snacks', order: 2 },
    { name: 'Pav Bhaji & Specialties', slug: 'pav-bhaji', order: 3 },
    { name: 'Filter Coffee & Beverages', slug: 'beverages', order: 4 },
  ];

  const categoryMap = new Map<string, any>();
  for (const cat of categoryDefs) {
    let doc = await Category.findOne({ slug: cat.slug });
    if (!doc) {
      doc = await Category.create({
        name: cat.name,
        slug: cat.slug,
        order: cat.order,
        isActive: true,
      });
      console.log(`Created category: ${cat.name}`);
    }
    categoryMap.set(cat.slug, doc);
  }

  // 3. Seed Bhopal Outlets
  const outletDefs = [
    {
      name: 'Kolar Road Flagship',
      slug: 'kolar-road',
      address: 'Shop 4-5, Near Sarvdharm Bridge, Main Kolar Road, Bhopal, MP 462042',
      phone: '+91 98930 12345',
      mapUrl: 'https://maps.google.com/?q=Idli+and+More+Kolar+Road+Bhopal',
      hours: [
        { day: 'All Days', open: '07:30', close: '22:30', closed: false },
      ],
    },
    {
      name: '7 No. Stop Heritage Outlet',
      slug: '7-no-stop',
      address: 'Near Old Subhash School, 7 No. Bus Stop, Bhopal, MP 462016',
      phone: '+91 98930 12346',
      mapUrl: 'https://maps.google.com/?q=Idli+and+More+7+No+Bhopal',
      hours: [
        { day: 'All Days', open: '07:30', close: '22:30', closed: false },
      ],
    },
    {
      name: 'MP Nagar Express',
      slug: 'mp-nagar',
      address: 'Plot 12, Commercial Zone, MP Nagar Zone-II, Bhopal, MP 462011',
      phone: '+91 98930 12347',
      mapUrl: 'https://maps.google.com/?q=MP+Nagar+Bhopal',
      hours: [
        { day: 'All Days', open: '08:00', close: '22:00', closed: false },
      ],
    },
  ];

  const outletMap = new Map<string, any>();
  for (const out of outletDefs) {
    let doc = await Outlet.findOne({ slug: out.slug });
    if (!doc) {
      doc = await Outlet.create({
        name: out.name,
        slug: out.slug,
        address: out.address,
        phone: out.phone,
        mapUrl: out.mapUrl,
        hours: out.hours,
        holidayOverride: { isClosed: false, reason: '' },
        isActive: true,
      });
      console.log(`Created outlet: ${out.name}`);
    }
    outletMap.set(out.slug, doc);
  }

  // 4. Seed Real Bhopal Menu
  const idlisCatId = categoryMap.get('idlis')?._id;
  const snacksCatId = categoryMap.get('vada-snacks')?._id;
  const pavCatId = categoryMap.get('pav-bhaji')?._id;
  const drinksCatId = categoryMap.get('beverages')?._id;

  const realMenu = [
    {
      name: 'Ghee Podi Thatte Idli',
      nameHindi: 'घी पोड़ी थट्टे इडली',
      slug: 'ghee-podi-thatte-idli',
      price: 250,
      categoryId: idlisCatId,
      description: 'Iconic wide Karnataka-style steamed idli drenched in aromatic desi ghee and in-house spiced gun powder (podi). Served with coconut & tomato chutney.',
      isVeg: true,
      tags: ['Ghee', 'Spicy', 'Bestseller'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      isChefPick: true,
      order: 1,
    },
    {
      name: 'Steamed Idli (2 pcs)',
      nameHindi: 'सादा इडली (२ पीस)',
      slug: 'steamed-idli-2-pcs',
      price: 170,
      categoryId: idlisCatId,
      description: 'Cloud-soft fermented rice & urad dal cakes, steamed fresh every 20 minutes. Served with piping hot drumstick sambar and fresh coconut chutney.',
      isVeg: true,
      tags: ['Bestseller'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      isChefPick: true,
      order: 2,
    },
    {
      name: 'Podi Idli – Ghee',
      nameHindi: 'पोड़ी इडली - घी',
      slug: 'podi-idli-ghee',
      price: 220,
      categoryId: idlisCatId,
      description: 'Bite-sized soft idlis tossed with rich cultured cow ghee and fiery homemade roasted lentil spice podi.',
      isVeg: true,
      tags: ['Ghee', 'Spicy', 'Bestseller'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      isChefPick: false,
      order: 3,
    },
    {
      name: 'Idli Vada Mix',
      nameHindi: 'इडली वड़ा मिक्स',
      slug: 'idli-vada-mix',
      price: 170,
      categoryId: idlisCatId,
      description: 'The golden combination: one soft steamed idli and one hot crispy medu vada with sambar & chutney.',
      isVeg: true,
      tags: ['Fried', 'Bestseller'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      isChefPick: false,
      order: 4,
    },
    {
      name: 'Fried Idli',
      nameHindi: 'फ्राइड इडली',
      slug: 'fried-idli',
      price: 275,
      categoryId: idlisCatId,
      description: 'Crisp golden exterior, pillowy inside. Dusted with house chaat podi, served with creamy coconut dip.',
      isVeg: true,
      tags: ['Fried'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      isChefPick: false,
      order: 5,
    },
    {
      name: 'Steamed Tadka Idli',
      nameHindi: 'स्टीम्ड तड़का इडली',
      slug: 'steamed-tadka-idli',
      price: 275,
      categoryId: idlisCatId,
      description: 'Fluffy idlis tempered with mustard seeds, curry leaves, hing, green chillies, and ginger.',
      isVeg: true,
      tags: ['Spicy'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      isChefPick: false,
      order: 6,
    },
    {
      name: 'Masala Idli',
      nameHindi: 'मसाला इडली',
      slug: 'masala-idli',
      price: 300,
      categoryId: idlisCatId,
      description: 'Cubed idlis pan-tossed in a vibrant onion, tomato, capsicum, and southern spice masala.',
      isVeg: true,
      tags: ['Spicy'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      isChefPick: false,
      order: 7,
    },
    {
      name: 'Masala Cheese Idli',
      nameHindi: 'मसाला चीज़ इडली',
      slug: 'masala-cheese-idli',
      price: 330,
      categoryId: idlisCatId,
      description: 'Cubed idlis pan-tossed in spiced onion-tomato masala, capped with generous melted mozzarella and fresh coriander.',
      isVeg: true,
      tags: ['Cheesy', 'Spicy'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      isChefPick: false,
      order: 8,
    },
    {
      name: 'Ghee Lemon Pepper Idli',
      nameHindi: 'घी लेमन पेपर इडली',
      slug: 'ghee-lemon-pepper-idli',
      price: 330,
      categoryId: idlisCatId,
      description: 'Zesty lemon, cracked tellicherry black pepper, and fragrant curry leaves sizzled in desi cow ghee.',
      isVeg: true,
      tags: ['Ghee'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      isChefPick: false,
      order: 9,
    },
    {
      name: 'Ghee Peri Peri Idli',
      nameHindi: 'घी पेरी पेरी इडली',
      slug: 'ghee-peri-peri-idli',
      price: 330,
      categoryId: idlisCatId,
      description: 'Modern twist with fiery African bird’s-eye peri peri seasoning sautéed in traditional Indian ghee.',
      isVeg: true,
      tags: ['Ghee', 'Spicy'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      isChefPick: false,
      order: 10,
    },
    {
      name: 'Green Chilly Tadka Idli',
      nameHindi: 'हरी मिर्च तड़का इडली',
      slug: 'green-chilly-tadka-idli',
      price: 330,
      categoryId: idlisCatId,
      description: 'Sizzled with slit Kolhapuri green chillies, curry patta, rai, and pure aromatic butter.',
      isVeg: true,
      tags: ['Spicy', 'Ghee'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      isChefPick: false,
      order: 11,
    },
    {
      name: 'Dal Vada (2 pcs)',
      nameHindi: 'दाल वड़ा (२ पीस)',
      slug: 'dal-vada-2-pcs',
      price: 169,
      categoryId: snacksCatId,
      description: 'Crunchy chana dal patties infused with chopped onions, green chilies, ginger, and curry leaves.',
      isVeg: true,
      tags: ['Fried', 'Spicy', 'Bestseller'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      isChefPick: true,
      order: 12,
    },
    {
      name: 'Sabudana Vada (2 pcs)',
      nameHindi: 'साबूदाना वड़ा',
      slug: 'sabudana-vada-2-pcs',
      price: 240,
      categoryId: snacksCatId,
      description: 'Crisp golden tapioca pearl patties blended with crushed roasted peanuts, cumin, and potatoes.',
      isVeg: true,
      tags: ['Fried'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      isChefPick: false,
      order: 13,
    },
    {
      name: 'Sabudana Khichadi',
      nameHindi: 'साबूदाना खिचड़ी',
      slug: 'sabudana-khichadi',
      price: 210,
      categoryId: snacksCatId,
      description: 'Soft translucent pearls tossed with crunchy groundnuts, green chillies, and cumin seeds.',
      isVeg: true,
      tags: [],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      isChefPick: false,
      order: 14,
    },
    {
      name: 'Upma',
      nameHindi: 'उपमा',
      slug: 'upma',
      price: 169,
      categoryId: snacksCatId,
      description: 'Classic roasted semolina cooked with roasted cashews, mustard seeds, curry leaves, and ginger ghee.',
      isVeg: true,
      tags: ['Ghee'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      isChefPick: false,
      order: 15,
    },
    {
      name: 'Butter Pav Bhaji',
      nameHindi: 'बटर पाव भाजी',
      slug: 'butter-pav-bhaji',
      price: 270,
      categoryId: pavCatId,
      description: 'Rich spiced mashed vegetable gravy simmered with generous dollops of butter, served with soft toasted pavs.',
      isVeg: true,
      tags: ['Spicy', 'Bestseller'],
      imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80',
      isChefPick: true,
      order: 16,
    },
    {
      name: 'Degree Filter Coffee',
      nameHindi: 'डिग्री फ़िल्टर कॉफ़ी',
      slug: 'degree-filter-coffee',
      price: 90,
      categoryId: drinksCatId,
      description: 'Traditional South Indian chicory-blend decoction frothed with fresh whole milk in brass dabarah and tumbler.',
      isVeg: true,
      tags: ['Bestseller'],
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
      isChefPick: true,
      order: 17,
    },
  ];

  for (const item of realMenu) {
    if (!item.categoryId) continue;
    const existing = await MenuItem.findOne({ slug: item.slug });
    if (!existing) {
      await MenuItem.create({
        ...item,
        inStock: true,
        isArchived: false,
      });
      console.log(`Created menu item: ${item.name}`);
    }
  }

  // 5. Seed Tables for Outlets with unguessable tokens
  for (const [slug, outletDoc] of outletMap.entries()) {
    const tableCount = slug === 'kolar-road' ? 10 : slug === '7-no-stop' ? 8 : 6;
    for (let i = 1; i <= tableCount; i++) {
      const label = `Table ${i}`;
      const existing = await Table.findOne({ outletId: outletDoc._id, label });
      if (!existing) {
        const token = crypto.randomBytes(16).toString('hex');
        await Table.create({
          outletId: outletDoc._id,
          label,
          seats: i % 2 === 0 ? 4 : 2,
          token,
          isEnabled: true,
        });
      }
    }
    console.log(`Seeded tables for outlet: ${slug}`);
  }

  // 6. Seed SiteSettings singleton
  const existingSettings = await SiteSettings.findOne({ isSingleton: true });
  if (!existingSettings) {
    await SiteSettings.create({
      isSingleton: true,
      brand: {
        name: 'Idli & More',
        tagline: 'Temple-Morning Breakfast · Bhopal',
        logoUrl: '',
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
        pauseMessage: 'Kitchen is at peak rush. QR ordering is temporarily paused for 10 mins.',
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
    });
    console.log('Seeded default SiteSettings singleton.');
  }

  console.log('Seeding completed successfully!');
}

export default runDatabaseSeed;
