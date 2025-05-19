import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Sharer, type UpdateSharerData, userService } from "@/app/api/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: Sharer | null;
  onUserUpdate: () => void;
}

export function EditUserDialog({
  isOpen,
  onClose,
  user,
  onUserUpdate,
}: EditUserDialogProps) {
  const [formData, setFormData] = useState<UpdateSharerData>({
    nominativo: "",
    email: "",
    codice_fiscale: "",
    partita_iva: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({
    email: null,
    codice_fiscale: null,
    partita_iva: null,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nominativo: user.nominativo,
        email: user.email,
        codice_fiscale: user.codice_fiscale ?? "",
        partita_iva: user.partita_iva ?? "",
      });
    } else {
      // Reset form when dialog is closed or user is null
      setFormData({
        nominativo: "",
        email: "",
        codice_fiscale: "",
        partita_iva: "",
      });
    }
    // Reset errors when dialog opens or user changes
    setErrors({ email: null, codice_fiscale: null, partita_iva: null });
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }
  };

  // --- Validation Functions ---
  const validateEmail = (email: string): string | null => {
    if (!email) return "L'email è obbligatoria.";
    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Formato email non valido.";
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
  // --- End Validation Functions ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // --- Validation ---
    const emailError = validateEmail(formData.email);
    const codiceFiscaleError = validateCodiceFiscale(
      formData.codice_fiscale ?? "",
    );
    const partitaIvaError = validatePartitaIva(formData.partita_iva ?? "");

    setErrors({
      email: emailError,
      codice_fiscale: codiceFiscaleError,
      partita_iva: partitaIvaError,
    });

    if (emailError || codiceFiscaleError || partitaIvaError) {
      return; // Stop submission if there are errors
    }
    // --- End Validation ---

    setIsLoading(true);

    // Filter out empty optional fields
    const updateData: UpdateSharerData = {
      nominativo: formData.nominativo,
      email: formData.email,
      ...(formData.codice_fiscale && {
        codice_fiscale: formData.codice_fiscale,
      }),
      ...(formData.partita_iva && { partita_iva: formData.partita_iva }),
    };

    try {
      const response = await userService.updateSharer(user.id, updateData);
      toast.success(response.message || "Utente aggiornato con successo.");
      onUserUpdate();
      onClose();
      // eslint-disable-next-line
    } catch (error: any) {
      console.error("Failed to update sharer:", error);
      toast.error(
        // eslint-disable-next-line
        error.response?.data?.error ?? "Impossibile aggiornare l'utente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to determine if form is valid
  const isFormValid =
    !errors.email && !errors.codice_fiscale && !errors.partita_iva;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifica Utente</DialogTitle>
          <DialogDescription>
            Aggiorna le informazioni dell&apos;utente. Clicca su salva per
            confermare.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nominativo" className="text-right">
                Nominativo
              </Label>
              <Input
                id="nominativo"
                name="nominativo"
                value={formData.nominativo}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={cn("col-span-3", errors.email && "border-red-500")}
                required
              />
              {errors.email && (
                <p className="col-span-4 text-right text-sm text-red-500">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="codice_fiscale" className="text-left">
                Codice Fiscale
              </Label>
              <Input
                id="codice_fiscale"
                name="codice_fiscale"
                value={formData.codice_fiscale}
                onChange={handleChange}
                className={cn(
                  "col-span-3",
                  errors.codice_fiscale && "border-red-500",
                )}
              />
              {errors.codice_fiscale && (
                <p className="col-span-4 text-right text-sm text-red-500">
                  {errors.codice_fiscale}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="partita_iva" className="text-right">
                Partita IVA
              </Label>
              <Input
                id="partita_iva"
                name="partita_iva"
                value={formData.partita_iva}
                onChange={handleChange}
                className={cn(
                  "col-span-3",
                  errors.partita_iva && "border-red-500",
                )}
              />
              {errors.partita_iva && (
                <p className="col-span-4 text-right text-sm text-red-500">
                  {errors.partita_iva}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Annulla
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading || !isFormValid}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                "Salva Modifiche"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
