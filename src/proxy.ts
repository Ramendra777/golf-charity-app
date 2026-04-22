import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route protection proxy (Next.js 16 — replaces middleware.ts).
 * - /dashboard/* requires authentication (active session cookie)
 * - /admin/* requires authentication + role check (enforced server-side in page)
 * Unauthenticated users are redirected to /auth/login.
 */
export function proxy(req: NextRequest) {
  const token =
    req.cookies.get('sb-access-token')?.value ||
    req.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`)?.value;

  const { pathname } = req.nextUrl;

  const protectedRoutes = ['/dashboard', '/admin'];
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
