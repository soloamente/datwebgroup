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

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const sessionCookie = req.cookies.get("auth-storage");

  const res = NextResponse.next();

  let userData: AuthState | null = null;
  if (sessionCookie?.value) {
    try {
      userData = JSON.parse(sessionCookie.value) as AuthState;
    } catch (e) {
      console.error("Failed to parse session cookie:", e);
    }
  }

  const isLoggedIn = !!sessionCookie && userData?.state?.user !== null;
  const userRole = userData?.state?.user?.role;
  const isOnAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    (nextUrl.pathname === "/change-password" &&
      userData?.state?.user?.must_change_password !== 1);
  const isOnAdminRoute = nextUrl.pathname.startsWith("/dashboard/admin");
  const isOnSharerRoute = nextUrl.pathname.startsWith("/dashboard/sharer");
  const isOnViewerRoute = nextUrl.pathname.startsWith("/dashboard/viewer");
  const isOnChangePasswordRoute =
    nextUrl.pathname.startsWith("/change-password");
  const mustChangePassword = userData?.state?.user?.must_change_password;

  const isOnOtpPhase = sessionCookie?.value;
  console.log("Current session cookie value for isOnOtpPhase:", isOnOtpPhase);

  // --- Debugging Logs Start ---
  console.log(
    "Middleware userData:",
    JSON.stringify(userData?.state?.user, null, 2),
  );
  console.log("Middleware isLoggedIn:", isLoggedIn);
  console.log("Middleware mustChangePassword value:", mustChangePassword);
  console.log("Middleware mustChangePassword type:", typeof mustChangePassword);
  // --- Debugging Logs End ---

  // if (isLoggedIn && mustChangePassword === 0) {
  //   if (nextUrl.pathname === "/change-password") {
  //     console.log(
  //       "User must change password, redirecting to /login/change-password",
  //     );
  //     return NextResponse.redirect(new URL("/dashboard/admin", nextUrl));
  //   }
  // }

  if (!isLoggedIn && isOnChangePasswordRoute) {
    return NextResponse.redirect(new URL("/login/admin", nextUrl));
  }

  // Handle must_change_password redirect first
  if (isLoggedIn && mustChangePassword === 1) {
    if (nextUrl.pathname !== "/change-password") {
      console.log(
        "User must change password, redirecting to /login/change-password",
      );
      return NextResponse.redirect(new URL("/change-password", nextUrl));
    }
    // If user must change password AND is already on the change password page, allow them to stay.
    console.log(
      "User must change password and is on /login/change-password page. Allowing to stay.",
    );
    return res; // Allow request to proceed to /login/change-password
  }

  // --- End of must_change_password specific logic ---

  if (isOnAdminRoute && (!isLoggedIn || userRole !== "admin")) {
    return NextResponse.redirect(new URL("/login/admin", nextUrl));
  }

  if (isOnSharerRoute && (!isLoggedIn || userRole !== "sharer")) {
    return NextResponse.redirect(new URL("/login/sharer", nextUrl));
  }

  if (isOnViewerRoute && (!isLoggedIn || userRole !== "viewer")) {
    return NextResponse.redirect(new URL("/login/viewer", nextUrl));
  }

  if (isOnAuthRoute && isLoggedIn) {
    // At this point, if mustChangePassword was 1, we've already handled it.
    // So, if they are on an auth route and logged in (and don't need to change password),
    // redirect to their dashboard.
    console.log(
      "User is logged in and on an auth route (and doesn't need to change password), redirecting to dashboard.",
    );
    // Redirect to appropriate dashboard based on role
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/dashboard/admin", nextUrl));
    } else if (userRole === "sharer") {
      return NextResponse.redirect(new URL("/dashboard/sharer", nextUrl));
    } else if (userRole === "viewer") {
      return NextResponse.redirect(new URL("/dashboard/viewer", nextUrl));
    }
  }

  return res;
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
