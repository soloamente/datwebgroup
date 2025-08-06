import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const adminRoutes = ["/dashboard/admin"];
const sharerRoutes = ["/dashboard/sharer"];
const viewerRoutes = ["/dashboard/viewer"];

interface User {
  id: number;
  username: string;
  nominativo: string;
  email: string;
  role: string;
  active: boolean;
  codice_fiscale?: string;
  partita_iva?: string;
  created_at: string;
  updated_at: string;
  must_change_password: number;
}

interface AuthState {
  state: {
    user: User | null;
  };
}

function getDashboardUrl(role?: string): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "sharer":
      return "/dashboard/sharer";
    case "viewer":
      return "/dashboard/viewer";
    default:
      return "/login";
  }
}

function isProtectedRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/change-password") ||
    pathname.startsWith("/profile")
  );
}

function isAuthPage(pathname: string): boolean {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/login_token")
  );
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const sessionCookie = req.cookies.get("auth-storage");

  console.log("=== MIDDLEWARE DEBUG ===");
  console.log("Request URL:", req.url);
  console.log("All cookies:", req.cookies.getAll());
  console.log("Session cookie found:", !!sessionCookie);
  if (sessionCookie) {
    console.log("Session cookie value length:", sessionCookie.value.length);
  }

  let user: User | null = null;
  let isAuthenticated = false;

  // Check for valid session cookie
  if (sessionCookie?.value) {
    try {
      console.log("Raw session cookie value:", sessionCookie.value);
      const parsedData = JSON.parse(sessionCookie.value) as AuthState;
      console.log("Parsed session data:", JSON.stringify(parsedData, null, 2));

      if (parsedData.state.user) {
        user = parsedData.state.user;
        isAuthenticated = true;
        console.log("User found in session:", user);
      } else {
        console.log("No user found in session data");
      }
    } catch (e) {
      console.error("Failed to parse session cookie:", e);
      console.error("Cookie value that failed to parse:", sessionCookie.value);
    }
  } else {
    console.log("No auth-storage cookie found");
  }

  const userRole = user?.role;
  const mustChangePassword = user?.must_change_password === 1;
  const { pathname } = nextUrl;

  const isAuthPageRoute = isAuthPage(pathname);
  const isChangePasswordPage = pathname.startsWith("/change-password");
  const isProtectedRoutePath = isProtectedRoute(pathname);

  // --- Debugging Logs Start ---
  console.log("--- Middleware Check ---");
  console.log("Path:", pathname);
  console.log("User Role:", userRole);
  console.log("Is Authenticated:", isAuthenticated);
  console.log("Must Change Password:", mustChangePassword);
  console.log("Is Auth Page:", isAuthPageRoute);
  console.log("Is Protected Route:", isProtectedRoutePath);
  // --- Debugging Logs End ---

  // Case 1: User is authenticated but must change password
  if (isAuthenticated && mustChangePassword) {
    if (!isChangePasswordPage) {
      console.log("Redirecting to change password page");
      return NextResponse.redirect(new URL("/change-password", nextUrl.origin));
    }
    return NextResponse.next();
  }

  // Case 2: User is authenticated, doesn't need to change password, but is on change password page
  if (isAuthenticated && !mustChangePassword && isChangePasswordPage) {
    const dashboardUrl = getDashboardUrl(userRole);
    console.log("Redirecting to dashboard:", dashboardUrl);
    return NextResponse.redirect(new URL(dashboardUrl, nextUrl.origin));
  }

  // Case 3: User is authenticated and trying to access auth pages
  if (isAuthenticated && isAuthPageRoute) {
    const dashboardUrl = getDashboardUrl(userRole);
    console.log("Redirecting authenticated user to dashboard:", dashboardUrl);
    return NextResponse.redirect(new URL(dashboardUrl, nextUrl.origin));
  }

  // Case 4: User is not authenticated and trying to access protected routes
  if (!isAuthenticated && isProtectedRoutePath) {
    console.log("Redirecting unauthenticated user to login");
    return NextResponse.redirect(new URL("/login", nextUrl.origin));
  }

  // Case 5: User is authenticated and accessing protected routes - check role permissions
  if (isAuthenticated && isProtectedRoutePath) {
    const pathSegments = pathname.split("/");
    const requiredRole = pathSegments[2]; // /dashboard/[role]/...

    if (requiredRole && userRole !== requiredRole) {
      const dashboardUrl = getDashboardUrl(userRole);
      console.log(
        `User role ${userRole} doesn't match required role ${requiredRole}, redirecting to:`,
        dashboardUrl,
      );
      return NextResponse.redirect(new URL(dashboardUrl, nextUrl.origin));
    }
  }

  // Case 6: User is not authenticated and accessing public routes - allow
  if (!isAuthenticated && !isProtectedRoutePath) {
    return NextResponse.next();
  }

  // Case 7: User is authenticated and accessing allowed routes - allow
  if (isAuthenticated && !isAuthPageRoute) {
    console.log(
      "User is authenticated and accessing allowed route - allowing access",
    );
    return NextResponse.next();
  }

  // Default case - allow
  console.log("Default case - allowing access");
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
