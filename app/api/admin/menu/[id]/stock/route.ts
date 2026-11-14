import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import { MenuItem } from '@/lib/models/MenuItem';
import { StockToggleSchema } from '@/lib/validations';
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

    const parsed = StockToggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid stock state' }, { status: 400 });
    }

    await connectToDatabase();
    const item = await MenuItem.findById(id);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const beforeStock = item.inStock;
    item.inStock = parsed.data.inStock;
    item.updatedBy = actorEmail;
    await item.save();

    await logAudit({
      actorId: actorEmail,
      action: 'STOCK_TOGGLE',
      entity: 'MenuItem',
      entityId: id,
      before: { inStock: beforeStock, name: item.name },
      after: { inStock: item.inStock, name: item.name },
    });

    revalidatePath('/api/menu');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      id: item._id,
      inStock: item.inStock,
      name: item.name,
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/menu/[id]/stock:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
