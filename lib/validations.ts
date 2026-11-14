import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const MenuItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').trim(),
  nameHindi: z.string().optional().default(''),
  slug: z.string().optional(),
  description: z.string().optional().default(''),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  categoryId: z.string().min(1, 'Category is required'),
  imageUrl: z.string().optional().default(''),
  isVeg: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  inStock: z.boolean().default(true),
  isChefPick: z.boolean().default(false),
  order: z.coerce.number().default(0),
});

export const CategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').trim(),
  slug: z.string().optional(),
  order: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

export const CategoryReorderSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int(),
    })
  ).min(1),
});

export const TableSchema = z.object({
  outletId: z.string().min(1, 'Outlet is required'),
  label: z.string().min(1, 'Table label is required').trim(),
  seats: z.coerce.number().int().min(1, 'Must have at least 1 seat').default(4),
  isEnabled: z.boolean().default(true),
});

export const CreateOrderSchema = z.object({
  token: z.string().min(1, 'Table token is required'),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1, 'Menu item ID required'),
        qty: z.coerce.number().int().min(1, 'Quantity must be at least 1').max(50, 'Max 50 items per line'),
        note: z.string().max(200, 'Note too long').optional().default(''),
      })
    )
    .min(1, 'Order must contain at least one item')
    .max(30, 'Max 30 items per order'),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['received', 'preparing', 'ready', 'served', 'cancelled']),
  reason: z.string().optional(),
});

export const BulkMenuActionSchema = z.object({
  itemIds: z.array(z.string()).min(1, 'At least one item required'),
  action: z.enum(['set_stock', 'change_category', 'adjust_price', 'archive', 'restore']),
  inStock: z.boolean().optional(),
  categoryId: z.string().optional(),
  priceAdjustmentType: z.enum(['percentage', 'fixed']).optional(),
  priceAdjustmentValue: z.number().optional(),
});

export const StockToggleSchema = z.object({
  inStock: z.boolean(),
});

export const UserCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['owner', 'staff']),
  name: z.string().min(1, 'Name is required').trim(),
});

export const UserResetPasswordSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const OutletSchema = z.object({
  name: z.string().min(1, 'Outlet name is required').trim(),
  slug: z.string().optional(),
  address: z.string().min(1, 'Address is required').trim(),
  phone: z.string().min(1, 'Phone is required').trim(),
  mapUrl: z.string().optional().default(''),
  hours: z
    .array(
      z.object({
        day: z.string(),
        open: z.string(),
        close: z.string(),
        closed: z.boolean(),
      })
    )
    .optional()
    .default([]),
  holidayOverride: z
    .object({
      isClosed: z.boolean().default(false),
      reason: z.string().optional().default(''),
      date: z.string().optional(),
    })
    .optional(),
  isActive: z.boolean().default(true),
});

export const OfferSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().min(1, 'Description is required').trim(),
  code: z.string().optional(),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const SiteSettingsSchema = z.object({
  brand: z.object({
    name: z.string().min(1),
    tagline: z.string(),
    logoUrl: z.string().optional().default(''),
    phone: z.string(),
    whatsapp: z.string(),
    email: z.string().email(),
    address: z.string(),
    mapUrl: z.string(),
  }),
  hero: z.object({
    headline: z.string().min(1),
    subline: z.string(),
    heroImageUrl: z.string(),
    signaturePickIds: z.array(z.string()).default([]),
    storyText: z.string(),
  }),
  banner: z.object({
    isEnabled: z.boolean(),
    text: z.string(),
    linkUrl: z.string().optional().default(''),
    startsAt: z.string().optional().nullable(),
    endsAt: z.string().optional().nullable(),
  }),
  ordering: z.object({
    isOrderingPaused: z.boolean(),
    pauseMessage: z.string().optional().default(''),
    minimumOrderAmount: z.coerce.number().min(0),
    gstPercentage: z.coerce.number().min(0).max(50),
    serviceChargePercentage: z.coerce.number().min(0).max(50),
    allowOrderNotes: z.boolean(),
    paymentMode: z.enum(['counter_only', 'razorpay_enabled']).default('counter_only'),
  }),
  socialLinks: z.object({
    instagram: z.string(),
    googleReviews: z.string(),
    swiggy: z.string(),
    zomato: z.string(),
  }),
  seo: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    ogImageUrl: z.string(),
  }),
  themePreset: z.enum(['classic_temple', 'emerald_leaf', 'royal_sandalwood']).default('classic_temple'),
});
