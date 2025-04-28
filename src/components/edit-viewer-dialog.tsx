"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Viewer, type UpdateViewerData, userService } from "@/app/api/api";
import { toast } from "sonner";

interface EditViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  viewer: Viewer | null;
  onViewerUpdate: () => void;
}

export function EditViewerDialog({
  isOpen,
  onClose,
  viewer,
  onViewerUpdate,
}: EditViewerDialogProps) {
  const [formData, setFormData] = useState<UpdateViewerData>({
    nominativo: "",
    email: "",
    codice_fiscale: "",
    partita_iva: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (viewer) {
      setFormData({
        nominativo: viewer.nominativo,
        email: viewer.email,
        codice_fiscale: viewer.codice_fiscale ?? "",
        partita_iva: viewer.partita_iva ?? "",
      });
    } else {
      // Reset form if viewer is null (dialog closed or no viewer selected)
      setFormData({
        nominativo: "",
        email: "",
        codice_fiscale: "",
        partita_iva: "",
      });
    }
  }, [viewer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewer) return;

    setIsSubmitting(true);
    try {
      // Prepare data, sending undefined for empty optional fields if needed by the API
      const dataToSend: UpdateViewerData = {
        ...formData,
        codice_fiscale: formData.codice_fiscale ?? undefined,
        partita_iva: formData.partita_iva ?? undefined,
      };
      const response = await userService.updateViewer(viewer.id, dataToSend);
      toast.success(response.message || "Viewer aggiornato con successo.");
      onViewerUpdate(); // Refresh the list
      onClose(); // Close the dialog
      // eslint-disable-next-line
    } catch (error: any) {
      console.error("Failed to update viewer:", error);
      toast.error(
        // eslint-disable-next-line
        error.response?.data?.message ?? "Impossibile aggiornare il viewer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifica Viewer</DialogTitle>
          <DialogDescription>
            Modifica i dettagli del viewer qui. Clicca salva quando hai finito.
          </DialogDescription>
        </DialogHeader>
        {viewer && (
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={viewer.username} // Username is not editable based on API spec
                disabled
                className="col-span-3"
              />
            </div>
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
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="codice_fiscale" className="text-right">
                Codice Fiscale
              </Label>
              <Input
                id="codice_fiscale"
                name="codice_fiscale"
                value={formData.codice_fiscale}
                onChange={handleChange}
                className="col-span-3"
              />
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
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvataggio..." : "Salva Modifiche"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
