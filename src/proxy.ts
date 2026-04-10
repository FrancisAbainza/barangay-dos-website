import { NextRequest, NextResponse } from "next/server";

function getSessionClaims(session: string): Record<string, unknown> | null {
  try {
    const base64Url = session.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("__session")?.value;
  const { pathname } = request.nextUrl;

  if (session) {
    const claims = getSessionClaims(session);
    const isAdmin = claims?.admin === true;

    // Redirect from home page based on role
    if (pathname === '/' || pathname === '/news' || pathname === '/about-us') {
      return NextResponse.redirect(new URL(isAdmin ? '/staff' : '/resident', request.url));
    }

    // Prevent admins from accessing /resident
    if (isAdmin && pathname.startsWith('/resident')) {
      return NextResponse.redirect(new URL('/staff', request.url));
    }

    // Prevent residents from accessing /staff
    if (!isAdmin && pathname.startsWith('/staff')) {
      return NextResponse.redirect(new URL('/resident', request.url));
    }
  } else {
    // No session: redirect protected routes to home
    if (pathname.startsWith('/resident') || pathname.startsWith('/staff') || pathname.startsWith('/profile')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Optimization: Only run middleware on these paths
export const config = {
  matcher: ['/resident/:path*', '/staff/:path*', '/', '/profile/:path*', '/news/:path*', '/about-us/:path*'],
};