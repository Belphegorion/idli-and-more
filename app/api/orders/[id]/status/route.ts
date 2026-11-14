import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Order } from '@/lib/models/Order';
import '@/lib/models/Table';
import '@/lib/models/Outlet';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectToDatabase();

    const order = await Order.findById(id)
      .populate('tableId', 'label seats')
      .populate('outletId', 'name address')
      .lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        orderNo: order.orderNo,
        status: order.status,
        cancellationReason: order.cancellationReason,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        statusHistory: order.statusHistory,
        table: order.tableId,
        outlet: order.outletId,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/orders/[id]/status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
