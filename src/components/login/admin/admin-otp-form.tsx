"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import OtpInput from "@/components/ui/otp-input";
import useAuthStore from "@/app/api/auth";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

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
  const [error, setError] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(600); // 10 minutes in seconds
  const [otpResendAvailable, setOtpResendAvailable] = useState(false);

  const router = useRouter();
  const authStore = useAuthStore();

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
      const result = await authStore.verifyOtp(
        email.trim(),
        otp.trim(),
        username.trim(),
        password,
      );

      if (result.success) {
        if (authStore.user?.must_change_password) {
          router.push("/change-password");
        } else {
          router.push("/dashboard/admin");
        }
      } else {
        setError(
          result.message ??
            "Login fallito. Controlla le credenziali e riprova.",
        );
      }
    } catch (error) {
      setError("Errore durante il login. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await authStore.prelogin(email.trim(), username.trim(), password);
      startOtpCountdown();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Errore durante l'invio dell'OTP",
      );
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
      <OtpInput value={otp} onChange={setOtp} />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-col items-center gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-button-hover h-12 w-full cursor-pointer rounded-2xl text-white transition-all duration-700 md:h-14 md:text-lg"
        >
          {loading ? "Accedendo..." : "Accedi"}
        </Button>

        <div className="relative my-8 w-full">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="text-muted-foreground px-2 dark:bg-[#0E151D]">
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
              className="bg-secondary hover:bg-secondary/60 border-border h-12 w-full rounded-2xl border text-white transition-all duration-500 ease-in-out md:h-14 md:text-lg"
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
