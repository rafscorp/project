import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth/session";
import { applySecurityHeaders } from "@/lib/security/headers";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/auth/rate-limiter";

/** Middleware Global */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Rate Limiting Base
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(ip, RATE_LIMITS.api);
  
  if (!rateLimit.allowed) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  // 2. Auth Protection para rotas privadas
  const protectedPrefixes = ["/app", "/admin", "/conta"];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  let response = NextResponse.next();

  if (isProtected) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // RBAC (Role-Based Access Control)
    // Admin only
    if (pathname.startsWith("/admin") && session.role !== "PLATFORM_ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Store dashboard
    if (pathname.startsWith("/app") && !["STORE_OWNER", "STORE_STAFF", "PLATFORM_ADMIN"].includes(session.role)) {
      return NextResponse.redirect(new URL("/conta", request.url));
    }
  }

  // 3. Security Headers
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
