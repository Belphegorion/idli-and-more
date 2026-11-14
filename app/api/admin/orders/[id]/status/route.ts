import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Order } from '@/lib/models/Order';
import { UpdateOrderStatusSchema } from '@/lib/validations';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const actorEmail = req.headers.get('x-user-email') || 'staff';
    const body = await req.json();

    const parsed = UpdateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid status update', details: parsed.error.flatten() }, { status: 400 });
    }

    const { status, reason } = parsed.data;

    await connectToDatabase();
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const previousStatus = order.status;
    order.status = status;

    if (status === 'cancelled' && reason) {
      order.cancellationReason = reason;
    }

    if (status === 'served') {
      // If payment is pending and not online, can mark paid if specified in query or payload
      if (body.markPaid) {
        order.paymentStatus = 'paid';
      }
    }

    order.statusHistory.push({
      status,
      changedAt: new Date(),
      note: reason ? `Status changed to ${status}: ${reason}` : `Status updated to ${status} by ${actorEmail}`,
    });

    await order.save();

    await logAudit({
      actorId: actorEmail,
      action: 'ORDER_STATUS_UPDATE',
      entity: 'Order',
      entityId: id,
      before: { status: previousStatus },
      after: { status, reason, orderNo: order.orderNo },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        orderNo: order.orderNo,
        status: order.status,
        cancellationReason: order.cancellationReason,
        paymentStatus: order.paymentStatus,
        statusHistory: order.statusHistory,
      },
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/orders/[id]/status:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
