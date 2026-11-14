import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Table } from '@/lib/models/Table';
import { MenuItem } from '@/lib/models/MenuItem';
import { Order } from '@/lib/models/Order';
import { SiteSettings } from '@/lib/models/SiteSettings';
import { CreateOrderSchema } from '@/lib/validations';

export const runtime = 'nodejs';

// Simple in-memory rate limiting map for order abuse prevention: token -> timestamps[]
const orderRateLimitMap = new Map<string, number[]>();

function checkOrderRateLimit(token: string): boolean {
  const now = Date.now();
  const timestamps = (orderRateLimitMap.get(token) || []).filter((t) => now - t < 60000);
  if (timestamps.length >= 5) {
    return false; // Exceeded 5 orders per minute per table
  }
  timestamps.push(now);
  orderRateLimitMap.set(token, timestamps);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid order input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { token, items } = parsed.data;

    // Rate limiting check
    if (!checkOrderRateLimit(token)) {
      return NextResponse.json(
        { error: 'Too many order attempts in a short time. Please wait 1 minute.' },
        { status: 429 }
      );
    }

    await connectToDatabase();

    // 1. Check SiteSettings for pause
    const settings = await SiteSettings.findOne({ isSingleton: true }).lean();
    if (settings?.ordering?.isOrderingPaused) {
      return NextResponse.json(
        {
          error:
            settings.ordering.pauseMessage ||
            'Restaurant ordering is currently paused by the kitchen. Please check back in a few minutes.',
        },
        { status: 503 }
      );
    }

    // 2. Validate Table
    const table = await Table.findOne({ token });
    if (!table) {
      return NextResponse.json({ error: 'Invalid table QR token.' }, { status: 404 });
    }

    if (!table.isEnabled) {
      return NextResponse.json(
        { error: 'This table has been disabled by staff. Please ask server for assistance.' },
        { status: 403 }
      );
    }

    // 3. Validate Items, Stock, and Recalculate Prices on Server
    const itemIds = items.map((i) => i.menuItemId);
    const dbItems = await MenuItem.find({
      _id: { $in: itemIds },
      isArchived: false,
    });

    const dbItemMap = new Map<string, any>();
    dbItems.forEach((doc) => dbItemMap.set(doc._id.toString(), doc));

    const orderItems: Array<{
      menuItemId: any;
      nameSnapshot: string;
      priceSnapshot: number;
      qty: number;
      note?: string;
    }> = [];

    let subtotal = 0;

    for (const line of items) {
      const dbItem = dbItemMap.get(line.menuItemId);

      if (!dbItem) {
        return NextResponse.json(
          { error: `Item not found on active menu: ${line.menuItemId}` },
          { status: 400 }
        );
      }

      // Enforce inStock server-side
      if (!dbItem.inStock) {
        return NextResponse.json(
          {
            error: `"${dbItem.name}" is currently sold out and cannot be ordered. Please remove it from your tray.`,
            soldOutItemId: dbItem._id,
          },
          { status: 400 }
        );
      }

      const lineTotal = dbItem.price * line.qty;
      subtotal += lineTotal;

      orderItems.push({
        menuItemId: dbItem._id,
        nameSnapshot: dbItem.name,
        priceSnapshot: dbItem.price,
        qty: line.qty,
        note: line.note?.trim() || '',
      });
    }

    // Check minimum order amount
    const minOrder = settings?.ordering?.minimumOrderAmount || 0;
    if (subtotal < minOrder) {
      return NextResponse.json(
        { error: `Minimum order amount is ₹${minOrder}. Your subtotal is ₹${subtotal}.` },
        { status: 400 }
      );
    }

    // Calculate Tax & Total
    const gstRate = settings?.ordering?.gstPercentage ?? 5;
    const tax = Math.round((subtotal * gstRate) / 100);
    const total = subtotal + tax;

    // Generate readable Order Number (e.g. ORD-1042)
    const orderCount = await Order.countDocuments();
    const orderNo = `ORD-${String(orderCount + 101).padStart(4, '0')}`;

    const newOrder = await Order.create({
      orderNo,
      outletId: table.outletId,
      tableId: table._id,
      items: orderItems,
      subtotal,
      tax,
      total,
      status: 'received',
      paymentStatus: 'counter_pending',
      statusHistory: [
        {
          status: 'received',
          changedAt: new Date(),
          note: `Order placed at ${table.label}`,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully!',
      orderId: newOrder._id,
      orderNo: newOrder.orderNo,
      tableLabel: table.label,
      total: newOrder.total,
    });
  } catch (error: any) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to place order' },
      { status: 500 }
    );
  }
}
