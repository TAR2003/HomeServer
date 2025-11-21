import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Allow public access to these routes
  const publicRoutes = ["/api/auth/login", "/api/auth/register", "/api/media"];

  if (publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for authentication on protected API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      // For now, allow all API requests (optional auth)
      // To enable strict auth, uncomment the following lines:
      // return NextResponse.json(
      //   { error: "Unauthorized" },
      //   { status: 401 }
      // );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
