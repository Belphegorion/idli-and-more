import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  nameHindi?: string;
  slug: string;
  description: string;
  price: number;
  categoryId: mongoose.Types.ObjectId;
  imageUrl: string;
  isVeg: boolean;
  tags: string[];
  inStock: boolean;
  isChefPick: boolean;
  order: number;
  isArchived: boolean;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true, trim: true },
    nameHindi: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '', trim: true },
    price: { type: Number, required: true, min: 0 },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    imageUrl: { type: String, default: '' },
    isVeg: { type: Boolean, default: true, required: true },
    tags: { type: [String], default: [] },
    inStock: { type: Boolean, default: true, required: true },
    isChefPick: { type: Boolean, default: false, required: true },
    order: { type: Number, default: 0, required: true },
    isArchived: { type: Boolean, default: false, required: true },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

MenuItemSchema.index({ categoryId: 1, order: 1 });
MenuItemSchema.index({ inStock: 1, isArchived: 1 });

export const MenuItem: Model<IMenuItem> =
  mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

export default MenuItem;
