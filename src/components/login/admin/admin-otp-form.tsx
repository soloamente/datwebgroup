"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp/input-otp";
import useAuthStore from "@/app/api/auth";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface AdminOtpFormProps {
  email: string;
  username: string;
  password: string;
}

export default function AdminOtpForm({
  email,
  username,
  password,
}: AdminOtpFormProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  // We only use the setter for toast-driven flows; no in-UI error rendering
  const [, setError] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(600); // 10 minutes in seconds
  const [otpResendAvailable, setOtpResendAvailable] = useState(false);

  const router = useRouter();
  const authStore = useAuthStore();

  // Form ref and submission guard to avoid duplicate submits
  const formRef = useRef<HTMLFormElement | null>(null);
  const isSubmittingRef = useRef(false);
  const hasAutoSubmittedRef = useRef(false);

  useEffect(() => {
    startOtpCountdown();
  }, []);

  const handleVerifyOtp = async (e?: React.FormEvent, providedOtp?: string) => {
    if (e) e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (loading || isSubmittingRef.current) return;
    setLoading(true);
    isSubmittingRef.current = true;
    setError("");

    const codeToVerify = (providedOtp ?? otp).trim();

    if (codeToVerify.length !== 5) {
      const message = "Inserisci un codice OTP valido";
      setError(message);
      toast.error(message);
      setLoading(false);
      isSubmittingRef.current = false;
      hasAutoSubmittedRef.current = false;
      return;
    }

    try {
      const result = await authStore.verifyOtp(
        email.trim(),
        codeToVerify,
        username.trim(),
        password,
      );

      if (result.success) {
        console.log("OTP verification successful");
        console.log("Auth store user:", authStore.user);
        console.log("Auth store isAuthenticated:", authStore.isAuthenticated());
        toast.success("Accesso completato con successo");

        // Check session status
        const sessionStatus = authStore.checkSessionStatus();
        console.log("Session status check:", sessionStatus);

        // Wait a moment for state to update
        setTimeout(() => {
          console.log("After timeout - Auth store user:", authStore.user);
          console.log(
            "After timeout - Auth store isAuthenticated:",
            authStore.isAuthenticated(),
          );

          if (authStore.user?.must_change_password === 1) {
            router.push("/change-password");
          } else {
            router.push("/dashboard/admin");
          }
        }, 100);
      } else {
        const message =
          result.message ??
          "Login fallito. Controlla le credenziali e riprova.";
        setError(message);
        toast.error(message);
        // Allow retry on failure
        isSubmittingRef.current = false;
        hasAutoSubmittedRef.current = false;
      }
    } catch {
      setError("Errore durante il login. Riprova.");
      toast.error("Errore durante il login. Riprova.");
      isSubmittingRef.current = false;
      hasAutoSubmittedRef.current = false;
    } finally {
      setLoading(false);
      // Keep hasAutoSubmittedRef as-is on success to avoid re-trigger loops
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await authStore.prelogin(email.trim(), username.trim(), password);
      startOtpCountdown();
      toast.success("Nuovo codice OTP inviato alla tua email");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Errore durante l'invio dell'OTP";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const startOtpCountdown = () => {
    setOtpCountdown(60);
    setOtpResendAvailable(false);

    const countdownInterval = setInterval(() => {
      setOtpCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(countdownInterval);
          setOtpResendAvailable(true);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  };

  // Remove effect-based auto-submit to prevent loops; rely on onComplete

  // Ensure the OTP input is focused when the component mounts
  useEffect(() => {
    const focusInput = () => {
      const el =
        document.querySelector<HTMLInputElement>(
          '[data-slot="input-otp"] input',
        ) ?? document.querySelector('[data-slot="input-otp"]');
      if (el instanceof HTMLElement) {
        el.focus();
      }
    };
    focusInput();
    const id = window.setTimeout(focusInput, 0);
    return () => window.clearTimeout(id);
  }, []);

  const handleOtpComplete = (value: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (loading || isSubmittingRef.current || hasAutoSubmittedRef.current) {
      return;
    }
    hasAutoSubmittedRef.current = true;
    setOtp(value);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handleVerifyOtp(undefined, value);
  };

  return (
    <form ref={formRef} onSubmit={handleVerifyOtp} className="space-y-8">
      <InputOTP
        maxLength={5}
        value={otp}
        onChange={setOtp}
        slotSize="lg"
        autoFocus
        inputMode="numeric"
        autoComplete="one-time-code"
        onComplete={handleOtpComplete}
      >
        <InputOTPGroup className="w-full justify-center">
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
        </InputOTPGroup>
      </InputOTP>

      {/* inline error removed; using toast only */}

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-full">
          <div className="pointer-events-none absolute -inset-1 z-0 animate-pulse rounded-2xl bg-gradient-to-tr from-blue-400/40 via-blue-200/10 to-blue-600/30 blur-sm" />
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-button-hover ring-primary/50 relative z-10 h-12 w-full cursor-pointer rounded-2xl text-white ring-3 transition-all duration-700 md:h-14 md:text-lg"
          >
            {loading ? "Accedendo..." : "Accedi"}
          </Button>
        </div>

        <div className="relative my-8 w-full">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="text-muted-foreground bg-login-credentials rounded-2xl px-2">
              oppure
            </span>
          </div>
        </div>

        <div className="w-full text-sm">
          {otpResendAvailable ? (
            <Button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="bg-secondary-button/80 hover:bg-secondary-button/60 h-12 w-full rounded-2xl text-white transition-all duration-500 ease-in-out md:h-14 md:text-lg"
            >
              Invia nuovo codice OTP
            </Button>
          ) : (
            <Button
              type="button"
              disabled
              className="bg-secondary/80 disabled:bg-secondary text-foreground ring-border/80 disabled:text-foreground h-12 w-full rounded-2xl font-medium ring-1 transition-all duration-500 ease-in-out disabled:opacity-100 md:h-14 md:text-lg"
            >
              Invia nuovo codice tra {Math.floor(otpCountdown / 60)}:
              {(otpCountdown % 60).toString().padStart(2, "0")}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
