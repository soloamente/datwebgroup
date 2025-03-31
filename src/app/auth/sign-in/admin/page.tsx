"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { motion } from "motion/react";
import EmailInput from "@/components/ui/email-input";
import OtpInput from "@/components/ui/otp-input";
import UsernameInput from "@/components/ui/username-input";
import PasswordInput from "@/components/ui/password-input";
import { create } from "zustand";
import useAuthStore from "../auth";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(600); // 10 minutes in seconds
  const [otpResendAvailable, setOtpResendAvailable] = useState(false);

  const router = useRouter();
  const authStore = useAuthStore();

  useEffect(() => {
    if (authStore.isAuthenticated()) {
      if (!authStore.isAdmin()) {
        router.push("/auth/sign-in/clienti");
        return;
      }

      if (authStore.user?.must_change_password) {
        router.push("/change-password");
      } else {
        router.push("/dashboard/clienti");
      }
    }
  }, [authStore, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authStore.login(
        username.trim(),
        email.trim(),
        password,
      );

      if (result?.requiresOtp) {
        console.log("OTP required, switching to OTP step");
        setStep("otp");
        startOtpCountdown();
        return;
      }

      if (authStore.isAuthenticated()) {
        if (authStore.user?.must_change_password) {
          router.push("/change-password");
        } else {
          router.push("/dashboard/clienti");
        }
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Errore durante il login",
      );
    } finally {
      setLoading(false);
    }
  };

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
      await authStore.verifyOtp(username, email, password, otp);

      if (authStore.isAuthenticated()) {
        if (authStore.user?.must_change_password) {
          router.push("/change-password");
        } else {
          router.push("/dashboard/clienti");
        }
      } else {
        setError("Login fallito. Controlla le credenziali e riprova.");
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
      await authStore.login(username.trim(), email.trim(), password);
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
    <div className="flex min-h-screen w-full flex-row items-center justify-center dark:bg-gray-800">
      <div className="relative hidden h-screen w-full bg-[#eaeced] md:block md:w-2/5 dark:bg-gray-900">
        <div className="flex h-full items-center justify-center">
          <Image
            src="/Admin-cuate.svg"
            alt="Login Notai"
            width={400}
            height={400}
            className="object-contain"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="bg-background flex w-full flex-col justify-center px-6 py-8 md:w-3/5 md:px-16 lg:px-24 dark:bg-gray-800"
      >
        <div className="mx-auto w-full max-w-md">
          <div className="relative h-24 w-24 md:absolute md:top-10 md:right-10 md:h-24 md:w-24">
            <Image
              src="/logo_positivo.png"
              alt="Logo"
              width={100}
              height={100}
              className="mx-auto mb-4"
            />
          </div>

          <div className="mb-8 md:mb-10">
            <h1 className="text-primary mb-2 text-3xl font-bold transition-all duration-700 md:text-3xl dark:text-white">
              Area Amministratori
            </h1>

            <p className="text-description text-sm transition-all duration-700">
              {step === "login"
                ? "Inserisci la tua email per accedere"
                : `Inserisci il codice OTP inviato a ${email}`}
            </p>
          </div>

          {step === "login" ? (
            <form onSubmit={handleLogin} className="space-y-6 md:space-y-8">
              <div className="flex flex-col space-y-4 md:space-y-6">
                <UsernameInput
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <EmailInput
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-center text-sm text-red-500">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground hover:bg-button-hover h-10 w-full cursor-pointer rounded-full text-base transition-all duration-700 md:h-12 md:text-lg"
              >
                {loading ? "Accedendo..." : "Continua"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4">
              <OtpInput value={otp} onChange={setOtp} />

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex items-center justify-between">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-primary-foreground hover:bg-button-hover h-10 w-2/3 cursor-pointer rounded-full text-base transition-all duration-700 md:h-12 md:text-lg"
                >
                  {loading ? "Verificando..." : "Conferma"}
                </Button>

                <div className="text-sm">
                  {otpResendAvailable ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-blue-600 hover:underline disabled:opacity-50"
                    >
                      Invia nuovo OTP
                    </button>
                  ) : (
                    <span>
                      Riinvia tra {Math.floor(otpCountdown / 60)}:
                      {(otpCountdown % 60).toString().padStart(2, "0")}
                    </span>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
