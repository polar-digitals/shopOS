import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabaseServer';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabase, supabaseResponse } = createMiddlewareClient(request);

  // Refresh the auth session (required by Supabase SSR)
  const { data: { user } } = await supabase.auth.getUser();

  // Helper to create a redirect response while preserving Supabase session cookies
  const redirectWithCookies = (url: string) => {
    const redirectResponse = NextResponse.redirect(new URL(url, request.url));
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        maxAge: cookie.maxAge,
        expires: cookie.expires,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
      });
    });
    return redirectResponse;
  };

  // Redirect unauthenticated users away from protected routes
  if (!user && (pathname.startsWith('/owner') || pathname.startsWith('/front-desk'))) {
    return redirectWithCookies('/login');
  }

  // If user is authenticated and trying to access /owner, verify they have 'owner' role
  if (user && pathname.startsWith('/owner')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'owner') {
      // Frontdesk users can't access owner dashboard
      return redirectWithCookies('/front-desk');
    }
  }

  // If user is logged in and hits /login, redirect to their dashboard
  if (user && pathname === '/login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'owner') {
      return redirectWithCookies('/owner');
    } else {
      return redirectWithCookies('/front-desk');
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/owner/:path*', '/front-desk/:path*', '/login'],
};
