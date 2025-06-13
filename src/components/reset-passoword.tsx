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
      const response = await userService.resetPasswordByUsername(user.username);
      if (response.success) {
        toast.success(response.message);
        onPasswordReset();
      } else {
        toast.error(response.message ?? "Impossibile resettare la password.");
      }
    } catch (error: unknown) {
      console.error("Failed to reset password:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Impossibile resettare la password.";
      toast.error(errorMessage);
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
