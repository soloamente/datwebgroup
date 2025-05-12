"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AdminLoginForm from "./admin-login-form";
import AdminOtpForm from "./admin-otp-form";
import AdminQrScanner from "./admin-qr-scanner";
import AdminGradientTracing from "./admin-gradient-tracing";

interface AdminLoginRightSideProps {
  step: string;
  loginMode: "credentials" | "qr";
  email: string;
  username: string;
  password: string;
  error: string | null;
  onLoginSuccess: (data: {
    success: boolean;
    email?: string;
    username?: string;
    password?: string;
  }) => void;
  onQrScan: (data: string) => void;
  onQrError: (error: string) => void;
  onLoginModeChange: (mode: "credentials" | "qr") => void;
}

export default function AdminLoginRightSide({
  step,
  loginMode,
  email,
  username,
  password,
  error,
  onLoginSuccess,
  onQrScan,
  onQrError,
  onLoginModeChange,
}: AdminLoginRightSideProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="from-primary/20 to-login-credentials flex h-full w-full flex-col justify-center rounded-2xl bg-gradient-to-t to-60% px-6 py-8 md:w-3/5 md:px-16 lg:px-24"
    >
      <div className="absolute bottom-2">
        <AdminGradientTracing />
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

        <div className="mb-8 md:mb-10">
          <h1 className="text-primary mb-2 text-3xl font-bold transition-all duration-700 md:text-3xl dark:text-white">
            Bentornato Amministratore!
          </h1>

          <p className="text-description transition-all duration-700 sm:text-sm md:text-sm lg:text-sm">
            {step === "login"
              ? "Inserisci username e password per continuare"
              : `Inserisci il codice OTP inviato a ${email.includes("@") ? email : `${username}@datasystemgroup.it`}`}
          </p>
        </div>

        {step === "login" ? (
          <>
            <AdminLoginForm onSuccess={onLoginSuccess} />

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="text-muted-foreground px-2 dark:bg-[#0E151D]">
                  o continua con
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => onLoginModeChange("qr")}
                className="bg-secondary hover:bg-secondary/60 border-border h-12 w-full rounded-2xl border text-white transition-all duration-500 ease-in-out md:h-14 md:text-lg"
              >
                Codice QR
              </Button>
            </div>

            {loginMode === "qr" && (
              <AdminQrScanner onScan={onQrScan} onError={onQrError} />
            )}

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </>
        ) : (
          <AdminOtpForm email={email} username={username} password={password} />
        )}
      </div>
    </motion.div>
  );
}
