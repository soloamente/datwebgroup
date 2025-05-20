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
import { userService, CreateSharerData } from "@/app/api/api";
import { toast } from "sonner";
import { Separator } from "./ui/separator";
import { AtSignIcon, Loader2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

// TODO: Update this interface based on the actual data expected by the API
interface RegisterWorkspaceData {
  username: string;
  nominativo: string;
  email: string;
  codice_fiscale?: string;
  partita_iva?: string;
}

interface ApiResponse {
  data?: {
    message?: string;
  };
}

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export function CreateUserDialog({
  isOpen,
  onClose,
  onUserCreated,
}: CreateUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    nominativo: "",
    email: "",
    codice_fiscale: "",
    partita_iva: "",
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({
    username: null,
    email: null,
    codice_fiscale: null,
    partita_iva: null,
  });

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string): string | null => {
    if (!username) return "L'username è obbligatorio.";
    if (username.length < 5)
      return "L'username deve essere di almeno 5 caratteri.";
    if (/\d/.test(username)) return "L'username non può contenere numeri.";
    return null;
  };

  const validateCodiceFiscale = (cf: string): string | null => {
    if (!cf) return null; // Optional field
    // Basic check: 16 alphanumeric characters
    const cfRegex = /^[A-Z0-9]{16}$/i;
    if (!cfRegex.test(cf))
      return "Il Codice Fiscale deve contenere 16 caratteri alfanumerici.";
    return null;
  };

  const validatePartitaIva = (piva: string): string | null => {
    if (!piva) return null; // Optional field
    // Basic check: 11 digits
    const pivaRegex = /^[0-9]{11}$/;
    if (!pivaRegex.test(piva)) return "La Partita IVA deve contenere 11 cifre.";
    return null;
  };

  const validateForm = () => {
    const usernameError = validateUsername(formData.username);
    const emailError = !isValidEmail(formData.email)
      ? "Formato email non valido."
      : null;
    const codiceFiscaleError = validateCodiceFiscale(formData.codice_fiscale);
    const partitaIvaError = validatePartitaIva(formData.partita_iva);

    setErrors({
      username: usernameError,
      email: emailError,
      codice_fiscale: codiceFiscaleError,
      partita_iva: partitaIvaError,
    });

    return (
      !usernameError && !emailError && !codiceFiscaleError && !partitaIvaError
    );
  };

  const isFormValid = React.useMemo(() => {
    return (
      formData.username.trim() !== "" &&
      formData.nominativo.trim() !== "" &&
      formData.email.trim() !== "" &&
      validateUsername(formData.username) === null &&
      isValidEmail(formData.email) &&
      validateCodiceFiscale(formData.codice_fiscale) === null &&
      validatePartitaIva(formData.partita_iva) === null
    );
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate on change
    let errorMessage: string | null = null;
    switch (name) {
      case "username":
        errorMessage = validateUsername(value);
        break;
      case "email":
        errorMessage = !isValidEmail(value)
          ? "Formato email non valido."
          : null;
        break;
      case "codice_fiscale":
        errorMessage = validateCodiceFiscale(value);
        break;
      case "partita_iva":
        errorMessage = validatePartitaIva(value);
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields before submission
    if (!validateForm()) {
      toast.error(
        "Per favore correggi gli errori nel form prima di procedere.",
      );
      return;
    }

    setError(null);
    setIsLoading(true);

    const data: RegisterWorkspaceData = {
      username: formData.username,
      nominativo: formData.nominativo,
      email: formData.email,
      codice_fiscale: formData.codice_fiscale || undefined,
      partita_iva: formData.partita_iva || undefined,
    };

    try {
      const response = (await userService.createSharer(data)) as ApiResponse;
      const successMessage =
        response.data?.message ?? "Sharer creato con successo.";
      toast.success(successMessage);
      onUserCreated();
    } catch (error: unknown) {
      console.error("Failed to register:", error);
      let errorMessage = "Si è verificato un errore durante la creazione.";

      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as { response?: { data?: { error?: string } } };
        errorMessage = apiError.response?.data?.error ?? errorMessage;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset error when dialog closes or opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setErrors({
        username: null,
        email: null,
        codice_fiscale: null,
        partita_iva: null,
      });
      setFormData({
        username: "",
        nominativo: "",
        email: "",
        codice_fiscale: "",
        partita_iva: "",
      });
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="space-y-4 rounded-4xl px-8 shadow-lg sm:max-w-[550px]">
        <DialogHeader className="flex flex-col items-center space-y-1.5 pt-6">
          <UserPlus className="h-12 w-12" />
          <div className="flex flex-col items-center space-y-0.5">
            <DialogTitle className="text-foreground text-2xl font-semibold">
              Crea sharer
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-md">
              Inserisci i dettagli per il nuovo sharer
            </DialogDescription>
          </div>
        </DialogHeader>
        <form onSubmit={handleRegisterSubmit} className="space-y-4 py-4">
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Username"
                  required
                  disabled={isLoading}
                  className={cn(
                    "h-12 rounded-xl",
                    errors.username && "border-red-500",
                  )}
                  value={formData.username}
                  onChange={handleInputChange}
                />
                {errors.username && (
                  <p className="text-sm text-red-600">{errors.username}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nominativo">
                  Nominativo <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="nominativo"
                  name="nominativo"
                  className="h-12 rounded-xl"
                  placeholder="Nominativo"
                  required
                  disabled={isLoading}
                  value={formData.nominativo}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-600">*</span>
              </Label>
              <div className="relative flex items-center">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className={cn(
                    "peer h-12 rounded-xl ps-9",
                    errors.email && "border-red-500",
                  )}
                  placeholder="Email"
                  required
                  disabled={isLoading}
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                  <AtSignIcon size={16} aria-hidden="true" />
                </div>
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="codice_fiscale">Codice fiscale</Label>
              <Input
                id="codice_fiscale"
                name="codice_fiscale"
                placeholder="Codice fiscale"
                disabled={isLoading}
                className={cn(
                  "h-12 rounded-xl",
                  errors.codice_fiscale && "border-red-500",
                )}
                value={formData.codice_fiscale}
                onChange={handleInputChange}
              />
              {errors.codice_fiscale && (
                <p className="text-sm text-red-600">{errors.codice_fiscale}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="partita_iva">Partita IVA</Label>
              <Input
                id="partita_iva"
                name="partita_iva"
                placeholder="Partita IVA"
                disabled={isLoading}
                className={cn(
                  "h-12 rounded-xl",
                  errors.partita_iva && "border-red-500",
                )}
                value={formData.partita_iva}
                onChange={handleInputChange}
              />
              {errors.partita_iva && (
                <p className="text-sm text-red-600">{errors.partita_iva}</p>
              )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
              className={cn(
                "text-foreground h-12 w-full rounded-xl",
                !isFormValid && "cursor-not-allowed opacity-50",
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando sharer...
                </>
              ) : (
                "Crea sharer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
