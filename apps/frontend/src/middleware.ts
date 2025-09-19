import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for auth pages and API routes
  if (
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Allow all app routes through - authentication will be handled by the layout
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}