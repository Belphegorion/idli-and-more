import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import { SiteSettings } from '@/lib/models/SiteSettings';
import { SiteSettingsSchema } from '@/lib/validations';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    let settings: any = await SiteSettings.findOne({ isSingleton: true }).lean();

    if (!settings) {
      settings = (await SiteSettings.create({ isSingleton: true })).toObject();
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error in GET /api/admin/settings:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const actorEmail = req.headers.get('x-user-email') || 'owner';
    const body = await req.json();

    const parsed = SiteSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    await connectToDatabase();
    let settings = await SiteSettings.findOne({ isSingleton: true });

    if (!settings) {
      settings = new SiteSettings({ isSingleton: true });
    }

    const before = settings.toObject();
    Object.assign(settings, parsed.data);
    await settings.save();

    await logAudit({
      actorId: actorEmail,
      action: 'SETTINGS_UPDATE',
      entity: 'SiteSettings',
      entityId: settings._id.toString(),
      before,
      after: settings.toObject(),
    });

    // On-demand revalidation of public routes so changes reflect immediately without redeploy!
    revalidatePath('/api/settings/public');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: 'Settings updated and public site revalidated immediately.',
      settings,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/settings:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
