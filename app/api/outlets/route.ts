import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Outlet } from '@/lib/models/Outlet';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const outlets = await Outlet.find({ isActive: true }).lean();

    return NextResponse.json({
      success: true,
      data: outlets,
    });
  } catch (error: any) {
    console.warn('MongoDB query warning in GET /api/outlets, using fallback:', error.message);
    const { INITIAL_OUTLETS } = await import('@/lib/fallbackData');
    return NextResponse.json({
      success: true,
      data: INITIAL_OUTLETS,
      fallback: true,
    });
  }
}
