"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import PasswordInput from "@/components/ui/password-input";
import EmailInput from "@/components/ui/email-input";
import Image from "next/image";

export default function HomePage() {
  const [selectedOption, setSelectedOption] = useState("");

  // Handle smooth scrolling when clicking the Continue button
  useEffect(() => {
    // Check if URL has a hash and scroll to that element on initial load
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen min-w-screen flex-row overflow-hidden">
      <div className="fixed inset-0 flex h-screen w-screen flex-row">
        {/* Background gradient */}
        <div className="absolute inset-0 min-w-screen bg-radial from-zinc-300 to-gray-50 to-60% dark:from-gray-50 dark:to-black"></div>

        {/* Grid */}
        <main className="relative z-10 flex h-full w-full flex-col gap-[1.5px] bg-transparent">
          {/* SECTION - Top grid */}
          <section className="flex w-full flex-grow gap-[1.5px]">
            <div className="flex-1 rounded bg-gradient-to-t from-gray-50 to-transparent dark:from-black/80 dark:to-black"></div>
            <div className="flex w-full max-w-[600px] min-w-[400px] items-end justify-end rounded bg-gradient-to-t from-gray-50 to-transparent p-16 dark:from-black/80 dark:to-black">
              <div className="flex w-full items-center justify-center">
                <Image
                  src="/logo_mono.png"
                  alt="Logo"
                  width={100}
                  height={100}
                />
              </div>
            </div>
            <div className="flex-1 rounded bg-gradient-to-t from-gray-50 to-transparent transition-all duration-700 dark:from-black/80 dark:to-black"></div>
          </section>

          {/* SECTION - Center grids */}
          <section className="flex max-h-[500px] max-w-screen shrink grow-0 gap-[1.5px] md:flex-grow-[3]">
            <div className="flex flex-1 shrink items-center justify-center rounded bg-gradient-to-l from-gray-50 to-transparent dark:from-black/85 dark:to-black"></div>
            {/* SECTION - Center grid in the middle */}
            <div className="flex w-full max-w-[600px] min-w-[400px] flex-col justify-center rounded bg-white p-8 sm:min-w-[300px] md:p-16 dark:bg-black">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="mb-10"
              >
                <h1 className="text-2xl font-semibold text-black transition-all duration-700 dark:text-white">
                  Accedi al tuo account
                </h1>
                <p className="text-black/40 transition-all duration-700 dark:text-white/40">
                  Per continuare, inserisci le tue credenziali
                </p>
              </motion.div>

              {/* SECTION - Options */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="mb-10 space-y-6"
              >
                <div>
                  <EmailInput />
                </div>
                <div>
                  <PasswordInput />
                </div>
              </motion.div>
              {/* !SECTION - Options */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                <Link href="/auth/otp">
                  <Button className="text-md w-full cursor-pointer rounded-lg bg-black py-6 text-white transition-all duration-700 hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80">
                    Continua
                  </Button>
                </Link>
              </motion.div>
            </div>
            <div className="flex-1 shrink rounded bg-gradient-to-r from-gray-50 to-transparent dark:from-black/85 dark:to-black"></div>
          </section>

          {/* SECTION - Bottom grid */}
          <section className="flex w-full flex-grow gap-[1.5px]">
            <div className="flex-1 rounded bg-gradient-to-b from-gray-50 to-transparent dark:from-black/80 dark:to-transparent"></div>
            <div className="mb-16 w-full max-w-[600px] min-w-[400px] rounded bg-gradient-to-b from-gray-50 to-transparent p-16 dark:from-black/80 dark:to-black">
              <div className="flex h-full w-full items-center justify-center opacity-20 transition-all duration-700 hover:opacity-100">
                <div className="h-px w-8 bg-linear-to-r from-white to-black dark:from-black dark:to-white"></div>
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className="cursor-pointer rounded-full border-black pr-4 dark:border-white"
                  >
                    <Badge className="rounded-full bg-transparent text-black dark:text-white">
                      ?
                    </Badge>
                    <Link
                      href="/auth/sign-in"
                      className="text-black dark:text-white"
                    >
                      Password dimenticata
                    </Link>
                  </Badge>
                </div>
                <div className="h-px w-8 bg-linear-to-r from-black to-white dark:from-white dark:to-black"></div>
              </div>
            </div>
            <div className="flex-1 rounded bg-gradient-to-b from-gray-50 to-transparent dark:from-black/80 dark:to-transparent"></div>
          </section>
        </main>
      </div>
    </div>
  );
}
