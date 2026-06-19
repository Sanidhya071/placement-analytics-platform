import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-secret-key-for-placement-analytics-2026"
);

interface SessionUser {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session")?.value;

  let user: SessionUser | null = null;
  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
      user = payload as unknown as SessionUser;
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  // Redirect unauthenticated users away from protected routes
  if (!user && (pathname.startsWith("/student") || pathname.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from login/signup/landing
  if (user && (pathname === "/login" || pathname === "/signup" || pathname === "/")) {
    if (user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  }

  // Role-based access control
  if (user) {
    if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
    if (pathname.startsWith("/student") && user.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/student/:path*", "/admin/:path*"],
};
