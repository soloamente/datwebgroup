"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import OtpInput from "@/components/ui/otp-input";
import axios from "axios";

export default function OtpVerificationPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate OTP
    if (otp.length !== 5) {
      setError("Inserisci un codice OTP valido");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://sviluppo.datasystemgroup.it/api/verify-otp",
        {
          email,
          otp,
        },
      );

      if (response.status === 200) {
        // Store token securely (consider using more secure storage methods)
        localStorage.setItem("token", response.data.token);

        // Redirect to dashboard
        router.push("/dashboard/clienti");
      } else {
        setError("OTP non valido. Riprova.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Verifica OTP fallita");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await axios.post("https://sviluppo.datasystemgroup.it/api/verify-otp", {
        email,
      });
      // Show success message
      alert("Nuovo OTP inviato!");
    } catch (error) {
      alert("Impossibile inviare un nuovo OTP. Riprova più tardi.");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-row items-center justify-center dark:bg-gray-800">
      {/* Left side - Image */}
      <div className="relative hidden h-screen w-full bg-[#eaeced] md:block md:w-2/5 dark:bg-gray-900">
        <div className="flex h-full items-center justify-center">
          <Image
            src="/Documents-cuate.svg"
            alt="Login Notai"
            width={400}
            height={400}
            className="object-contain"
          />
        </div>
      </div>

      {/* Right side - OTP Form */}
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

          {/* OTP Form */}
          <div className="mb-8 md:mb-10">
            <h1 className="text-primary mb-2 text-3xl font-bold transition-all duration-700 md:text-3xl dark:text-white">
              Verifica OTP
            </h1>
            <p className="text-description text-sm transition-all duration-700">
              Inserisci il codice OTP inviato a <strong>{email}</strong>
            </p>
          </div>

          <form className="space-y-6 md:space-y-8" onSubmit={handleVerifyOtp}>
            <div className="flex flex-col space-y-4 md:space-y-6">
              <OtpInput value={otp} onChange={(value) => setOtp(value)} />
            </div>

            {error && (
              <div className="text-center text-sm text-red-500">{error}</div>
            )}

            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-button-hover h-10 w-full cursor-pointer rounded-full text-base transition-all duration-700 md:h-12 md:text-lg"
              disabled={loading}
            >
              {loading ? "Verificando..." : "Continua"}
            </Button>

            <div className="text-primary flex items-center justify-center gap-2 text-sm">
              <p className="transition-all duration-700">
                Non hai ricevuto il codice?{" "}
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                className="p-0 font-medium text-inherit transition-all duration-700 hover:font-bold hover:underline"
              >
                Reinvia OTP
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
