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
import { docClassService } from "@/app/api/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  fieldId: number;
  optionId: number;
  onConfirm: () => Promise<boolean>;
  isField?: boolean;
  customMessage?: string;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onSuccess,
  fieldId,
  optionId,
  onConfirm,
  isField = false,
  customMessage,
}: DeleteConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      const success = await onConfirm();
      if (success) {
        // Call onSuccess if provided, otherwise fall back to onClose
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="z-[100]">
        <DialogHeader>
          <DialogTitle>Conferma Eliminazione</DialogTitle>
          <DialogDescription>
            {customMessage ??
              (isField
                ? "Sei sicuro di voler eliminare questo campo? Questa azione non può essere annullata."
                : "Sei sicuro di voler eliminare questa opzione?")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annulla
          </Button>
          <Button onClick={handleConfirmDelete} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Conferma
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
