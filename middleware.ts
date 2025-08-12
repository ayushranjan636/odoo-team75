import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  // Get auth token from cookies
  const authToken = req.cookies.get('auth-token')?.value
  
  // Define routes that require authentication
  const protectedRoutes = ['/checkout', '/quotation', '/orders', '/admin']
  const adminRoutes = ['/admin']
  
  const { pathname } = req.nextUrl
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  
  // If protected route and no auth token, redirect to login
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // For admin routes, we would need to check user role
  // For now, just check if user is authenticated
  if (isAdminRoute && !authToken) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
