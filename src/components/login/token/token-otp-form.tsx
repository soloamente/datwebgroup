"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp/input-otp";
import { Separator } from "@/components/ui/separator";
import { userService } from "@/app/api/api";
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
  const [error, setError] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(60); // 1 minute in seconds
  const [otpResendAvailable, setOtpResendAvailable] = useState(false);

  useEffect(() => {
    startOtpCountdown();
  }, []);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (otp.length !== 5) {
      setError("Inserisci un codice OTP valido");
      setLoading(false);
      return;
    }

    try {
      const result = await userService.verifyOtpByToken(username, otp);

      if (result.success) {
        toast.success("Login completato con successo");
        onSuccess({ success: true, message: "Login completato con successo" });
      } else {
        setError(result.message || "Codice OTP non valido");
        onSuccess({
          success: false,
          message: result.message || "Codice OTP non valido",
        });
      }
    } catch (error) {
      setError("Errore durante la verifica del codice OTP");
      onSuccess({
        success: false,
        message: "Errore durante la verifica del codice OTP",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!token) {
      setError("Token non disponibile per il reinvio");
      return;
    }

    try {
      setLoading(true);
      const result = await userService.preloginByToken(token);

      if (result.success) {
        toast.success("Nuovo codice OTP inviato alla tua email");
        startOtpCountdown();
        setError("");
      } else {
        setError(result.message || "Errore durante l'invio del nuovo OTP");
      }
    } catch (error) {
      setError("Errore durante l'invio del nuovo OTP");
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

  return (
    <form onSubmit={handleVerifyOtp} className="space-y-8">
      <InputOTP maxLength={5} value={otp} onChange={setOtp} slotSize="lg">
        <InputOTPGroup className="w-full justify-center">
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
        </InputOTPGroup>
      </InputOTP>

      {error && <p className="text-sm text-red-500">{error}</p>}

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
