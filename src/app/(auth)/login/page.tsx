"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AdminLoginWrapper from "@/components/login/admin/admin-login-wrapper";
import TokenLoginHandler from "@/components/login/token-login-handler";

// Component that uses useSearchParams - needs to be wrapped in Suspense
function LoginContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // If there's a token in the URL, use the token login handler
  if (token) {
    return <TokenLoginHandler />;
  }

  // Otherwise, show the normal login form
  return <AdminLoginWrapper />;
}

// Loading fallback component
function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}
