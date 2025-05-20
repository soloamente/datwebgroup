"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "motion/react";
import useAuthStore from "@/app/api/auth";
import { useRouter } from "next/navigation";
import ChangePasswordForm from "./change-password-form";

export default function ChangePasswordRightSide() {
  const [loading, setLoading] = useState(false);
  const authStore = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authStore.logout();
      router.push("/login/admin");
    } catch (error) {
      console.error("Errore durante il logout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="from-primary/20 to-login-credentials flex h-full w-full flex-col justify-center rounded-2xl bg-gradient-to-t to-60% px-6 py-8 md:w-3/5 md:px-16 lg:px-24"
    >
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
            Cambia Password
          </h1>
          <p className="text-description text-sm transition-all duration-700">
            Inserisci la tua nuova password
          </p>
        </div>

        <ChangePasswordForm />

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
