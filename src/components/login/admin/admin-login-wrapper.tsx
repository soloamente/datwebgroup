"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import AdminLoginForm from "./admin-login-form";
import AdminOtpForm from "./admin-otp-form";
import AdminQrScanner from "./admin-qr-scanner";
import useAuthStore from "@/app/api/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function AdminLoginWrapper() {
  const [step, setStep] = useState("login");
  const [loginMode, setLoginMode] = useState<"credentials" | "qr">(
    "credentials",
  );
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

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
        router.push("/dashboard/admin");
      }
    }
  }, [authStore, router]);

  const handleLoginSuccess = (data: {
    success: boolean;
    email?: string;
    username?: string;
    password?: string;
  }) => {
    console.log("Login success data:", data);
    if (data.success && data.email && data.username && data.password) {
      console.log("Setting state values and changing to OTP step");
      console.log("Email value being set:", data.email);
      console.log("Username value being set:", data.username);
      setEmail(data.email);
      setUsername(data.username);
      setPassword(data.password);
      setStep("otp");
      console.log("Current step after change:", step);
    } else {
      console.log("Invalid login data, not changing step");
    }
  };

  const handleQrScan = async (data: string) => {
    try {
      // Here you would typically validate and process the QR code data
      // For now, we'll just show an error if the data is invalid
      if (!data) {
        setError("Invalid QR code data");
        return;
      }

      // Process the QR code data and attempt login
      // This is a placeholder - you'll need to implement the actual login logic
      const loginData = {
        success: true,
        email: "admin@example.com", // Replace with actual data from QR code
        username: "admin", // Replace with actual data from QR code
        password: "password", // Replace with actual data from QR code
      };

      handleLoginSuccess(loginData);
    } catch (err) {
      setError("Failed to process QR code login");
    }
  };

  const handleQrError = (error: string) => {
    setError(error);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center gap-2 overflow-hidden p-2">
      <div className="bg-login-credentials relative hidden h-full w-full rounded-2xl md:block md:w-2/5">
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
        className="bg-login-credentials flex h-full w-full flex-col justify-center rounded-2xl px-6 py-8 md:w-3/5 md:px-16 lg:px-24"
      >
        <div className="mx-auto w-full max-w-md lg:max-w-xl">
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

            <p className="text-description text-sm transition-all duration-700 lg:text-base">
              {step === "login"
                ? "Inserisci username e password per continuare"
                : `Inserisci il codice OTP inviato a ${email.includes("@") ? email : `${username}@datasystemgroup.it`}`}
            </p>
          </div>

          {step === "login" ? (
            <>
              <AdminLoginForm onSuccess={handleLoginSuccess} />

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-login-credentials text-muted-foreground px-2">
                    o continua con
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <Button
                  onClick={() => setLoginMode("qr")}
                  className="bg-secondary hover:bg-secondary/60 border-border h-10 w-full rounded-2xl border text-white transition-all duration-500 ease-in-out md:h-12 md:text-lg lg:h-14"
                >
                  Codice QR
                </Button>
              </div>

              {loginMode === "qr" && (
                <AdminQrScanner onScan={handleQrScan} onError={handleQrError} />
              )}

              {error && (
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </>
          ) : (
            <AdminOtpForm
              email={email}
              username={username}
              password={password}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
