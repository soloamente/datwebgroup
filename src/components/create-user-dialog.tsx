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

// TODO: Update this interface based on the actual data expected by the API
interface RegisterWorkspaceData {
  username: string;
  nominativo: string;
  email: string;
  codice_fiscale?: string;
  partita_iva?: string;
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

  // TODO: Update this function to call the correct API endpoint with RegisterWorkspaceData
  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    // Map form data to the expected structure
    const data: RegisterWorkspaceData = {
      username: formData.get("username") as string,
      nominativo: formData.get("nominativo") as string,
      email: formData.get("email") as string,
      codice_fiscale: (formData.get("codice_fiscale") as string) || undefined,
      partita_iva: (formData.get("partita_iva") as string) || undefined,
    };

    console.log("Form data:", data); // Log data for now

    try {
      // --- Placeholder for API call ---
      // const response = await yourApiService.registerToWorkspace(data);
      // toast.success(response.data?.message || "Registration successful.");
      // Simulating success for now
      // await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
      // toast.success("Registration submitted (simulated).");
      // onUserCreated(); // Call the callback on success
      // --- End Placeholder ---
      const response = await userService.createSharer(data);
      // eslint-disable-next-line
      toast.success(response.data?.message || "Sharer creato con successo.");
      onUserCreated(); // Call the callback on success
      // eslint-disable-next-line
    } catch (err: any) {
      console.error("Failed to register:", err);
      // eslint-disable-next-line
      const errorMessage =
        // eslint-disable-next-line
        err.response?.data?.error ||
        "Si è verificato un errore durante la creazione.";
      // eslint-disable-next-line
      setError(errorMessage);
      // eslint-disable-next-line
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset error when dialog closes or opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nominativo">
                  Nominativo <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="nominativo"
                  name="nominativo"
                  className="rounded-xl"
                  placeholder="Nominativo"
                  required
                  disabled={isLoading}
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
                  className="peer rounded-xl ps-9"
                  placeholder="Email"
                  required
                  disabled={isLoading}
                />
                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                  <AtSignIcon size={16} aria-hidden="true" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="codice_fiscale">Codice fiscale</Label>
              <Input
                id="codice_fiscale"
                name="codice_fiscale"
                placeholder="Codice fiscale"
                disabled={isLoading}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partita_iva">Partita IVA</Label>
              <Input
                id="partita_iva"
                name="partita_iva"
                placeholder="Partita IVA"
                disabled={isLoading}
                className="rounded-xl"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl"
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
