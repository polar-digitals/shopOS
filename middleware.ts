import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabaseServer';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabase, supabaseResponse } = createMiddlewareClient(request);

  // Refresh the auth session (required by Supabase SSR)
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect unauthenticated users away from protected routes
  if (!user && (pathname.startsWith('/owner') || pathname.startsWith('/front-desk'))) {
    return NextResponse.redirect(new URL('/login', request.url));
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
      return NextResponse.redirect(new URL('/front-desk', request.url));
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
      return NextResponse.redirect(new URL('/owner', request.url));
    } else {
      return NextResponse.redirect(new URL('/front-desk', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/owner/:path*', '/front-desk/:path*', '/login'],
};
