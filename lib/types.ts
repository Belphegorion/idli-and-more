export interface PublicMenuItem {
  _id?: string;
  id?: string;
  name: string;
  nameHindi?: string;
  slug: string;
  category?: string;
  categoryId?: any;
  price: number;
  description: string;
  imageUrl?: string;
  isVeg: boolean;
  tags: string[];
  inStock: boolean;
  isChefPick?: boolean;
  order?: number;
}

export interface PublicCategory {
  _id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
}

export interface PublicOutlet {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  mapUrl: string;
  hours?: Array<{ day: string; open: string; close: string; closed: boolean }>;
  holidayOverride?: { isClosed: boolean; reason?: string };
}

export interface CartItem {
  item: PublicMenuItem;
  quantity: number;
  note?: string;
}
