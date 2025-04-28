"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

export default function SignUp() {
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
      <div
        id="account_type"
        className="fixed inset-0 flex h-screen w-screen flex-row"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 min-w-screen bg-radial from-zinc-300 to-gray-50 to-60% dark:from-gray-50 dark:to-black"></div>

        {/* Grid */}
        <main
          id="account_type"
          className="relative z-10 flex h-full w-full flex-col gap-[1.5px] bg-transparent"
        >
          {/* SECTION - Top grid */}
          <section className="grid w-full flex-grow grid-cols-3 gap-[1.5px]">
            <div className="rounded bg-gradient-to-t from-gray-50 to-transparent dark:from-black/90 dark:to-transparent"></div>
            <div className="flex items-end justify-end rounded bg-gradient-to-t from-gray-50 to-transparent p-16 dark:from-black/90 dark:to-transparent">
              {/* Progress Steps */}
              <div className="flex w-full items-center justify-center">
                <div className="h-px w-8 bg-linear-to-r from-white to-black transition-all duration-700 dark:from-black dark:to-white"></div>
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className="rounded-full border-black pr-4 transition-all duration-700 dark:border-white"
                  >
                    <Badge className="rounded-full bg-transparent text-black transition-all duration-700 dark:text-white">
                      1
                    </Badge>
                    <span className="text-black transition-all duration-700 dark:text-white">
                      Account type
                    </span>
                  </Badge>
                  <div className="h-px w-8 bg-black/10 transition-all duration-700 dark:bg-white/10"></div>
                </div>
                <div className="flex items-center">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-black/10 text-xs text-black/20 transition-all duration-700 dark:border-white/10 dark:text-white/20">
                    2
                  </div>
                  <div className="h-px w-8 bg-black/10 transition-all duration-700 dark:bg-white/10"></div>
                </div>
                <div className="flex items-center">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-black/10 text-xs text-black/20 transition-all duration-700 dark:border-white/10 dark:text-white/20">
                    3
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded bg-gradient-to-t from-gray-50 to-transparent transition-all duration-700 dark:from-black/90 dark:to-transparent"></div>
          </section>

          {/* SECTION - Center grids */}
          <section className="grid max-h-[500px] max-w-screen shrink grow-0 grid-cols-3 gap-[1.5px] md:flex-grow-[3]">
            <div className="rounded bg-gradient-to-l from-gray-50 to-transparent dark:from-black/90 dark:to-transparent"></div>
            {/* SECTION - Center grid in the middle */}
            <div className="flex flex-col rounded bg-white p-8 md:p-16 dark:bg-black">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-black transition-all duration-700 dark:text-white">
                  Create your account
                </h1>
                <p className="text-black/40 transition-all duration-700 dark:text-white/40">
                  To continue, choose how you would like to register
                </p>
              </div>

              {/* SECTION - Options */}
              <div className="mb-10 space-y-4">
                <div
                  className={`cursor-pointer rounded-lg border p-4 shadow-xs transition-all duration-700 ${
                    selectedOption === "hobby"
                      ? "border-black dark:border-white"
                      : "border-gray-200 hover:border-black/40 dark:border-white/30 dark:hover:border-white/40"
                  }`}
                  onClick={() => setSelectedOption("hobby")}
                >
                  <div className="flex items-center justify-between transition-all duration-700">
                    <div>
                      <h3 className="font-medium text-black transition-all duration-700 dark:text-white">
                        Username & Password
                      </h3>
                      <p className="text-sm text-black/40 transition-all duration-700 dark:text-white/40">
                        Register with a username and a password
                      </p>
                    </div>
                    {selectedOption === "hobby" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-black/4 transition-all duration-700 dark:bg-white/10"
                      >
                        <Check className="h-4 w-4 text-black transition-all duration-700 dark:text-white" />
                      </motion.div>
                    )}
                  </div>
                </div>

                <div
                  className={`cursor-pointer rounded-lg border p-4 shadow-xs transition-all duration-700 ${
                    selectedOption === "pro"
                      ? "border-black dark:border-white"
                      : "border-gray-200 hover:border-black/40 dark:border-white/30 dark:hover:border-white/40"
                  }`}
                  onClick={() => setSelectedOption("pro")}
                >
                  <div className="flex items-center justify-between transition-all duration-700">
                    <div>
                      <h3 className="font-medium text-black transition-all duration-700 dark:text-white">
                        OAuth
                      </h3>
                      <p className="text-sm text-black/40 transition-all duration-700 dark:text-white/40">
                        Register with a provider{" "}
                        <span className="">(Google, Instagram, etc.)</span>
                      </p>
                    </div>
                    {selectedOption === "pro" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-black/4 transition-all duration-700 dark:bg-white/10"
                      >
                        <Check className="h-4 w-4 text-black transition-all duration-700 dark:text-white" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
              {/* !SECTION - Options */}

              <Button className="text-md w-full cursor-pointer rounded-lg bg-black py-6 text-white transition-all duration-500 hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80">
                Continue
              </Button>
            </div>
            <div className="rounded bg-gradient-to-r from-gray-50 to-transparent dark:from-black/90 dark:to-transparent"></div>
          </section>

          {/* SECTION - Bottom grid */}
          <section className="grid w-full flex-grow grid-cols-3 gap-[1.5px]">
            <div className="rounded bg-gradient-to-b from-gray-50 to-transparent dark:from-black/90 dark:to-transparent"></div>
            <div className="rounded bg-gradient-to-b from-gray-50 to-transparent p-8 md:p-16 dark:from-black/90 dark:to-transparent">
              {/* Progress Steps */}
              <div className="flex w-full items-center justify-center opacity-40 transition-all duration-500 hover:opacity-100">
                <div className="h-px w-8 bg-linear-to-r from-white to-black dark:from-gray-800 dark:to-gray-400"></div>
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
                      Already have an account
                    </Link>
                  </Badge>
                </div>
                <div className="h-px w-8 bg-linear-to-l from-white to-black dark:from-gray-800 dark:to-gray-400"></div>
              </div>
            </div>
            <div className="rounded bg-gradient-to-b from-gray-50 to-transparent dark:from-black/90 dark:to-transparent"></div>
          </section>
        </main>
      </div>
    </div>
  );
}
