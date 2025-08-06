"use client";

import { useEffect } from "react";
import { useMobileSession } from "@/hooks/use-mobile-session";

interface MobileSessionProviderProps {
  children: React.ReactNode;
}

export const MobileSessionProvider = ({
  children,
}: MobileSessionProviderProps) => {
  const { isInitialized } = useMobileSession();

  // Show loading state while initializing session on mobile
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return <>{children}</>;
};
