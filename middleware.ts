import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_session';

// Allowed path patterns for staff role
const STAFF_ALLOWED_PAGES = [
  '/admin',
  '/admin/availability',
  '/admin/orders',
  '/admin/tables',
];

const STAFF_ALLOWED_API_PREFIXES = [
  '/api/admin/me',
  '/api/admin/auth/logout',
  '/api/admin/orders',
  '/api/admin/tables',
  '/api/admin/menu',
];

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'idli_and_more_bhopal_super_secure_jwt_secret_key_32chars';
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. CSRF-safety: Origin check on mutation requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) && pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return NextResponse.json({ error: 'Cross-origin request blocked' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'Invalid origin header' }, { status: 403 });
      }
    }
  }

  // 2. Allow public admin login routes
  if (pathname === '/admin/login' || pathname === '/api/admin/auth/login') {
    return NextResponse.next();
  }

  // 3. Protect /admin/** and /api/admin/**
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Unauthorized: Session missing or expired' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const role = (payload.role as string) || 'staff';

    // Staff role restrictions: staff can only access Today's Availability, Live Orders, Tables view
    if (role === 'staff') {
      if (isAdminPage) {
        const isAllowedPage = STAFF_ALLOWED_PAGES.some(
          (p) => pathname === p || pathname.startsWith(`${p}/`)
        );
        if (!isAllowedPage) {
          return NextResponse.redirect(new URL('/admin/availability', request.url));
        }
      } else if (isAdminApi) {
        // Disallow owner-only APIs for staff
        const isOwnerOnlyApi =
          pathname.startsWith('/api/admin/users') ||
          pathname.startsWith('/api/admin/audit') ||
          pathname.startsWith('/api/admin/settings') ||
          pathname.startsWith('/api/admin/offers') ||
          pathname.startsWith('/api/admin/categories') ||
          pathname.startsWith('/api/admin/outlets') ||
          pathname.startsWith('/api/admin/upload-token');

        // Also if modifying menu items (POST, PUT, DELETE), staff is forbidden (only stock PATCH is allowed)
        const isMenuMutation =
          pathname.startsWith('/api/admin/menu') &&
          !pathname.includes('/stock') &&
          ['POST', 'PUT', 'DELETE'].includes(request.method);

        if (isOwnerOnlyApi || isMenuMutation) {
          return NextResponse.json(
            { error: 'Forbidden: Owner role required for this action' },
            { status: 403 }
          );
        }
      }
    }

    // Attach user role & id to request headers for downstream handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', (payload.sub as string) || '');
    requestHeaders.set('x-user-role', role);
    requestHeaders.set('x-user-name', (payload.name as string) || '');
    requestHeaders.set('x-user-email', (payload.email as string) || '');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session token' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
