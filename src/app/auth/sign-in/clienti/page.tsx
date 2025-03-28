"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { motion } from "motion/react";
import UsernameInput from "@/components/ui/username-input";
import EmailInput from "@/components/ui/email-input";
import PasswordInput from "@/components/ui/password-input";
import OtpInput from "@/components/ui/otp-input";

export default function LoginOtpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(600); // 10 minutes in seconds
  const [otpResendAvailable, setOtpResendAvailable] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!username) {
      setError("L'username è obbligatorio");
      setLoading(false);
      return;
    }

    if (!email) {
      setError("Email è obbligatoria");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("La password è obbligatoria");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://sviluppo.datasystemgroup.it/api/prelogin",
        { username, email, password },
      );

      if (response.status === 200) {
        // Start OTP countdown
        startOtpCountdown();
        setStep("otp");
      } else {
        setError("Credenziali non valide. Riprova.");
      }
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            setError("Credenziali errate");
            break;
          case 403:
            setError("Account disattivato");
            break;
          default:
            setError("Errore durante l'accesso");
        }
      } else {
        setError("Errore di connessione");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
          password,
          username,
          otp,
        },
      );

      if (response.status === 200) {
        // Check if password change is required
        if (response.data.must_change_password) {
          window.location.href = "/change-password";
        } else {
          window.location.href = "/dashboard/clienti";
        }
      } else {
        setError("OTP non valido. Riprova.");
      }
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            setError("OTP non valido o scaduto");
            break;
          case 403:
            setError("Accesso non autorizzato");
            break;
          default:
            setError("Verifica OTP fallita");
        }
      } else {
        setError("Errore di connessione");
      }
    } finally {
      setLoading(false);
    }
  };

  const startOtpCountdown = () => {
    setOtpCountdown(600);
    setOtpResendAvailable(false);

    const countdownInterval = setInterval(() => {
      setOtpCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(countdownInterval);
          setOtpResendAvailable(true);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (!otpResendAvailable) return;

    try {
      await axios.post("https://sviluppo.datasystemgroup.it/api/prelogin", {
        username,
        email,
        password,
      });

      startOtpCountdown();
      setError("");
    } catch (error) {
      setError("Impossibile inviare nuovamente l'OTP");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-row items-center justify-center dark:bg-gray-800">
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="bg-background flex w-full flex-col justify-center px-6 py-8 md:w-3/5 md:px-16 lg:px-24 dark:bg-gray-800"
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
              Area Clienti
            </h1>

            <p className="text-description text-sm transition-all duration-700">
              {step === "login"
                ? "Inserisci la tua email per accedere"
                : `Inserisci il codice OTP inviato a ${email}`}
            </p>
          </div>

          {step === "login" ? (
            <form onSubmit={handleLogin} className="space-y-6 md:space-y-8">
              <div className="flex flex-col space-y-4 md:space-y-6">
                <UsernameInput
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <EmailInput
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-center text-sm text-red-500">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground hover:bg-button-hover h-10 w-full cursor-pointer rounded-full text-base transition-all duration-700 md:h-12 md:text-lg"
              >
                {loading ? "Accedendo..." : "Continua"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4">
              <OtpInput value={otp} onChange={setOtp} />

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex items-center justify-between">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-primary-foreground hover:bg-button-hover h-10 w-2/3 cursor-pointer rounded-full text-base transition-all duration-700 md:h-12 md:text-lg"
                >
                  {loading ? "Verificando..." : "Conferma"}
                </Button>

                <div className="text-sm">
                  {otpResendAvailable ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-blue-600 hover:underline"
                    >
                      Invia nuovo OTP
                    </button>
                  ) : (
                    <span>
                      Riinvia tra {Math.floor(otpCountdown / 60)}:
                      {(otpCountdown % 60).toString().padStart(2, "0")}
                    </span>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
