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
import { type Sharer, userService } from "@/app/api/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ResetPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: Sharer | null;
  onPasswordReset: () => void;
}

export function ResetPasswordDialog({
  isOpen,
  onClose,
  user,
  onPasswordReset,
}: ResetPasswordDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmSend = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await userService.sendUsernameToSharerById({
        sharer_id: user.id,
      });
      // Assuming the API returns a success message or we use a standard one
      // The user-tables component already shows a toast on success via onUsernameSent callback
      onPasswordReset();
      // eslint-disable-next-line
    } catch (error: any) {
      console.error("Failed to send username:", error);
      toast.error(
        // eslint-disable-next-line
        error.response?.data?.error ?? "Impossibile inviare l'username.",
      );
      // Keep the dialog open on error to allow retry or cancellation
    } finally {
      setIsLoading(false);
    }
  };

  // Close dialog if user becomes null while open (edge case)
  React.useEffect(() => {
    if (!user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conferma Reset Password</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler resettare la password per{" "}
            <strong>{user?.username}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annulla
          </Button>
          <Button onClick={handleConfirmSend} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Conferma Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
