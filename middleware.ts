import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect tenant routes
  if (path.startsWith("/tenant") && !path.startsWith("/tenant-login")) {
    // Check for tenant_token in cookies or localStorage (we'll use cookies for middleware)
    const tokenCookie = request.cookies.get("tenant_token");
    
    // If no cookie, check if there's a token in the request (for client-side navigation)
    // For now, we'll redirect to login if no cookie is found
    // The client-side will handle localStorage token
    if (!tokenCookie) {
      // Allow the request to proceed - client-side will handle redirect
      // This is because localStorage is not accessible in middleware
      return NextResponse.next();
    }

    try {
      // Verify the token
      const { payload } = await jwtVerify(
        tokenCookie.value,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );

      // Check if the role is tenant
      if (payload.role !== "tenant") {
        return NextResponse.redirect(new URL("/tenant-login", request.url));
      }

      // Token is valid, allow the request
      return NextResponse.next();
    } catch (error) {
      // Invalid or expired token
      console.error("[Middleware] Token verification failed:", error);
      // Clear the invalid cookie
      const response = NextResponse.redirect(
        new URL("/tenant-login", request.url)
      );
      response.cookies.delete("tenant_token");
      return response;
    }
  }

  // For all other routes, proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all tenant routes except tenant-login
     */
    "/tenant/:path*",
  ],
};


