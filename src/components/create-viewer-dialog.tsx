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
import { userService, CreateViewerData } from "@/app/api/api"; // Import CreateViewerData
import { toast } from "sonner";
import { AtSignIcon, Loader2, UserPlus } from "lucide-react";
import useAuthStore from "@/app/api/auth"; // Import the auth store

interface CreateViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onViewerCreated: () => void; // Renamed callback prop
}

export function CreateViewerDialog({
  isOpen,
  onClose,
  onViewerCreated, // Use renamed prop
}: CreateViewerDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // Get auth state

  const handleCreateViewerSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated()) {
      setError("Devi essere autenticato per creare un viewer.");
      toast.error("Azione non autorizzata. Effettua il login.");
      setIsLoading(false); // Ensure loading state is reset
      return; // Stop execution if not authenticated
    }

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const nominativo = formData.get("nominativo") as string;
    const email = formData.get("email") as string;
    const codice_fiscale = formData.get("codice_fiscale") as string;
    const partita_iva = formData.get("partita_iva") as string;

    // Validation: Ensure at least one of codice_fiscale or partita_iva is present
    if (!codice_fiscale && !partita_iva) {
      const errorMessage =
        "Devi fornire almeno il Codice Fiscale o la Partita IVA.";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
      return;
    }

    // Map form data to the CreateViewerData structure
    const data: CreateViewerData = {
      nominativo,
      email,
      codice_fiscale: codice_fiscale || undefined, // Send undefined if empty
      partita_iva: partita_iva || undefined, // Send undefined if empty
    };

    console.log("Viewer form data:", data);

    try {
      const response = await userService.createViewer(data);
      toast.success(response.data?.message || "Viewer created successfully.");
      onViewerCreated(); // Call the callback on success
    } catch (err: any) {
      console.error("Failed to create viewer:", err);
      const errorMessage =
        err.response?.data?.error ||
        "An error occurred during viewer creation.";
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
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="space-y-4 rounded-4xl px-8 shadow-lg sm:max-w-[550px]">
        <DialogHeader className="flex flex-col items-center space-y-1.5 pt-6">
          <UserPlus className="h-12 w-12" />
          <div className="flex flex-col items-center space-y-0.5">
            <DialogTitle className="text-foreground text-2xl font-semibold">
              Crea viewer
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-md">
              Inserisci i dettagli per il nuovo viewer
            </DialogDescription>
          </div>
        </DialogHeader>
        {/* Use handleCreateViewerSubmit */}
        <form onSubmit={handleCreateViewerSubmit} className="space-y-4 py-4">
          <div className="space-y-4 py-4">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codice_fiscale">
                  Codice Fiscale{" "}
                  <span className="text-muted-foreground text-xs">
                    (opzionale)
                  </span>
                </Label>
                <Input
                  id="codice_fiscale"
                  name="codice_fiscale"
                  placeholder="Codice Fiscale"
                  disabled={isLoading}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partita_iva">
                  Partita IVA{" "}
                  <span className="text-muted-foreground text-xs">
                    (opzionale)
                  </span>
                </Label>
                <Input
                  id="partita_iva"
                  name="partita_iva"
                  className="rounded-xl"
                  placeholder="Partita IVA"
                  disabled={isLoading}
                />
              </div>
            </div>
            <p className="text-muted-foreground text-center text-xs">
              È obbligatorio fornire almeno uno tra Codice Fiscale e Partita
              IVA.
            </p>
            {/* Removed codice_fiscale and partita_iva fields */}
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
                  Creando viewer...
                </>
              ) : (
                "Crea viewer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
