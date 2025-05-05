"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import AdminLoginForm from "./admin-login-form";
import AdminOtpForm from "./admin-otp-form";
import useAuthStore from "@/app/api/auth";
import { useRouter } from "next/navigation";

export default function AdminLoginWrapper() {
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
      console.log("Current step after change:", step); // This will still show "login" due to state update timing
    } else {
      console.log("Invalid login data, not changing step");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center gap-2 overflow-hidden p-2">
      <div className="relative hidden h-full w-full rounded-2xl bg-[#eaeced] md:block md:w-2/5 dark:bg-gray-900">
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
        className="flex h-full w-full flex-col justify-center rounded-2xl px-6 py-8 md:w-3/5 md:px-16 lg:px-24 dark:bg-gray-800"
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
              Bentornato Amministratore
            </h1>

            <p className="text-description text-sm transition-all duration-700">
              {step === "login"
                ? "Inserisci le tue credenziali per accedere"
                : `Inserisci il codice OTP inviato a ${email.includes("@") ? email : `${username}@datasystemgroup.it`}`}
            </p>
          </div>

          {step === "login" ? (
            <AdminLoginForm onSuccess={handleLoginSuccess} />
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
