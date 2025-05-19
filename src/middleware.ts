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
  const isOnAuthRoute = nextUrl.pathname.startsWith("/login");
  const isOnAdminRoute = adminRoutes.includes(nextUrl.pathname);
  const isOnSharerRoute = sharerRoutes.includes(nextUrl.pathname);
  const isOnViewerRoute = viewerRoutes.includes(nextUrl.pathname);

  const isOnOtpPhase = sessionCookie?.value;
  console.log(isOnOtpPhase);

  if (isOnAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login/admin", nextUrl));
  }

  if (isOnSharerRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login/sharer", nextUrl));
  }

  if (isOnViewerRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login/viewer", nextUrl));
  }

  if (isOnAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard/admin", nextUrl));
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
