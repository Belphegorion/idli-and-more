import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import { Outlet } from '@/lib/models/Outlet';
import { OutletSchema } from '@/lib/validations';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export async function GET() {
  try {
    await connectToDatabase();
    const outlets = await Outlet.find().sort({ createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: outlets });
  } catch (error: any) {
    console.error('Error in GET /api/admin/outlets:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actorEmail = req.headers.get('x-user-email') || 'owner';
    const body = await req.json();

    const parsed = OutletSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    await connectToDatabase();
    const { name, address, phone, mapUrl, hours, holidayOverride, isActive } = parsed.data;

    let baseSlug = slugify(name);
    let finalSlug = baseSlug;
    let count = 1;
    while (await Outlet.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${count++}`;
    }

    const newOutlet = await Outlet.create({
      name,
      slug: finalSlug,
      address,
      phone,
      mapUrl: mapUrl || '',
      hours: hours && hours.length > 0 ? hours : [{ day: 'All Days', open: '07:30', close: '22:30', closed: false }],
      holidayOverride: holidayOverride || { isClosed: false, reason: '' },
      isActive: isActive ?? true,
    });

    await logAudit({
      actorId: actorEmail,
      action: 'OUTLET_CREATE',
      entity: 'Outlet',
      entityId: newOutlet._id.toString(),
      before: {},
      after: newOutlet.toObject(),
    });

    revalidatePath('/api/outlets');
    revalidatePath('/');

    return NextResponse.json({ success: true, outlet: newOutlet }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/outlets:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const actorEmail = req.headers.get('x-user-email') || 'owner';
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Outlet ID required' }, { status: 400 });
    }

    await connectToDatabase();
    const outlet = await Outlet.findById(id);
    if (!outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 });
    }

    const before = outlet.toObject();
    Object.assign(outlet, updateData);
    await outlet.save();

    await logAudit({
      actorId: actorEmail,
      action: 'OUTLET_UPDATE',
      entity: 'Outlet',
      entityId: id,
      before,
      after: outlet.toObject(),
    });

    revalidatePath('/api/outlets');
    revalidatePath('/');

    return NextResponse.json({ success: true, outlet });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/outlets:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const actorEmail = req.headers.get('x-user-email') || 'owner';
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Outlet ID required' }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await Outlet.findByIdAndDelete(id);

    await logAudit({
      actorId: actorEmail,
      action: 'OUTLET_DELETE',
      entity: 'Outlet',
      entityId: id,
      before: deleted?.toObject() || {},
      after: {},
    });

    revalidatePath('/api/outlets');
    revalidatePath('/');

    return NextResponse.json({ success: true, message: 'Outlet removed' });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/outlets:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
