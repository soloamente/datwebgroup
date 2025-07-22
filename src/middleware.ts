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

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const sessionCookie = req.cookies.get("auth-storage");

  let user: User | null = null;
  if (sessionCookie?.value) {
    try {
      console.log("Raw session cookie value:", sessionCookie.value);
      const parsedData = JSON.parse(sessionCookie.value) as AuthState;
      console.log("Parsed session data:", JSON.stringify(parsedData, null, 2));
      if (parsedData.state.user) {
        user = parsedData.state.user;
        console.log("User found in session:", user);
      } else {
        console.log("No user found in session data");
      }
    } catch (e) {
      console.error("Failed to parse session cookie:", e);
    }
  } else {
    console.log("No auth-storage cookie found");
  }

  const isLoggedIn = !!user;
  const userRole = user?.role;
  const mustChangePassword = user?.must_change_password === 1;
  const { pathname } = nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isChangePasswordPage = pathname.startsWith("/change-password");

  // --- Debugging Logs Start ---
  console.log("--- Middleware Check ---");
  console.log("Path:", pathname);
  console.log("User Role:", userRole);
  console.log("Is Logged In:", isLoggedIn);
  console.log("Must Change Password:", mustChangePassword);
  console.log("All cookies:", req.cookies.getAll());
  // --- Debugging Logs End ---

  if (isLoggedIn && mustChangePassword) {
    if (!isChangePasswordPage) {
      return NextResponse.redirect(new URL("/change-password", nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (isLoggedIn && !mustChangePassword && isChangePasswordPage) {
    const dashboardUrl = getDashboardUrl(userRole);
    return NextResponse.redirect(new URL(dashboardUrl, nextUrl.origin));
  }

  if (isLoggedIn && isAuthPage) {
    const dashboardUrl = getDashboardUrl(userRole);
    return NextResponse.redirect(new URL(dashboardUrl, nextUrl.origin));
  }

  const isProtectedRoute = pathname.startsWith("/dashboard");
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl.origin));
  }

  if (isLoggedIn && isProtectedRoute) {
    const requiredRole = pathname.split("/")[2];
    if (requiredRole && userRole !== requiredRole) {
      const dashboardUrl = getDashboardUrl(userRole);
      return NextResponse.redirect(new URL(dashboardUrl, nextUrl.origin));
    }
  }

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
