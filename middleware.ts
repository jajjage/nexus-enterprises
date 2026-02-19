import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ||
    "fallback-secret-change-in-production-do-not-use",
);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle /admin routes protection
  if (pathname.startsWith("/admin")) {
    // Allow access to /admin/login without authentication
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Check for NextAuth session token for other /admin routes
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  // Handle /track routes protection
  if (pathname.startsWith("/track")) {
    // Allow access to /track/login without authentication
    if (pathname === "/track/login" || pathname.startsWith("/track/login")) {
      return NextResponse.next();
    }

    // Allow access to /track/[token] without cookie (it will set the cookie)
    if (pathname.match(/^\/track\/[^/]+$/)) {
      return NextResponse.next();
    }

    // For /track and other /track routes, check for client_session cookie
    const clientSession = request.cookies.get("client_session")?.value;

    if (!clientSession) {
      return NextResponse.redirect(new URL("/track/login", request.url));
    }

    // Verify the JWT signature (don't verify expiration here, let the component handle it)
    try {
      await jose.jwtVerify(clientSession, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      // JWT verification failed, redirect to login
      return NextResponse.redirect(new URL("/track/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/track/:path*"],
};
