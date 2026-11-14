import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Table } from '@/lib/models/Table';
import '@/lib/models/Outlet';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    await connectToDatabase();
    const table = await Table.findOne({ token }).populate('outletId').lean();

    if (!table) {
      return NextResponse.json({ error: 'Table QR code not recognized or invalid' }, { status: 404 });
    }

    if (!table.isEnabled) {
      return NextResponse.json(
        { error: 'This table ordering is currently disabled by restaurant staff.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      table: {
        id: table._id,
        label: table.label,
        seats: table.seats,
        isEnabled: table.isEnabled,
        outlet: table.outletId,
        token: table.token,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/table/[token]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
