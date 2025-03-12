"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import EmailInput from "@/components/ui/email-input";
import PasswordInput from "@/components/ui/password-input";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import OtpInput from "@/components/ui/otp-input";

export default function SignInPageV2() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-row items-center justify-center">
      {/* Left side - Document */}
      <div className="relative hidden h-screen w-full bg-sky-100 md:block md:w-2/5 dark:bg-sky-950/30">
        <div className="text-primary p-4 font-light md:p-8">
          <div className="mb-8 text-sm font-medium tracking-wider uppercase md:mb-16">
            Area Clienti
          </div>

          <div className="mt-8 mb-4 ml-4 overflow-x-hidden text-sm md:mt-32 md:ml-16 md:text-base">
            <div className="text-primary mb-6 text-lg font-semibold">
              Contratto di Compravendita
            </div>

            <div className="mt-4 text-sm leading-6 md:mt-8 md:text-base">
              Repertorio n.{" "}
              <span className="bg-primary text-primary px-2">XXXX</span>/
              <span className="bg-primary text-primary px-2">XXXX</span>
              <br />
              <br />
              COMPRAVENDITA
              <br />
              <br />
              REPUBBLICA ITALIANA
              <br />
              <br />
              L&apos;anno{" "}
              <span className="bg-primary text-primary px-4">XXXX</span>, il
              giorno
              <span className="bg-primary text-primary px-2">XX</span> del mese
              di
              <span className="bg-primary text-primary px-4">XXXX</span> in
              <span className="bg-primary text-primary px-6">XXXX</span>, nel
              mio studio in
              <span className="bg-primary text-primary px-8">XXXX</span>.
              <br />
              <br />
              Innanzi a me Dott.{" "}
              <span className="bg-primary text-primary px-8">XXXX</span>, Notaio
              in <span className="bg-primary text-primary px-6">XXXX</span>,
              iscritto presso il Collegio Notarile di
              <span className="bg-primary text-primary px-6">XXXX</span>
              <br />
              <br />
              SONO COMPARSI
              <br />
              <br />
              Il signor{" "}
              <span className="bg-primary text-primary px-8">XXXX</span>, nato a
              <span className="bg-primary text-primary px-6">XXXX</span> il
              <span className="bg-primary text-primary px-4">XXXX</span>
              <br />
              <br />
              E
              <br />
              <br />
              La signora{" "}
              <span className="bg-primary text-primary px-8">XXXX</span>, nata a
              <span className="bg-primary text-primary px-6">XXXX</span> il
              <span className="bg-primary text-primary px-4">XXXX</span>
            </div>

            <div className="border-primary mx-4 my-6 border-t border-dashed md:my-8"></div>

            <div className="text-primary text-xs italic md:text-sm">
              <div>Registrato presso l&apos;Agenzia delle Entrate</div>
              <div>
                Ufficio di{" "}
                <span className="bg-primary text-primary px-4">XXXX</span>
              </div>
              <div>
                il <span className="bg-primary text-primary px-4">XXXX</span>
              </div>
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
              Area Clienti
            </h1>
            <p className="text-description text-sm transition-all duration-700">
              Inserisci il codice OTP inviato al tuo indirizzo email
            </p>
          </div>

          <form className="space-y-6 md:space-y-8">
            <div className="flex flex-col space-y-4 md:space-y-6">
              <OtpInput />
            </div>
            <Link
              href="/auth/sign-in/v2/otp"
              className="mb-8 flex cursor-pointer"
            >
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-button-hover h-10 w-full cursor-pointer rounded-full text-base transition-all duration-700 md:h-12 md:text-lg"
              >
                Accedi
              </Button>
            </Link>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
