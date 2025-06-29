import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Public paths that don't require authentication
    const publicPaths = ["/login", "/register"];
    const isPublicPath = publicPaths.some(p => path.startsWith(p));

    // If the user is on a public path and authenticated, redirect to their role-specific page
    if (isPublicPath && token) {
      if (token.role === "FARMER") {
        return NextResponse.redirect(new URL("/farmer/dashboard", req.url));
      }
      if (token.role === "DEALER") {
        return NextResponse.redirect(new URL("/dealer/dashboard", req.url));
      }
      if (token.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }

    // If the user is not authenticated and trying to access protected routes, redirect to login
    if (!token && !isPublicPath) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control for authenticated users
    if (token) {
      // Farmer routes
      if (
        path.startsWith("/farmer") &&
        !(
          token.role === "FARMER" ||
          (token.role === "DEALER" && path.startsWith("/farmer/marketplace/"))
        )
      ) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      // Dealer routes
      if (path.startsWith("/dealer") && token.role !== "DEALER") {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      // Admin routes
      if (path.startsWith("/admin") && token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        const publicPaths = ["/login", "/register"];
        
        // Allow access to public paths without authentication
        if (publicPaths.some(p => path.startsWith(p))) {
          return true;
        }

        // Require authentication for all other paths
        return !!token;
      },
    },
  }
);

// Specify which routes to apply middleware to
export const config = {
  matcher: [
    "/farmer/:path*",
    "/dealer/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
}; 