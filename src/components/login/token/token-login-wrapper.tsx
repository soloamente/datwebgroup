"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthStore from "@/app/api/auth";
import TokenLoginRightSide from "./token-login-right-side";
import { userService } from "@/app/api/api";

export default function TokenLoginWrapper() {
  const [step, setStep] = useState<"validating" | "otpInput">("validating");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const authStore = useAuthStore();

  // Get token from URL
  const token = searchParams.get("token");

  useEffect(() => {
    if (authStore.isAuthenticated()) {
      if (authStore.user?.must_change_password) {
        router.push("/change-password");
      } else {
        if (authStore.isAdmin()) {
          router.push("/dashboard/admin");
        } else if (authStore.user?.role === "sharer") {
          router.push("/dashboard/sharer");
        } else if (authStore.user?.role === "viewer") {
          router.push("/dashboard/viewer");
        } else {
          router.push("/dashboard/clienti");
        }
      }
    }
  }, [authStore, router]);

  useEffect(() => {
    // If no token, don't proceed
    if (!token) {
      setError("Token non fornito nell'URL");
      return;
    }

    // Validate token and start login process
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await userService.preloginByToken(token);

      if (result.success && result.username) {
        setUsername(result.username);
        setStep("otpInput");
        setError(null);
      } else {
        setError(result.message || "Token non valido");
      }
    } catch (error) {
      setError("Errore durante la validazione del token");
      console.error("Token validation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSuccess = (data: { success: boolean; message?: string }) => {
    if (data.success) {
      // Authentication successful, redirect will be handled by useEffect
      setError(null);
    } else {
      setError(data.message || "Verifica OTP fallita");
    }
  };

  return (
    <div className="bg-login-credentials flex h-screen w-full items-center justify-center gap-2 overflow-hidden p-2">
      <TokenLoginRightSide
        step={step}
        setStep={setStep}
        username={username}
        setUsername={setUsername}
        error={error}
        setError={setError}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onOtpSuccess={handleOtpSuccess}
        authStore={authStore}
        token={token}
      />
    </div>
  );
}
