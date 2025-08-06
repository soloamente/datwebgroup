import { useEffect, useState, useCallback } from "react";
import useAuthStore from "@/app/api/auth";

// Helper function to detect mobile devices with proper type checking
const isMobileDevice = (): boolean => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent;
  if (!userAgent) return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent,
  );
};

export const useMobileSession = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const authStore = useAuthStore();

  // Function to check session validity
  const checkSessionValidity = useCallback(() => {
    if (isMobileDevice()) {
      const authenticated = authStore.isAuthenticated();
      if (!authenticated) {
        console.log("Session lost on mobile, attempting to restore...");
        const restored = authStore.verifyAndRestoreSession();
        if (restored) {
          console.log("Session successfully restored on mobile");
        } else {
          console.log("Failed to restore session on mobile");
        }
      }
    }
  }, [authStore]);

  useEffect(() => {
    // Always set initialized to true immediately
    setIsInitialized(true);

    // Check if we're on a mobile device
    if (isMobileDevice()) {
      console.log("Mobile device detected, checking session persistence...");

      // Try to restore session from cookies
      const sessionRestored = authStore.verifyAndRestoreSession();

      if (sessionRestored) {
        console.log("Session successfully restored on mobile device");
      } else {
        console.log("No valid session found on mobile device");
      }

      // Set up periodic session checks for mobile devices
      const interval = setInterval(checkSessionValidity, 30000); // Check every 30 seconds

      // Handle visibility change (when app comes back to foreground)
      const handleVisibilityChange = () => {
        if (!document.hidden && !authStore.isAuthenticated()) {
          console.log("App became visible, checking session...");
          checkSessionValidity();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        clearInterval(interval);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      };
    }
  }, []); // Remove dependencies to prevent infinite re-renders

  // Additional check for session validity on mobile
  useEffect(() => {
    if (!isInitialized) return;

    if (isMobileDevice() && authStore.isAuthenticated() && authStore.user) {
      // Log session info for debugging
      console.log("Mobile session active:", {
        userId: authStore.user.id,
        username: authStore.user.username,
        role: authStore.user.role,
        timestamp: new Date().toISOString(),
      });
    }
  }, [isInitialized, authStore]);

  return {
    isInitialized,
    isAuthenticated: authStore.isAuthenticated(),
    user: authStore.user,
  };
};
