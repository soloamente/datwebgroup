import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import EmailInput from "@/components/ui/email-input";
import { userService } from "@/app/api/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LoginRecoverUsernameDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Enhanced dialog for username recovery in the login flow.
 * Handles email input, loading, error, and API logic internally.
 */
export default function LoginRecoverUsernameDialog({
  open,
  onClose,
}: LoginRecoverUsernameDialogProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecoverUsername = async () => {
    if (!email.trim()) {
      setError("Inserisci il tuo indirizzo email.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await userService.recoverUsername(email.trim());

      if (response.success) {
        toast.success("Username inviato al tuo indirizzo email.");
        onClose();
      } else {
        setError(response.message ?? "Impossibile recuperare lo username.");
      }
    } catch (err) {
      console.error("Username recovery error:", err);
      setError("Si è verificato un errore. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <DialogContent className="max-w-md overflow-visible !border-0 !bg-transparent p-0 !shadow-none">
            {/* Overlay for backdrop blur */}
            <div
              className="fixed inset-0 z-40 backdrop-blur-sm"
              aria-hidden="true"
            />
            {/* Main dialog content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="bg-background relative z-50 mx-auto w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              {/* Close button */}
              <div className="absolute top-4 right-4 flex items-center gap-1">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  aria-label="Close dialog"
                  className="h-6 w-6 rounded-full p-0"
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </div>

              {/* Dialog header */}
              <h2 className="mb-4 text-lg font-medium">
                Recupera il tuo username
              </h2>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
                Inserisci il tuo indirizzo email per ricevere il tuo username.
              </p>

              {/* Email input */}
              <div className="mb-6">
                <EmailInput
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                />
                {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
                onClick={handleRecoverUsername}
                className="w-full rounded-lg bg-black py-2 text-sm font-normal text-white hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-500 dark:bg-white dark:text-black dark:hover:bg-gray-100 dark:disabled:bg-gray-800"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Invio in corso...
                  </>
                ) : (
                  "Recupera username"
                )}
              </Button>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
