"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import EmailInput from "@/components/ui/email-input";
import PasswordInput from "@/components/ui/password-input";
import Link from "next/link";
import OtpInput from "@/components/ui/otp-input";
import { motion } from "motion/react";

export default function SignInPageV2() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-row items-center justify-center">
      {/* Left side - Document background */}
      <div className="relative hidden h-screen w-full bg-sky-100 md:block md:w-2/5 dark:bg-sky-950/30">
        <div className="text-primary p-4 font-light md:p-8">
          <div className="mb-8 text-sm font-medium tracking-wider uppercase md:mb-16">
            Oulipo
          </div>

          <div className="mt-8 mb-4 ml-4 overflow-x-hidden text-sm md:mt-32 md:ml-64 md:text-base">
            <div>
              Paris, le 4 Février{" "}
              <span className="bg-primary text-primary px-4 md:px-8">XXXX</span>
            </div>

            <div className="text-primary mt-6 mb-3 italic md:mt-10">
              <div>Amitié,</div>
              <div className="ml-12 text-lg md:ml-24 md:text-xl">Paul</div>
            </div>

            <div className="mt-8 md:mt-16">
              Chers{" "}
              <span className="bg-primary text-primary px-6 md:px-12">
                XXXX
              </span>
              ,
            </div>

            <div className="mt-4 text-sm leading-6 md:mt-8 md:text-base">
              La{" "}
              <span className="bg-primary text-primary px-6 md:px-12">XXX</span>{" "}
              réunion de l&apos;Ouvroir aura lieu le
              <br />
              <span className="bg-primary text-primary px-2">XX</span> 17
              février à onze heures chez Marcel{" "}
              <span className="bg-primary text-primary px-6 md:px-12">
                XXXX
              </span>
              <br />
              <span className="bg-primary text-primary px-16 md:px-32">
                XXXX
              </span>
              <br />
              Nous y parlerons du C.N.L. et de la prochaine
              <br />
              semaine Oulipo{" "}
              <span className="bg-primary text-primary px-6 md:px-12">
                XXXX
              </span>
              <br />
              Avignon. Notre ordre du jour comportera nécessairement
              <br />
              la rubrique{" "}
              <span className="text-primary bg-primary px-6 md:px-12">
                XXXX
              </span>{" "}
              pensez-y.
              <br />
              Pour faciliter la tâche d&apos;Isabelle et Marcel,
              <br />
              soyez gentils{" "}
              <span className="bg-primary text-primary px-16 md:px-32">
                XXXX
              </span>
              <br />
              <span className="bg-primary text-primary px-6 md:px-12">
                XXXX
              </span>
            </div>

            <div className="mt-4">Au 17, bien oulipienmement,</div>

            <div className="text-primary mt-4 text-base italic md:mt-6 md:text-lg">
              Paul Fournel
            </div>

            <div className="mt-2">Un secrétaire.</div>
          </div>

          <div className="border-primary mx-4 my-6 border-t border-dashed md:my-8"></div>

          <div className="text-primary ml-8 text-xs italic md:ml-24 md:text-sm">
            <div>
              Georg, <span className="bg-primary">XXXX</span>
            </div>
            <div className="mt-2 flex items-center">
              <div className="mr-2">→</div>
              <div className="flex flex-col gap-1">
                <div>
                  <span className="bg-primary px-4 md:px-8">XXXX</span>{" "}
                  <span className="bg-primary px-5 md:px-10">XXXX</span>{" "}
                  déjeuner:
                  <span className="bg-primary px-2 md:px-4">XX</span>
                </div>
                <div>
                  à <span className="bg-primary px-5 md:px-10">XXXX</span>{" "}
                  oulipo du 17 II{" "}
                  <span className="bg-primary px-1 md:px-2">XX</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 flex justify-end">
        <div className="relative h-32 w-32 md:absolute md:top-10 md:right-10 md:h-20 md:w-20">
          <Image
            src="/logo_positivo.png"
            alt="DataWeb Group Logo"
            width={200}
            height={200}
            className="object-contain"
          />
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

          {/* Login Form */}
          <div className="mb-8 md:mb-10">
            <h1 className="text-primary mb-2 text-2xl font-bold transition-all duration-700 md:text-3xl">
              Accedi al tuo account
            </h1>
            <p className="text-description text-sm transition-all duration-700">
              Inserisci il codice OTP inviato al tuo indirizzo email
            </p>
          </div>

          <form className="space-y-6 md:space-y-8">
            <div className="flex flex-col space-y-4 md:space-y-6">
              <OtpInput />
            </div>

            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-button-hover h-10 w-full rounded-full py-2 text-base transition-all duration-700 md:h-12 md:py-3 md:text-lg"
            >
              Continua
            </Button>

            <div className="text-primary flex items-center justify-center gap-2 text-sm">
              <p className="transition-all duration-700">
                Credenziali errate?{" "}
              </p>
              <Link
                href="/auth/sign-in/v2/sign-in"
                className="p-0 font-medium text-inherit transition-all duration-700 hover:font-bold hover:underline"
              >
                Torna indietro
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
