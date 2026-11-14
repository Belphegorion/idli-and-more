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
    console.error('Error in GET /api/outlets:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch outlets' },
      { status: 500 }
    );
  }
}
