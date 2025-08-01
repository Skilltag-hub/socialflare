import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware disabled - no redirects or token checking
// Company/student distinction handled at login level only
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// No matcher - middleware applies to no routes
export const config = {
  matcher: []
}
