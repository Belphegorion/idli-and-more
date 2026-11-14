import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import { AuditLog } from '@/lib/models/AuditLog';
import { MenuItem } from '@/lib/models/MenuItem';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const actorRole = req.headers.get('x-user-role');
    if (actorRole !== 'owner') {
      return NextResponse.json({ error: 'Forbidden: Owner role required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50')));
    const entity = searchParams.get('entity');

    await connectToDatabase();
    const filter: any = {};
    if (entity && entity !== 'all') {
      filter.entity = entity;
    }

    const logs = await AuditLog.find(filter).sort({ at: -1 }).limit(limit).lean();

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('Error in GET /api/admin/audit:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// Undo action for price or stock changes
export async function POST(req: NextRequest) {
  try {
    const actorRole = req.headers.get('x-user-role');
    const actorEmail = req.headers.get('x-user-email') || 'owner';

    if (actorRole !== 'owner') {
      return NextResponse.json({ error: 'Forbidden: Owner role required' }, { status: 403 });
    }

    const body = await req.json();
    const { auditId } = body;

    if (!auditId) {
      return NextResponse.json({ error: 'Audit log ID required' }, { status: 400 });
    }

    await connectToDatabase();
    const log = await AuditLog.findById(auditId);
    if (!log) {
      return NextResponse.json({ error: 'Audit log entry not found' }, { status: 404 });
    }

    if (log.entity !== 'MenuItem') {
      return NextResponse.json({ error: 'Undo is currently supported for MenuItem price and stock changes.' }, { status: 400 });
    }

    const item = await MenuItem.findById(log.entityId);
    if (!item) {
      return NextResponse.json({ error: 'Referenced menu item no longer exists.' }, { status: 404 });
    }

    const beforeState = item.toObject();

    // Revert price or inStock if present in log.before
    if (log.before.price !== undefined) {
      item.price = log.before.price;
    }
    if (log.before.inStock !== undefined) {
      item.inStock = log.before.inStock;
    }

    item.updatedBy = `${actorEmail} (UNDO)`;
    await item.save();

    await logAudit({
      actorId: actorEmail,
      action: `UNDO_${log.action}`,
      entity: 'MenuItem',
      entityId: log.entityId,
      before: beforeState,
      after: item.toObject(),
    });

    revalidatePath('/api/menu');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: `Reverted ${item.name} back to previous state (Price: ₹${item.price}, In Stock: ${item.inStock}).`,
      item,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/audit (undo):', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
