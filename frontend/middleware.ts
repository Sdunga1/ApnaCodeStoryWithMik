import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value || null;
  const pathname = request.nextUrl.pathname;

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/creator', '/practice'];
  
  // Public routes (auth pages)
  const publicRoutes = ['/login', '/register'];
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login/register with token, redirect to dashboard
  if (isPublicRoute && token) {
    // Get user role from cookie if available
    const userCookie = request.cookies.get('user')?.value;
    let redirectPath = '/dashboard';
    
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        if (user.role === 'creator') {
          redirectPath = '/creator';
        }
      } catch {
        // Invalid user cookie, use default
      }
    }
    
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/creator/:path*',
    '/practice/:path*',
    '/login',
    '/register',
  ],
};

