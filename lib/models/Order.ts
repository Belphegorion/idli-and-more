import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId;
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
  note?: string;
}

export interface IOrderStatusHistory {
  status: 'received' | 'preparing' | 'ready' | 'served' | 'cancelled';
  changedAt: Date;
  note?: string;
}

export interface IOrder extends Document {
  orderNo: string;
  outletId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'received' | 'preparing' | 'ready' | 'served' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'counter_pending';
  cancellationReason?: string;
  statusHistory: IOrderStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    nameSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    status: {
      type: String,
      enum: ['received', 'preparing', 'ready', 'served', 'cancelled'],
      required: true,
    },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNo: { type: String, required: true, unique: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true },
    tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['received', 'preparing', 'ready', 'served', 'cancelled'],
      default: 'received',
      required: true,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'counter_pending'],
      default: 'counter_pending',
      required: true,
    },
    cancellationReason: { type: String },
    statusHistory: { type: [OrderStatusHistorySchema], default: [] },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ tableId: 1, status: 1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
