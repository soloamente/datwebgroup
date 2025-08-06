"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import TokenOtpForm from "./token-otp-form";
import Aurora from "@/components/backgrounds/aurora";
import type useAuthStore from "@/app/api/auth";

type TokenLoginStep = "validating" | "otpInput";

interface TokenLoginRightSideProps {
  step: TokenLoginStep;
  setStep: React.Dispatch<React.SetStateAction<TokenLoginStep>>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onOtpSuccess: (data: { success: boolean; message?: string }) => void;
  authStore: ReturnType<typeof useAuthStore>;
  token: string | null;
}

export default function TokenLoginRightSide({
  step,
  setStep,
  username,
  setUsername,
  error,
  setError,
  isLoading,
  setIsLoading,
  onOtpSuccess,
  authStore,
  token,
}: TokenLoginRightSideProps) {
  const { theme } = useTheme();

  const colorStops =
    theme === "dark"
      ? ["#0763C9", "#A2A8AB", "#0763C9"] // Light colors for dark theme
      : ["#A2A8AB", "#0763C9", "#A2A8AB"]; // Dark colors for light theme

  const renderStepContent = () => {
    switch (step) {
      case "validating":
        return (
          <>
            <div className="mb-8 w-full md:mb-10">
              <h1 className="text-header-login mb-2 w-full text-center text-3xl font-medium transition-all duration-700 md:text-3xl">
                Benvenuto su NotarShareDoc!
              </h1>
              <p className="text-description-login text-center transition-all duration-700 sm:text-sm md:text-sm lg:text-sm">
                Validazione del token di accesso in corso...
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-center py-8">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
              </div>
              {error && (
                <p className="text-center text-sm text-red-500">{error}</p>
              )}
            </div>
          </>
        );
      case "otpInput":
        return (
          <>
            <div className="mb-8 md:mb-10">
              <h1 className="text-header-login mb-2 w-full text-center text-3xl font-medium transition-all duration-700 md:text-3xl">
                Benvenuto {username}
              </h1>
              <p className="text-description-login text-center transition-all duration-700 sm:text-sm md:text-sm lg:text-sm">
                {`Inserisci qui sotto il codice OTP inviato alla tua email.`}
              </p>
            </div>
            <TokenOtpForm
              username={username}
              token={token}
              onSuccess={onOtpSuccess}
            />
          </>
        );
      default:
        return (
          <div>
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="flex h-full w-full flex-col justify-center rounded-2xl px-6 py-8 md:w-3/5 md:px-16 lg:px-24"
    >
      <div className="absolute inset-0 z-0 h-full w-full">
        <Aurora
          colorStops={colorStops}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      <div className="z-10 mx-auto w-full md:w-md lg:max-w-lg">
        <div className="relative h-24 w-24 md:absolute md:top-10 md:right-10 md:h-24 md:w-24">
          <Image
            src="/logo_positivo.png"
            alt="Logo"
            width={100}
            height={100}
            className="mx-auto mb-4"
          />
        </div>

        {renderStepContent()}
      </div>
    </motion.div>
  );
}
