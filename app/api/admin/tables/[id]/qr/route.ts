import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import connectToDatabase from '@/lib/db';
import { Table } from '@/lib/models/Table';
import '@/lib/models/Outlet';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'svg';

    await connectToDatabase();
    const table = await Table.findById(id).populate('outletId').lean();

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const domain = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const outletSlug = (table.outletId as any)?.slug || 'outlet';
    const targetUrl = `${domain}/t/${outletSlug}/${table.token}`;

    if (format === 'png') {
      const pngBuffer = await QRCode.toBuffer(targetUrl, {
        type: 'png',
        margin: 2,
        width: 600,
        color: {
          dark: '#1F3F28',
          light: '#FAF6EC',
        },
      });

      return new NextResponse(new Uint8Array(pngBuffer), {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${table.label.replace(/\s+/g, '_')}_QR.png"`,
        },
      });
    }

    // Default SVG
    const svgString = await QRCode.toString(targetUrl, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#1F3F28',
        light: '#FAF6EC',
      },
    });

    return new NextResponse(svgString, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `inline; filename="${table.label.replace(/\s+/g, '_')}_QR.svg"`,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/tables/[id]/qr:', error);
    return NextResponse.json({ error: error.message || 'QR generation error' }, { status: 500 });
  }
}
