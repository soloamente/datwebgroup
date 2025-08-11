/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthStore from "@/app/api/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface TokenLoginHandlerProps {
  onComplete?: () => void;
}

export default function TokenLoginHandler({
  onComplete,
}: TokenLoginHandlerProps) {
  const [step, setStep] = useState<"validating" | "otp" | "error">(
    "validating",
  );
  const [username, setUsername] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const authStore = useAuthStore();

  // Get token from URL
  const token = searchParams.get("token");

  useEffect(() => {
    // If no token, don't proceed
    if (!token) {
      setStep("error");
      setError("Token non fornito nell'URL");
      toast.error("Token non fornito nell'URL");
      return;
    }

    // If already authenticated, redirect
    if (authStore.isAuthenticated()) {
      handleSuccessfulAuth();
      return;
    }

    // Validate token and start login process
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await authStore.preloginByToken(token);

      if (result.success && result.username) {
        setUsername(result.username);
        setStep("otp");
        toast.success("Codice OTP inviato alla tua email");
      } else {
        setStep("error");
        setError(result.message || "Token non valido");
        toast.error(result.message || "Token non valido");
      }
    } catch (error) {
      setStep("error");
      setError("Errore durante la validazione del token");
      toast.error("Errore durante la validazione del token");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError("Inserisci il codice OTP");
      toast.error("Inserisci il codice OTP");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authStore.verifyOtpByToken(username, otp);

      if (result.success) {
        toast.success("Login completato con successo");
        handleSuccessfulAuth();
      } else {
        setError(result.message || "Codice OTP non valido");
        toast.error(result.message || "Codice OTP non valido");
      }
    } catch (error) {
      setError("Errore durante la verifica del codice OTP");
      toast.error("Errore durante la verifica del codice OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessfulAuth = () => {
    // Redirect based on user role
    if (authStore.user?.must_change_password) {
      router.push("/change-password");
    } else if (authStore.isAdmin()) {
      router.push("/dashboard/admin");
    } else if (authStore.user?.role === "sharer") {
      router.push("/dashboard/sharer");
    } else if (authStore.user?.role === "viewer") {
      router.push("/dashboard/viewer");
    } else {
      router.push("/dashboard/clienti");
    }

    // Call completion callback if provided
    if (onComplete) {
      onComplete();
    }
  };

  const handleRetry = () => {
    setStep("validating");
    setError(null);
    setOtp("");
    validateToken();
  };

  const handleBackToLogin = () => {
    // Remove token from URL and redirect to login
    const url = new URL(window.location.href);
    url.searchParams.delete("token");
    router.push(url.pathname);
  };

  if (step === "validating") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Validazione Token</CardTitle>
            <CardDescription>
              Verifica del token di accesso in corso...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">
              Errore di Accesso
            </CardTitle>
            <CardDescription>
              {error || "Si è verificato un errore durante l'accesso"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button onClick={handleRetry} disabled={isLoading}>
                Riprova
              </Button>
              <Button variant="outline" onClick={handleBackToLogin}>
                Torna al Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verifica Codice OTP</CardTitle>
            <CardDescription>
              Inserisci il codice OTP inviato alla tua email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Codice OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Inserisci il codice OTP"
                  maxLength={5}
                  disabled={isLoading}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              {/* inline error removed; using toast only */}

              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={isLoading || !otp.trim()}>
                  {isLoading ? "Verifica in corso..." : "Verifica OTP"}
                </Button>
                <Button variant="outline" onClick={handleBackToLogin}>
                  Torna al Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
