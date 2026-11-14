import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { User } from '@/lib/models/User';
import { hashPassword } from '@/lib/auth';
import { UserCreateSchema, UserResetPasswordSchema } from '@/lib/validations';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const actorRole = req.headers.get('x-user-role');
    if (actorRole !== 'owner') {
      return NextResponse.json({ error: 'Forbidden: Owner role required' }, { status: 403 });
    }

    await connectToDatabase();
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actorRole = req.headers.get('x-user-role');
    const actorEmail = req.headers.get('x-user-email') || 'owner';

    if (actorRole !== 'owner') {
      return NextResponse.json({ error: 'Forbidden: Owner role required' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = UserCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password, role, name } = parsed.data;

    await connectToDatabase();
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const newUser = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      role,
      name,
    });

    await logAudit({
      actorId: actorEmail,
      action: 'USER_CREATE',
      entity: 'User',
      entityId: newUser._id.toString(),
      before: {},
      after: { email: newUser.email, role: newUser.role, name: newUser.name },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/users:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const actorRole = req.headers.get('x-user-role');
    const actorEmail = req.headers.get('x-user-email') || 'owner';

    if (actorRole !== 'owner') {
      return NextResponse.json({ error: 'Forbidden: Owner role required' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = UserResetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const { userId, newPassword } = parsed.data;

    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    await logAudit({
      actorId: actorEmail,
      action: 'USER_PASSWORD_RESET',
      entity: 'User',
      entityId: userId,
      before: { email: user.email },
      after: { email: user.email, action: 'password_reset_by_owner' },
    });

    return NextResponse.json({ success: true, message: `Password reset successfully for ${user.email}` });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/users:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const actorRole = req.headers.get('x-user-role');
    const actorId = req.headers.get('x-user-id');
    const actorEmail = req.headers.get('x-user-email') || 'owner';

    if (actorRole !== 'owner') {
      return NextResponse.json({ error: 'Forbidden: Owner role required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (id === actorId) {
      return NextResponse.json({ error: 'You cannot delete your own active owner account' }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await logAudit({
      actorId: actorEmail,
      action: 'USER_DELETE',
      entity: 'User',
      entityId: id,
      before: { email: deleted.email, role: deleted.role },
      after: {},
    });

    return NextResponse.json({ success: true, message: `User ${deleted.email} deleted successfully` });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/users:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
