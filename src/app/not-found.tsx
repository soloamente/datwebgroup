import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
      return "/dashboard/viewer";
  }
}

export default async function NotFound() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth-storage");

  let user: User | null = null;
  if (sessionCookie?.value) {
    try {
      const parsed = JSON.parse(sessionCookie.value) as AuthState;
      user = parsed?.state?.user ?? null;
    } catch {
      // Ignore malformed cookie; treat as unauthenticated
    }
  }

  if (user) {
    redirect(getDashboardUrl(user.role));
  }

  redirect("/login");
}


