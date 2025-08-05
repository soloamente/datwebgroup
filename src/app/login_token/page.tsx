"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Component that uses useSearchParams - needs to be wrapped in Suspense
function LoginTokenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Use useEffect to handle the redirect
  React.useEffect(() => {
    if (token) {
      // Redirect to login page with token as query parameter
      router.replace(`/login?token=${encodeURIComponent(token)}`);
    } else {
      // If no token, redirect to login page
      router.replace("/login");
    }
  }, [token, router]);

  // Show loading while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        <p className="text-muted-foreground">Reindirizzamento in corso...</p>
      </div>
    </div>
  );
}

// Loading fallback component
function LoginTokenLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
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
