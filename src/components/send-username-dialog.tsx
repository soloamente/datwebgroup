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
import { Sharer, userService } from "@/app/api/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SendUsernameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: Sharer | null;
  onUsernameSent: () => void;
}

export function SendUsernameDialog({
  isOpen,
  onClose,
  user,
  onUsernameSent,
}: SendUsernameDialogProps) {
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
      onUsernameSent();
    } catch (error: any) {
      console.error("Failed to send username:", error);
      toast.error(
        error.response?.data?.error || "Impossibile inviare l'username.",
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
          <DialogTitle>Conferma Invio Username</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler inviare l'username{" "}
            <strong>{user?.username}</strong> all'indirizzo email{" "}
            <strong>{user?.email}</strong>?
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
            Conferma Invio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
