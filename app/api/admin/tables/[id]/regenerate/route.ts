import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/db';
import { Table } from '@/lib/models/Table';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const actorEmail = req.headers.get('x-user-email') || 'owner';

    await connectToDatabase();
    const table = await Table.findById(id);

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const oldToken = table.token;
    const newToken = crypto.randomBytes(16).toString('hex');

    table.token = newToken;
    await table.save();

    await logAudit({
      actorId: actorEmail,
      action: 'TABLE_TOKEN_REGENERATE',
      entity: 'Table',
      entityId: id,
      before: { oldToken, label: table.label },
      after: { newToken, label: table.label },
    });

    return NextResponse.json({
      success: true,
      message: `QR code rotated for ${table.label}. Old QR code is now invalid.`,
      token: newToken,
      tableId: table._id,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/tables/[id]/regenerate:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
