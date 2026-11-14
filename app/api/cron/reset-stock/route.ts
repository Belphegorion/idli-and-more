import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { MenuItem } from '@/lib/models/MenuItem';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get('authorization');
    const headerSecret = req.headers.get('x-cron-secret');

    // In production, enforce CRON_SECRET validation
    if (cronSecret) {
      const isAuthorized =
        authHeader === `Bearer ${cronSecret}` || headerSecret === cronSecret;
      if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
      }
    }

    await connectToDatabase();

    const result = await MenuItem.updateMany(
      { isArchived: false, inStock: false },
      { $set: { inStock: true } }
    );

    await logAudit({
      actorId: 'system_cron',
      actorName: 'Vercel Daily Stock Reset Cron',
      action: 'CRON_STOCK_RESET',
      entity: 'MenuItem',
      entityId: 'all',
      before: {},
      after: { resetCount: result.modifiedCount },
    });

    return NextResponse.json({
      success: true,
      message: `Daily stock reset complete. ${result.modifiedCount} items marked back in stock.`,
      modifiedCount: result.modifiedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/cron/reset-stock:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Cron error' },
      { status: 500 }
    );
  }
}
