import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XIcon, Loader2, AlertCircle, User } from "lucide-react";
import EmailInput from "@/components/ui/email-input";
import { userService } from "@/app/api/api";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface LoginRecoverUsernameDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

/**
 * Enhanced dialog for username recovery in the login flow.
 * Handles email input, loading, error, and API logic internally.
 * Now with improved minimal, modern UI/UX and better whitespace.
 */
export default function LoginRecoverUsernameDialog({
  open,
  onClose,
}: LoginRecoverUsernameDialogProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ragione_sociale, setRagioneSociale] = useState("");

  // Handles the username recovery logic
  const handleRecoverUsername = async () => {
    if (!ragione_sociale.trim()) {
      setError("Inserisci la ragione sociale.");
      return;
    }
    if (!email.trim()) {
      setError("Inserisci il tuo indirizzo email.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Usa la nuova API recoveryUsernameRequest
      const response = await userService.recoveryUsernameRequest({
        ragione_sociale: ragione_sociale.trim(),
        email: email.trim(),
      });
      if (response.success) {
        toast.success(
          "Richiesta inoltrata con successo. Verrà ricontattato al più presto.",
        );
        onClose();
      } else {
        const errorMessage =
          response.message ?? "Impossibile inviare la richiesta.";
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Recovery username request error:", err);
      let errorMessage = "Si è verificato un errore. Riprova più tardi.";
      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data as { message?: string };
        errorMessage = errorData.message ?? errorMessage;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <DialogContent className="w-full max-w-sm overflow-visible border-0 bg-transparent p-0 shadow-none">
            {/* Main dialog card with modern, minimal style */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="relative z-50 mx-auto flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-zinc-100 bg-white px-6 py-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Close button, visually hidden on mobile for less clutter */}

              {/* Dialog header */}
              <div className="flex flex-col gap-1 text-center">
                <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
                  Recupera il tuo username
                </DialogTitle>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Inserisci il tuo indirizzo email per ricevere il tuo username.
                </p>
              </div>

              {/* Form fields */}
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  // Ensure promise is handled to avoid linter error
                  void handleRecoverUsername();
                }}
                autoComplete="off"
              >
                {/* Ragione Sociale input */}
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="ragione-sociale"
                    className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Ragione Sociale
                  </Label>
                  <div className="relative">
                    <Input
                      value={ragione_sociale}
                      placeholder="Mario Rossi"
                      type="text"
                      className="peer border-border h-12 rounded-2xl border-[1.5px] ps-10 placeholder:text-black/30 dark:border-white/20 dark:placeholder:text-white/20"
                      onChange={(e) => {
                        setRagioneSociale(e.target.value);
                        setError(null);
                      }}
                    />
                    <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                      <User size={20} aria-hidden="true" />
                    </div>
                  </div>
                </div>
                {/* Email input */}
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="email"
                    className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Email
                  </Label>
                  <EmailInput
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                  />
                </div>
                {/* Error message with icon, if present */}
                {error && (
                  <div className="text-destructive animate-in fade-in mt-1 flex items-center gap-2 text-sm font-medium">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}
                {/* Submit button, full width, modern style */}
                <Button
                  type="submit"
                  disabled={
                    isLoading || !email.trim() || !ragione_sociale.trim()
                  }
                  className="bg-primary hover:bg-primary/90 focus-visible:ring-primary mt-2 h-11 w-full rounded-xl text-base font-semibold text-white shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Invio in corso...
                    </span>
                  ) : (
                    "Recupera username"
                  )}
                </Button>
              </form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
