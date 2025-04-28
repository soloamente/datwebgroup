"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userService } from "@/app/api/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import useAuthStore from "@/app/api/auth";

export default function ChangePasswordPage() {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const authStore = useAuthStore();

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError("Le password non coincidono.");
      toast.error("Le password non coincidono.");
      return;
    }

    if (password.length < 8) {
      setError("La password deve essere lunga almeno 8 caratteri.");
      toast.error("La password deve essere lunga almeno 8 caratteri.");
      return;
    }

    setIsLoading(true);

    try {
      await userService.changePassword({
        password,
        password_confirmation: passwordConfirmation,
      });

      toast.success("Password cambiata con successo.");

      // After successful password change, redirect based on user role
      if (authStore.isAdmin()) {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/clienti");
      }
      // eslint-disable-next-line
    } catch (err: any) {
      console.error("Failed to change password:", err);
      // eslint-disable-next-line
      const errorMessage =
        // eslint-disable-next-line
        err.response?.data?.error ||
        "Si è verificato un errore durante il cambio password.";
      // eslint-disable-next-line
      setError(errorMessage);

      // eslint-disable-next-line
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-row items-center justify-center dark:bg-gray-800">
      <div className="relative hidden h-screen w-full bg-[#eaeced] md:block md:w-2/5 dark:bg-gray-900">
        <div className="flex h-full items-center justify-center">
          <Image
            src="/Admin-cuate.svg"
            alt="Change Password"
            width={400}
            height={400}
            className="object-contain"
          />
        </div>
      </div>

      <div className="bg-background flex w-full flex-col justify-center px-6 py-8 md:w-3/5 md:px-16 lg:px-24 dark:bg-gray-800">
        <div className="mx-auto w-full max-w-md">
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
              <Label htmlFor="password">
                Nuova Password <span className="text-red-600">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="rounded-xl"
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">
                Conferma Password <span className="text-red-600">*</span>
              </Label>
              <Input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                placeholder="********"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                disabled={isLoading}
                className="rounded-xl"
                minLength={8}
              />
              {password &&
                passwordConfirmation &&
                password !== passwordConfirmation && (
                  <p className="text-center text-xs text-red-600">
                    Le password non coincidono.
                  </p>
                )}
            </div>
            {error && (
              <p className="text-center text-xs text-red-600">{error}</p>
            )}
            <p
              className={`text-center text-xs ${
                password.length > 0 && password.length < 8
                  ? "text-red-600"
                  : "text-muted-foreground"
              }`}
            >
              La password deve essere lunga almeno 8 caratteri.
            </p>

            <Button
              type="submit"
              disabled={
                isLoading ||
                password !== passwordConfirmation ||
                password.length < 8
              }
              className="w-full rounded-xl"
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
      </div>
    </div>
  );
}
