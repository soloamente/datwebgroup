"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginTokenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
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
