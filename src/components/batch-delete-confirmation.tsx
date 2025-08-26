"use client";

import React, { useState } from "react";
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
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "./ui/badge";

interface BatchDeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onConfirm: () => Promise<boolean>;
  documentClassName: string;
  customMessage?: string;
}

export function BatchDeleteConfirmationDialog({
  isOpen,
  onClose,
  onSuccess,
  onConfirm,
  documentClassName,
  customMessage,
}: BatchDeleteConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const isNameCorrect = typedName.trim() === documentClassName;
  const canConfirm = isNameCorrect && !isLoading;

  const handleConfirmDelete = async () => {
    if (!canConfirm) {
      setHasAttemptedSubmit(true);
      return;
    }

    setIsLoading(true);
    try {
      const success = await onConfirm();
      if (success) {
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
        setTypedName("");
        setHasAttemptedSubmit(false);
      }
    } catch (error) {
      console.error("Failed to delete batch:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Si è verificato un errore durante l'eliminazione";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTypedName("");
    setHasAttemptedSubmit(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="z-[100] max-w-[calc(100%-2rem)] sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Conferma Eliminazione
          </DialogTitle>
          <div className="text-muted-foreground text-sm leading-relaxed">
            <p className="mb-2">
              {customMessage ??
                "Sei sicuro di voler eliminare questa condivisione?"}
            </p>
            {!customMessage && (
              <p>
                Questa azione eliminerà definitivamente tutti i documenti e file
                associati e non può essere annullata.
              </p>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="batch-name-confirmation"
                className="text-sm font-medium"
              >
                Nome della classe documentale da confermare:
              </Label>
              <Badge className="text-muted-foreground bg-muted rounded-sm px-2 py-1 text-xs">
                {documentClassName}
              </Badge>
            </div>
            <Input
              id="batch-name-confirmation"
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Digita il nome del batch per confermare..."
              className={`transition-all duration-200 ${
                hasAttemptedSubmit && !isNameCorrect
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canConfirm) {
                  handleConfirmDelete();
                }
              }}
            />
            {hasAttemptedSubmit && !isNameCorrect && (
              <p className="flex items-center gap-1 text-sm text-red-500">
                <AlertTriangle className="h-3 w-3" />
                Il nome inserito non corrisponde. Riprova.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            Annulla
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={!canConfirm}
            className="flex-1 sm:flex-none"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Elimina
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
