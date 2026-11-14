import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    brand: 'Idli & More',
    city: 'Bhopal',
    timestamp: new Date().toISOString(),
  });
}
