"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { userService } from "@/app/api/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import PasswordInput from "@/components/login/password-input";
import { useRouter } from "next/navigation";

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export default function ChangePasswordForm({
  onSuccess,
}: ChangePasswordFormProps) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const passwordRules = [
    "Contenere almeno un numero.",
    "Contenere almeno una lettera maiuscola.",
    "Contenere almeno una lettera minuscola.",
    "Contenere almeno un carattere speciale.",
    "Essere lunga almeno 8 caratteri e massimo 15 caratteri.",
  ];

  const validatePassword = (passwordToValidate: string) => {
    if (passwordToValidate.length < 8) {
      return "La password deve essere lunga almeno 8 caratteri.";
    }
    if (passwordToValidate.length > 15) {
      return "La password deve essere lunga massimo 15 caratteri.";
    }
    if (!/[A-Z]/.test(passwordToValidate)) {
      return "La password deve contenere almeno una lettera maiuscola.";
    }
    if (!/[a-z]/.test(passwordToValidate)) {
      return "La password deve contenere almeno una lettera minuscola.";
    }
    // eslint-disable-next-line no-useless-escape
    if (!/[!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+/.test(passwordToValidate)) {
      return "La password deve contenere almeno un carattere speciale.";
    }
    if (!/\d/.test(passwordToValidate)) {
      return "La password deve contenere almeno un numero.";
    }
    return null;
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
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
      await userService.changePassword({
        password,
        password_confirmation: passwordConfirmation,
      });

      toast.success("Password cambiata con successo.");
      onSuccess?.();
    } catch (err) {
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

  const redirectToDashboard = () => {
    router.push("/dashboard/admin");
  };

  return (
    <form onSubmit={handlePasswordChange} className="space-y-6">
      <div className="space-y-2">
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Nuova Password"
          ruleset={passwordRules}
          showInfo={true}
          infoVariant="linear"
          infoSize={20}
          infoColor="white"
          infoStrokeWidth={2}
          infoClassName="animate-pulse"
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
        onClick={redirectToDashboard}
        disabled={
          isLoading ||
          password !== passwordConfirmation ||
          !!validatePassword(password)
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
  );
}
