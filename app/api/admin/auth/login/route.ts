import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { User } from '@/lib/models/User';
import { signToken, verifyPassword, COOKIE_NAME } from '@/lib/auth';
import { LoginSchema } from '@/lib/validations';

export const runtime = 'nodejs';

// Rate limiting: 5 attempts per 15 minutes per (IP + email)
const loginAttempts = new Map<string, number[]>();

function checkLoginRateLimit(key: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const timestamps = (loginAttempts.get(key) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= 5) {
    return false;
  }
  timestamps.push(now);
  loginAttempts.set(key, timestamps);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid credentials format' }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitKey = `${ip}:${email.toLowerCase()}`;

    if (!checkLoginRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase() });

    // Generic error text to prevent account enumeration
    const genericError = 'Invalid email or password.';

    if (!user) {
      return NextResponse.json({ error: genericError }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: genericError }, { status: 401 });
    }

    // Success! Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    // Reset rate limit counter on successful login
    loginAttempts.delete(rateLimitKey);

    const token = await signToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60, // 12 hours
    });

    return response;
  } catch (error: any) {
    console.error('Error in /api/admin/auth/login:', error);
    return NextResponse.json({ error: 'Internal login error' }, { status: 500 });
  }
}
