"use client";

import { useSearchParams } from "next/navigation";
import AdminLoginWrapper from "@/components/login/admin/admin-login-wrapper";
import TokenLoginHandler from "@/components/login/token-login-handler";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // If there's a token in the URL, use the token login handler
  if (token) {
    return <TokenLoginHandler />;
  }

  // Otherwise, show the normal login form
  return <AdminLoginWrapper />;
}
