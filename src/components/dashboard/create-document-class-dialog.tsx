"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/kamui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button/button";
import { toast } from "sonner";
import {
  docClassService,
  type CreateDocumentClassResponse,
} from "@/app/api/api";
import CoverUploader from "@/components/ui/cover-uploader";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

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
  const [name, setName] = useState("");
  const [singularName, setSingularName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = name.trim() !== "";

  React.useEffect(() => {
    if (!isOpen) {
      setName("");
      setSingularName("");
      setDescription("");
      setCoverImage(null);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);
    setError(null);
    try {
      const response: CreateDocumentClassResponse =
        await docClassService.createDocumentClass({
          name,
          description,
          singular_name: singularName.trim() || undefined,
          logo: coverImage,
        });
      if (response.errors) {
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
      <DialogContent className="bg-background grid max-w-4xl overflow-hidden rounded-3xl border-transparent p-0 shadow-2xl md:grid-cols-2">
        <VisuallyHidden>
          <DialogTitle>Crea classe documentale</DialogTitle>
        </VisuallyHidden>
        {/* Left Side: Form */}
        <div className="flex flex-col justify-center p-12">
          <div className="w-full">
            <h1 className="text-foreground text-3xl font-medium">
              Crea classe documentale
            </h1>
            <p className="text-foreground/60 mb-8 text-sm">
              Inserisci i dati per la nuova classe documentale.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground/60 text-sm">
                  Nome *
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  loading={isLoading}
                  error={!!error}
                  size="xl"
                  radius="xl"
                  placeholder="e.g. Fatture"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="singularName"
                  className="text-foreground/60 text-sm"
                >
                  Nome al singolare
                </Label>
                <Input
                  id="singularName"
                  value={singularName}
                  onChange={(e) => setSingularName(e.target.value)}
                  loading={isLoading}
                  error={!!error}
                  size="xl"
                  radius="xl"
                  placeholder="e.g. Fattura"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-foreground/60 text-sm"
                >
                  Descrizione
                </Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  loading={isLoading}
                  error={!!error}
                  size="xl"
                  radius="xl"
                  placeholder="e.g. Classe per le fatture elettroniche"
                />
              </div>

              {error && (
                <div className="text-destructive pt-2 text-sm">{error}</div>
              )}

              <div className="space-y-4 pt-6">
                <Button
                  type="submit"
                  isDisabled={!isFormValid || isLoading}
                  pending={isLoading}
                  color="primary"
                  size="lg"
                  radius="lg"
                  className="w-full text-base font-medium"
                >
                  Crea
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Cover Uploader */}
        <div className="flex items-center justify-center p-8">
          <div className="h-full w-full max-w-sm">
            <CoverUploader
              onFileCropped={setCoverImage}
              className="h-full w-full"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
