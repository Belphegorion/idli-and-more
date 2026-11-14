import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOutletHour {
  day: string; // e.g. 'Monday', 'Tuesday', or '0'-'6'
  open: string; // e.g. '07:30'
  close: string; // e.g. '22:30'
  closed: boolean;
}

export interface IOutlet extends Document {
  name: string;
  slug: string;
  address: string;
  phone: string;
  mapUrl: string;
  hours: IOutletHour[];
  holidayOverride: {
    isClosed: boolean;
    reason?: string;
    date?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OutletHourSchema = new Schema<IOutletHour>(
  {
    day: { type: String, required: true },
    open: { type: String, default: '07:30' },
    close: { type: String, default: '22:30' },
    closed: { type: Boolean, default: false },
  },
  { _id: false }
);

const OutletSchema = new Schema<IOutlet>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    mapUrl: { type: String, default: '' },
    hours: { type: [OutletHourSchema], default: [] },
    holidayOverride: {
      isClosed: { type: Boolean, default: false },
      reason: { type: String, default: '' },
      date: { type: String },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Outlet: Model<IOutlet> =
  mongoose.models.Outlet || mongoose.model<IOutlet>('Outlet', OutletSchema);

export default Outlet;
