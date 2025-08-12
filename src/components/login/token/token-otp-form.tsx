"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp/input-otp";
import { Separator } from "@/components/ui/separator";
import useAuthStore from "@/app/api/auth";
import { toast } from "sonner";

interface TokenOtpFormProps {
  username: string;
  token: string | null;
  onSuccess: (data: { success: boolean; message?: string }) => void;
}

export default function TokenOtpForm({
  username,
  token,
  onSuccess,
}: TokenOtpFormProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setError] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(60); // 1 minute in seconds
  const [otpResendAvailable, setOtpResendAvailable] = useState(false);
  const authStore = useAuthStore();

  // Form ref to programmatically submit when OTP is complete
  const formRef = useRef<HTMLFormElement | null>(null);
  // Guard to prevent duplicate submissions when auto-submitting
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    startOtpCountdown();
  }, []);

  const handleVerifyOtp = useCallback(
    async (e?: React.FormEvent, providedOtp?: string) => {
      if (e) e.preventDefault();
      // Prevent duplicate submissions (auto-submit + manual click/paste)
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
        return;
      }

      try {
        const result = await authStore.verifyOtpByToken(username, codeToVerify);

        if (result.success) {
          toast.success("Login completato con successo");
          onSuccess({
            success: true,
            message: "Login completato con successo",
          });
        } else {
          setError(result.message ?? "Codice OTP non valido");
          onSuccess({
            success: false,
            message: result.message ?? "Codice OTP non valido",
          });
        }
      } catch {
        const message = "Errore durante la verifica del codice OTP";
        setError(message);
        toast.error(message);
        onSuccess({
          success: false,
          message,
        });
      } finally {
        setLoading(false);
        isSubmittingRef.current = false;
      }
    },
    [authStore, loading, onSuccess, otp, username],
  );

  const handleResendOtp = async () => {
    if (!token) {
      setError("Token non disponibile per il reinvio");
      return;
    }

    try {
      setLoading(true);
      const result = await authStore.preloginByToken(token);

      if (result.success) {
        toast.success("Nuovo codice OTP inviato alla tua email");
        startOtpCountdown();
        setError("");
      } else {
        const message =
          result.message ?? "Errore durante l'invio del nuovo OTP";
        setError(message);
        toast.error(message);
      }
    } catch {
      const message = "Errore durante l'invio del nuovo OTP";
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

  // Auto-submit when the OTP reaches the required length
  useEffect(() => {
    if (otp.length === 5 && !loading && !isSubmittingRef.current) {
      // Fallback: call verify directly to avoid timing issues with state updates
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleVerifyOtp(undefined, otp);
    }
    // Reset guard when user deletes a digit (allows re-submit)
    if (otp.length < 5) {
      isSubmittingRef.current = false;
    }
  }, [otp, loading, handleVerifyOtp]);

  // Ensure the OTP input is focused when this form mounts
  useEffect(() => {
    // Try focusing the internal input element created by input-otp
    const focusInput = () => {
      const el =
        document.querySelector('[data-slot="input-otp"] input') ??
        document.querySelector('[data-slot="input-otp"]');
      if (el instanceof HTMLElement) {
        el.focus();
      }
    };
    // Try immediately and after next tick for safety
    focusInput();
    const id = window.setTimeout(focusInput, 0);
    return () => window.clearTimeout(id);
  }, []);

  const handleOtpComplete = (value: string) => {
    if (loading || isSubmittingRef.current) return;
    setOtp(value);
    // Call verify directly to ensure latest value is used
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
              className="bg-secondary/50 hover:bg-secondary/60 border-border h-12 w-full rounded-2xl border text-white transition-all duration-500 ease-in-out md:h-14 md:text-lg"
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
