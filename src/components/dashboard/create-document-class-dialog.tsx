"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  docClassService,
  type CreateDocumentClassResponse,
} from "@/app/api/api";

interface CreateDocumentClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateDocumentClassDialog({
  isOpen,
  onClose,
  onCreated,
}: CreateDocumentClassDialogProps) {
  // State for form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setError(null);
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (!name.trim()) {
        setError("Il nome è obbligatorio.");
        setIsLoading(false);
        return;
      }
      // Call the API and handle the typed response
      const response: CreateDocumentClassResponse =
        await docClassService.createDocumentClass({ name, description });
      if (response.errors) {
        // Show first error if present, with type safety
        const errorKeys = Object.keys(response.errors);
        let firstError: string | undefined = undefined;
        if (errorKeys.length > 0) {
          const firstKey = errorKeys[0];
          if (firstKey) {
            const fieldErrors = response.errors[firstKey];
            if (
              Array.isArray(fieldErrors) &&
              typeof fieldErrors[0] === "string"
            ) {
              firstError = fieldErrors[0];
            }
          }
        }
        setError(firstError ?? response.message ?? "Errore di validazione.");
        toast.error(firstError ?? response.message ?? "Errore di validazione.");
        setIsLoading(false);
        return;
      }
      if (response.message && !response.data) {
        // API returned an error message but no data
        setError(response.message);
        toast.error(response.message);
        setIsLoading(false);
        return;
      }
      toast.success("Classe documentale creata con successo.");
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError("Errore durante la creazione della classe documentale.");
      toast.error("Errore durante la creazione della classe documentale.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Crea Classe Documentale</DialogTitle>
          <DialogDescription>
            Inserisci i dati per la nuova classe documentale.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descrizione</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-white"
            >
              {isLoading ? "Creazione..." : "Crea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
