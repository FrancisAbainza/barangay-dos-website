import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("__session")?.value;
  const { pathname } = request.nextUrl;

  if (session) {
    // Redirect from public pages to dashboard
    if (pathname === '/' || pathname === '/news' || pathname === '/about-us') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else {
    // No session: redirect protected routes to home
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Optimization: Only run middleware on these paths
export const config = {
  matcher: ['/dashboard/:path*', '/', '/news/:path*', '/about-us/:path*'],
};