import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import { Offer } from '@/lib/models/Offer';
import { OfferSchema } from '@/lib/validations';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await connectToDatabase();
    const offers = await Offer.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: offers });
  } catch (error: any) {
    console.error('Error in GET /api/admin/offers:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actorEmail = req.headers.get('x-user-email') || 'owner';
    const body = await req.json();

    const parsed = OfferSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    await connectToDatabase();
    const newOffer = await Offer.create({
      ...parsed.data,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : undefined,
    });

    await logAudit({
      actorId: actorEmail,
      action: 'OFFER_CREATE',
      entity: 'Offer',
      entityId: newOffer._id.toString(),
      before: {},
      after: newOffer.toObject(),
    });

    revalidatePath('/');

    return NextResponse.json({ success: true, offer: newOffer }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/offers:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const actorEmail = req.headers.get('x-user-email') || 'owner';
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Offer ID required' }, { status: 400 });
    }

    await connectToDatabase();
    const offer = await Offer.findById(id);
    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    const before = offer.toObject();
    Object.assign(offer, updateData);
    if (updateData.startsAt) offer.startsAt = new Date(updateData.startsAt);
    if (updateData.endsAt) offer.endsAt = new Date(updateData.endsAt);
    await offer.save();

    await logAudit({
      actorId: actorEmail,
      action: 'OFFER_UPDATE',
      entity: 'Offer',
      entityId: id,
      before,
      after: offer.toObject(),
    });

    revalidatePath('/');

    return NextResponse.json({ success: true, offer });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/offers:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const actorEmail = req.headers.get('x-user-email') || 'owner';
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Offer ID required' }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await Offer.findByIdAndDelete(id);

    await logAudit({
      actorId: actorEmail,
      action: 'OFFER_DELETE',
      entity: 'Offer',
      entityId: id,
      before: deleted?.toObject() || {},
      after: {},
    });

    revalidatePath('/');

    return NextResponse.json({ success: true, message: 'Offer deleted' });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/offers:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
