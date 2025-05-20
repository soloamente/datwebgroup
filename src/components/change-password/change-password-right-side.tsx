"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { userService } from "@/app/api/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import PasswordInput from "@/components/login/password-input";
import { motion } from "motion/react";

export default function ChangePasswordRightSide() {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRules = [
    "Essere lunga almeno 8 caratteri.",
    "Contenere almeno una lettera maiuscola.",
    "Contenere almeno un carattere speciale.",
    "Contenere almeno un numero.",
  ];

  const validatePassword = (passwordToValidate: string) => {
    if (passwordToValidate.length < 8) {
      return "La password deve essere lunga almeno 8 caratteri.";
    }
    if (!/[A-Z]/.test(passwordToValidate)) {
      return "La password deve contenere almeno una lettera maiuscola.";
    }
    // eslint-disable-next-line no-useless-escape
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(passwordToValidate)) {
      return "La password deve contenere almeno un carattere speciale.";
    }
    if (!/\d/.test(passwordToValidate)) {
      return "La password deve contenere almeno un numero.";
    }
    return null;
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("handlePasswordChange function called");
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError("Le password non coincidono.");
      toast.error("Le password non coincidono.");
      return;
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setError(passwordValidationError);
      toast.error(passwordValidationError);
      return;
    }

    setIsLoading(true);

    try {
      console.log(
        "Attempting to change password. Sending the following data to the API:",
      );
      console.log("Password:", password);
      console.log("Password Confirmation:", passwordConfirmation);

      await userService.changePassword({
        password,
        password_confirmation: passwordConfirmation,
      });

      toast.success("Password cambiata con successo.");
      // Middleware will handle redirection
    } catch (err) {
      console.error("Failed to change password:", err);

      // Type assertion for better error handling
      let errorMessage =
        "Si è verificato un errore durante il cambio password.";
      if (err && typeof err === "object" && "response" in err) {
        const responseError = err.response as { data?: { error?: string } };
        if (
          responseError.data &&
          typeof responseError.data.error === "string"
        ) {
          errorMessage = responseError.data.error;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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

        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div className="space-y-2">
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Nuova Password"
              ruleset={passwordRules}
            />
          </div>
          <div className="space-y-2">
            <PasswordInput
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              label="Conferma Password"
            />
            {password &&
              passwordConfirmation &&
              password !== passwordConfirmation && (
                <p className="text-center text-xs text-red-600">
                  Le password non coincidono.
                </p>
              )}
          </div>
          {error && <p className="text-center text-xs text-red-600">{error}</p>}
          <Button
            type="submit"
            disabled={
              isLoading ||
              password !== passwordConfirmation ||
              !!validatePassword(password) // Disable if there's any validation error
            }
            className="bg-primary hover:bg-button-hover h-12 w-full cursor-pointer rounded-2xl text-white transition-all duration-700 md:h-14 md:text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aggiornando...
              </>
            ) : (
              "Cambia Password"
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
