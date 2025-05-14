import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/change-password",
  "/api/auth",
  "/api/prelogin",
  "/api/verify-otp",
  "/login/admin",
  "/login/clienti",
];

// Define role-based route prefixes
const adminRoutes = ["/dashboard/admin", "/api/admin"];
const sharerRoutes = ["/dashboard/sharer", "/api/sharer"];
const viewerRoutes = ["/dashboard/viewer", "/api/viewer"];

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
}

interface AuthState {
  state: {
    user: User | null;
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if it's an admin route before session check
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  try {
    // Get auth cookie
    const authCookie = request.cookies.get("auth-storage");

    // If no auth cookie exists, redirect to appropriate login page
    if (!authCookie) {
      return NextResponse.redirect(
        new URL(isAdminRoute ? "/login/admin" : "/login/clienti", request.url),
      );
    }

    // Parse the auth cookie
    const authData = JSON.parse(authCookie.value) as AuthState;
    const user = authData?.state?.user;

    // If no user data exists, redirect to appropriate login page
    if (!user) {
      return NextResponse.redirect(
        new URL(isAdminRoute ? "/login/admin" : "/login/clienti", request.url),
      );
    }
  } catch (error) {
    console.error(
      "Middleware error:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.redirect(
      new URL(isAdminRoute ? "/login/admin" : "/login/clienti", request.url),
    );
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
