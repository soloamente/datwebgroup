"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, LockKeyhole } from "lucide-react";
import EmailInput from "@/components/ui/email-input";
import PasswordInput from "@/components/ui/password-input";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-row items-center justify-center">
      {/* Left side - Admin Panel */}
      <div className="relative hidden h-screen w-full bg-slate-100 md:block md:w-2/5 dark:bg-slate-900/30">
        <div className="text-primary p-4 font-light md:p-8">
          <div className="mb-8 text-sm font-medium tracking-wider uppercase md:mb-16">
            Area Amministratori
          </div>

          <div className="mt-8 mb-4 ml-4 overflow-x-hidden text-sm md:mt-32 md:ml-16 md:text-base">
            <div className="text-primary mb-6 text-lg font-semibold">
              Pannello di Controllo
            </div>

            <div className="mt-4 text-sm leading-6 md:mt-8 md:text-base">
              <div className="mb-4 flex items-center gap-2">
                <Shield className="text-primary h-5 w-5" />
                <span>Gestione Utenti</span>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <LockKeyhole className="text-primary h-5 w-5" />
                <span>Controllo Accessi</span>
              </div>

              <div className="text-muted-foreground pl-7">
                • Visualizza log accessi
                <br />• Modifica permessi
                <br />• Gestione ruoli
                <br />• Reportistica
                <br />• Configurazione sistema
              </div>
            </div>

            <div className="border-primary mx-4 my-6 border-t border-dashed md:my-8"></div>

            <div className="text-primary text-xs italic md:text-sm">
              <div>Accesso riservato al personale autorizzato</div>
              <div>DataWeb Group - Area Amministratori</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="bg-background flex w-full flex-col justify-center px-6 py-8 md:w-3/5 md:px-16 lg:px-24"
      >
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="md:jus mb-8 flex sm:justify-start">
            <div className="relative h-24 w-24 md:absolute md:top-10 md:right-10 md:h-24 md:w-24">
              <Image
                src="/logo_positivo.png"
                alt="DataWeb Group Logo"
                width={500}
                height={500}
                className="object-contain"
              />
            </div>
          </div>

          {/* Login Form */}
          <div className="mb-8 md:mb-10">
            <h1 className="text-primary mb-2 text-3xl font-bold transition-all duration-700 md:text-3xl">
              Area Amministratori
            </h1>
            <p className="text-description text-sm transition-all duration-700">
              Inserisci le tue credenziali per accedere al pannello di
              amministrazione
            </p>
          </div>

          <form className="space-y-6 md:space-y-8">
            <div className="flex flex-col space-y-4 md:space-y-6">
              {/* Email Input */}
              <EmailInput />

              {/* Password Input */}
              <PasswordInput />
            </div>
            <Link href="/admin/dashboard" className="mb-8 flex cursor-pointer">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-full cursor-pointer rounded-full text-base transition-all duration-700 md:h-12 md:text-lg"
              >
                Accedi
              </Button>
            </Link>

            <div className="text-primary flex items-center justify-center gap-2 text-sm">
              <p className="transition-all duration-700">
                Password dimenticata?{" "}
              </p>
              <Link
                href="/admin/reset-password"
                className="p-0 font-medium text-inherit transition-all duration-700 hover:font-bold hover:underline"
              >
                Recuperala
              </Link>
            </div>
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-background text-muted-foreground relative z-10 px-2">
                Oppure
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full cursor-pointer rounded-full text-base transition-all duration-700 md:h-12 md:text-lg"
            >
              Accedi con autenticazione a due fattori
            </Button>
          </form>

          <div className="text-muted-foreground mt-8 text-center text-sm">
            <Link
              href="/"
              className="hover:text-primary flex items-center justify-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Torna alla home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
