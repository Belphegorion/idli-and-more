import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Table } from '@/lib/models/Table';
import { Order } from '@/lib/models/Order';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const actorEmail = req.headers.get('x-user-email') || 'staff';

    await connectToDatabase();
    const table = await Table.findById(id);
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Mark all active (unserved or unpaid) orders on this table as served & paid
    const updated = await Order.updateMany(
      {
        tableId: id,
        status: { $in: ['received', 'preparing', 'ready', 'served'] },
        paymentStatus: { $ne: 'paid' },
      },
      {
        $set: {
          status: 'served',
          paymentStatus: 'paid',
        },
        $push: {
          statusHistory: {
            status: 'served',
            changedAt: new Date(),
            note: `Table bill cleared by ${actorEmail}`,
          },
        },
      }
    );

    await logAudit({
      actorId: actorEmail,
      action: 'TABLE_CLEAR_PAID',
      entity: 'Table',
      entityId: id,
      before: { tableLabel: table.label },
      after: { clearedOrdersCount: updated.modifiedCount },
    });

    return NextResponse.json({
      success: true,
      message: `${table.label} marked paid and cleared. (${updated.modifiedCount} orders finalized)`,
      modifiedCount: updated.modifiedCount,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/tables/[id]/clear:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
