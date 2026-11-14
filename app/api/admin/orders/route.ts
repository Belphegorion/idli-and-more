import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Order } from '@/lib/models/Order';
import '@/lib/models/Table';
import '@/lib/models/Outlet';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const statusParam = searchParams.get('status');
    const outletId = searchParams.get('outletId');
    const since = searchParams.get('since');

    const filter: any = {};

    if (statusParam === 'active') {
      filter.status = { $in: ['received', 'preparing', 'ready'] };
    } else if (statusParam && statusParam !== 'all') {
      filter.status = statusParam;
    }

    if (outletId && outletId !== 'all') {
      filter.outletId = outletId;
    }

    if (since) {
      filter.createdAt = { $gt: new Date(since) };
    }

    const orders = await Order.find(filter)
      .populate('tableId', 'label seats isEnabled')
      .populate('outletId', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    // Compute running bill per table for active orders
    const tableBills: Record<string, { tableLabel: string; totalAmount: number; activeOrderCount: number }> = {};

    for (const order of orders) {
      const table = order.tableId as any;
      if (table && order.status !== 'cancelled' && order.paymentStatus !== 'paid') {
        const tableIdStr = table._id?.toString() || 'unknown';
        if (!tableBills[tableIdStr]) {
          tableBills[tableIdStr] = {
            tableLabel: table.label || 'Table',
            totalAmount: 0,
            activeOrderCount: 0,
          };
        }
        tableBills[tableIdStr].totalAmount += order.total;
        tableBills[tableIdStr].activeOrderCount += 1;
      }
    }

    return NextResponse.json({
      success: true,
      orders,
      tableBills,
      serverTime: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/orders:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
