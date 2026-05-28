import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('shop_session')?.value;
  const { pathname } = request.nextUrl;

  // Protect /owner route
  if (pathname.startsWith('/owner')) {
    if (sessionCookie !== 'owner') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect /front-desk route
  if (pathname.startsWith('/front-desk')) {
    if (sessionCookie !== 'frontdesk' && sessionCookie !== 'owner') { 
      // Option: allow owner to also access front desk if needed, but strict is fine:
      if (sessionCookie !== 'frontdesk') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/owner/:path*', '/front-desk/:path*'],
};
