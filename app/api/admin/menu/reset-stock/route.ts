import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import { MenuItem } from '@/lib/models/MenuItem';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const actorEmail = req.headers.get('x-user-email') || 'owner';
    await connectToDatabase();

    const result = await MenuItem.updateMany(
      { isArchived: false, inStock: false },
      { $set: { inStock: true, updatedBy: actorEmail } }
    );

    await logAudit({
      actorId: actorEmail,
      action: 'MANUAL_STOCK_RESET_ALL',
      entity: 'MenuItem',
      entityId: 'all',
      before: {},
      after: { resetCount: result.modifiedCount },
    });

    revalidatePath('/api/menu');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: `Reset ${result.modifiedCount} items back in stock.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/menu/reset-stock:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
