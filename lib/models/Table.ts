import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITable extends Document {
  outletId: mongoose.Types.ObjectId;
  label: string;
  seats: number;
  token: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>(
  {
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true },
    label: { type: String, required: true, trim: true },
    seats: { type: Number, default: 4, required: true },
    token: { type: String, required: true, unique: true, index: true },
    isEnabled: { type: Boolean, default: true, required: true },
  },
  { timestamps: true }
);

TableSchema.index({ outletId: 1 });

export const Table: Model<ITable> =
  mongoose.models.Table || mongoose.model<ITable>('Table', TableSchema);

export default Table;
