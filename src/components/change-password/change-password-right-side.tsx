"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "motion/react";
import useAuthStore from "@/app/api/auth";
import { useRouter } from "next/navigation";
import ChangePasswordForm from "./change-password-form";
import Aurora from "../backgrounds/aurora";
import { useTheme } from "next-themes";

export default function ChangePasswordRightSide() {
  const [loading, setLoading] = useState(false);
  const authStore = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authStore.logout();
      router.push("/login");
    } catch (error) {
      console.error("Errore durante il logout:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSuccess = () => {
    // The redirect is now handled in the ChangePasswordForm component
    // This callback can be used for any additional cleanup if needed
    console.log("Password changed successfully");
  };

  const { theme } = useTheme();

  const colorStops =
    theme === "dark"
      ? ["#0763C9", "#A2A8AB", "#0763C9"] // Light colors for dark theme
      : ["#A2A8AB", "#0763C9", "#A2A8AB"]; // Dark colors for light theme

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

        <div className="mb-8 md:mb-10">
          <h1 className="text-header-login mb-2 w-full text-center text-3xl font-medium transition-all duration-700 md:text-3xl">
            Cambia Password
          </h1>
          <p className="text-description-login text-center transition-all duration-700 sm:text-sm md:text-sm lg:text-sm">
            Inserisci la tua nuova password
          </p>
        </div>

        <ChangePasswordForm onSuccess={handlePasswordChangeSuccess} />

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="roudnded-full relative flex justify-center text-xs uppercase">
            <span className="text-muted-foreground bg-login-credentials rounded-2xl px-2">
              o continua con
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            onClick={handleLogout}
            className="bg-secondary hover:bg-secondary/60 border-border h-12 w-full rounded-2xl border text-white transition-all duration-500 ease-in-out md:h-14 md:text-lg"
          >
            Cambia Account
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
