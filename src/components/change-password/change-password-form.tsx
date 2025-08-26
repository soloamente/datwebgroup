"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { userService } from "@/app/api/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import PasswordInput from "@/components/login/password-input";
import { useRouter } from "next/navigation";
import useAuthStore from "@/app/api/auth";

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
  const authStore = useAuthStore();

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

      // Refresh user state from backend to get updated must_change_password status
      try {
        const userResponse = await userService.getUser();
        if (userResponse.user) {
          // Convert the user data to match the auth store User interface
          const userData = {
            ...userResponse.user,
            active: userResponse.user.active ? 1 : 0, // Convert boolean to number
            codice_fiscale: userResponse.user.codice_fiscale || null,
            partita_iva: userResponse.user.partita_iva || null,
            sharer_id: null, // This field is not in UserResponse, set to null
          };

          // Update the auth store with the fresh user data from backend
          authStore.setAuth(userData);
          console.log("User state refreshed after password change:", userData);
        }
      } catch (refreshError) {
        console.error("Error refreshing user state:", refreshError);
        // If refresh fails, manually update the must_change_password flag
        const currentUser = authStore.user;
        if (currentUser?.id) {
          const updatedUser = {
            ...currentUser,
            must_change_password: 0, // Set to false since password was changed successfully
          };
          authStore.setAuth(updatedUser);
        }
      }

      // Call onSuccess callback if provided
      onSuccess?.();

      // Redirect to appropriate dashboard based on user role
      setTimeout(() => {
        const userRole = authStore.user?.role;
        if (authStore.isAdmin()) {
          router.push("/dashboard/admin");
        } else if (userRole === "sharer") {
          router.push("/dashboard/sharer");
        } else if (userRole === "viewer") {
          router.push("/dashboard/viewer");
        } else {
          router.push("/dashboard/clienti");
        }
      }, 1000); // Small delay to ensure state is updated
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
