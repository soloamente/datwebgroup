"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TokenLoginWrapper from "@/components/login/token/token-login-wrapper";

// Component that uses useSearchParams - needs to be wrapped in Suspense
function LoginTokenContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // If there's a token in the URL, use the token login handler
  if (token) {
    return <TokenLoginWrapper />;
  }

  // Otherwise, redirect to login page
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        <p className="text-muted-foreground">Reindirizzamento al login...</p>
      </div>
    </div>
  );
}

// Loading fallback component
function LoginTokenLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
    </div>
  );
}

export default function LoginTokenPage() {
  return (
    <Suspense fallback={<LoginTokenLoading />}>
      <LoginTokenContent />
    </Suspense>
  );
}
