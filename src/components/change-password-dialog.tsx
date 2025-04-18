"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userService, Sharer } from "@/app/api/api"; // Assuming Sharer is exported
import { toast } from "sonner";
import { Loader2, LockKeyholeIcon } from "lucide-react";

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: Sharer | null; // Pass the whole user or just the ID/email
}

export function ChangePasswordDialog({
  isOpen,
  onClose,
  user,
}: ChangePasswordDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("Nessun utente selezionato.");
      toast.error("Nessun utente selezionato.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Le password non coincidono.");
      toast.error("Le password non coincidono.");
      return;
    }
    if (password.length < 8) {
      // Example validation
      setError("La password deve essere lunga almeno 8 caratteri.");
      toast.error("La password deve essere lunga almeno 8 caratteri.");
      return;
    }

    setIsLoading(true);

    try {
      // Assuming userService has a changePassword method
      // You might need to adjust this based on your actual API service structure
      const response = await userService.changePassword({
        password,
        password_confirmation: passwordConfirmation,
      });
      toast.success(
        response.data?.message || "Password cambiata con successo.",
      );
      onClose(); // Close the dialog on success
    } catch (err: any) {
      console.error("Failed to change password:", err);
      const errorMessage =
        err.response?.data?.error ||
        "Si è verificato un errore durante il cambio password.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when dialog opens or closes, or user changes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setPassword("");
      setPasswordConfirmation("");
    }
  }, [isOpen, user]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="space-y-4 rounded-4xl px-8 shadow-lg sm:max-w-[450px]">
        <DialogHeader className="flex flex-col items-center space-y-1.5 pt-6">
          <LockKeyholeIcon className="h-12 w-12" />
          <div className="flex flex-col items-center space-y-0.5">
            <DialogTitle className="text-foreground text-2xl font-semibold">
              Cambia Password
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-md text-center">
              Inserisci la nuova password per {user?.username || "l'utente"}.
            </DialogDescription>
          </div>
        </DialogHeader>
        <form onSubmit={handlePasswordChange} className="space-y-8 py-4">
          <div className="space-y-4">
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
          </div>
          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
