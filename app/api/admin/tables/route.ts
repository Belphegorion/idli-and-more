import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/db';
import { Table } from '@/lib/models/Table';
import { Outlet } from '@/lib/models/Outlet';
import { TableSchema } from '@/lib/validations';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const outletId = searchParams.get('outletId');

    const filter: any = {};
    if (outletId && outletId !== 'all') {
      filter.outletId = outletId;
    }

    const tables = await Table.find(filter)
      .populate('outletId', 'name slug address')
      .sort({ label: 1 })
      .lean();

    const outlets = await Outlet.find({ isActive: true }).select('name slug').lean();

    return NextResponse.json({
      success: true,
      tables,
      outlets,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/tables:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actorEmail = req.headers.get('x-user-email') || 'owner';
    const body = await req.json();

    const parsed = TableSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    await connectToDatabase();
    const { outletId, label, seats, isEnabled } = parsed.data;

    // Generate unguessable random hex token
    const token = crypto.randomBytes(16).toString('hex');

    const newTable = await Table.create({
      outletId,
      label,
      seats,
      token,
      isEnabled: isEnabled ?? true,
    });

    await logAudit({
      actorId: actorEmail,
      action: 'TABLE_CREATE',
      entity: 'Table',
      entityId: newTable._id.toString(),
      before: {},
      after: newTable.toObject(),
    });

    const populated = await Table.findById(newTable._id).populate('outletId', 'name slug').lean();

    return NextResponse.json({ success: true, table: populated }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/tables:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const actorEmail = req.headers.get('x-user-email') || 'staff';
    const body = await req.json();
    const { id, label, seats, isEnabled, outletId } = body;

    if (!id) {
      return NextResponse.json({ error: 'Table ID required' }, { status: 400 });
    }

    await connectToDatabase();
    const table = await Table.findById(id);
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const before = table.toObject();

    if (label !== undefined) table.label = label;
    if (seats !== undefined) table.seats = Number(seats);
    if (isEnabled !== undefined) table.isEnabled = Boolean(isEnabled);
    if (outletId !== undefined) table.outletId = outletId;

    await table.save();

    await logAudit({
      actorId: actorEmail,
      action: 'TABLE_UPDATE',
      entity: 'Table',
      entityId: id,
      before,
      after: table.toObject(),
    });

    const populated = await Table.findById(id).populate('outletId', 'name slug').lean();

    return NextResponse.json({ success: true, table: populated });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/tables:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const actorEmail = req.headers.get('x-user-email') || 'owner';
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Table ID required' }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await Table.findByIdAndDelete(id);

    await logAudit({
      actorId: actorEmail,
      action: 'TABLE_DELETE',
      entity: 'Table',
      entityId: id,
      before: deleted?.toObject() || {},
      after: {},
    });

    return NextResponse.json({ success: true, message: 'Table removed' });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/tables:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
