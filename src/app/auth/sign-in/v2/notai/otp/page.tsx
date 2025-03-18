"use client";

import type React from "react";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import PasswordInput from "@/components/ui/password-input";
import EmailInput from "@/components/ui/email-input";
import OtpInput from "@/components/ui/otp-input";

export default function NotaryLoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-row items-center justify-center dark:bg-gray-800">
      {/* Left side - Document */}
      <div className="relative hidden h-screen w-full bg-[#eaeced] md:block md:w-2/5 dark:bg-gray-900">
        <div className="flex h-full items-center justify-center">
          <Image
            src="/Resume folder-cuate.svg"
            alt="Login Notai"
            width={400}
            height={400}
            className="object-contain"
          />
        </div>
      </div>

      {/* Right side - Login form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="bg-background flex w-full flex-col justify-center px-6 py-8 md:w-3/5 md:px-16 lg:px-24 dark:bg-gray-800"
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
            <h1 className="text-primary mb-2 text-2xl font-bold transition-all duration-700 md:text-3xl dark:text-white">
              Area Notai
            </h1>
            <p className="text-description text-sm transition-all duration-700">
              Inserisci le tue credenziali per accedere all&apos;area riservata
            </p>
          </div>

          <form className="space-y-6 md:space-y-8">
            <div className="flex flex-col space-y-4 md:space-y-6">
              <OtpInput />
            </div>
            <Link
              href="/auth/notary/dashboard"
              className="mb-8 flex cursor-pointer"
            >
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-button-hover h-10 w-full cursor-pointer rounded-full text-base transition-all duration-700 md:h-12 md:text-lg"
              >
                Accedi
              </Button>
            </Link>

            <div className="text-primary flex items-center justify-center gap-2 text-sm">
              <p className="transition-all duration-700">
                Password dimenticata?{" "}
              </p>
              <Link
                href="/auth/notary/reset-password"
                className="p-0 font-medium text-inherit transition-all duration-700 hover:font-bold hover:underline"
              >
                Recuperala
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
