import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, User, Mail } from "lucide-react";
import EmailInput from "@/components/ui/email-input";
import { userService } from "@/app/api/api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface LoginRecoverUsernameDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Custom DialogContent without the default X close button.
 * This is a copy of the original DialogContent, but omits the DialogPrimitive.Close.
 */
function CustomDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        data-slot="dialog-content"
        className={
          // Use similar styles as the original DialogContent
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg " +
          (className ?? "")
        }
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        {children}
      </div>
    </DialogPortal>
  );
}

// Utility function to safely call toast.success with type assertion
// This isolates the unsafe assertion to a single place for strict mode compatibility
function showToastSuccess(message: string) {
  (toast.success as (msg: string) => void)(message);
}

/**
 * Enhanced dialog for username recovery in the login flow.
 * Handles email input, loading, error, and API logic internally.
 * Modern, minimal UI/UX, accessible, and with whitespace.
 * The default X close button is removed.
 */
export default function LoginRecoverUsernameDialog({
  open,
  onClose,
}: LoginRecoverUsernameDialogProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ragioneSociale, setRagioneSociale] = useState("");

  // Define the expected shape of the API response for type safety
  interface RecoveryUsernameResponse {
    success: boolean;
    message?: string;
  }

  // Handles the username recovery logic
  const handleRecoverUsername = async () => {
    if (!ragioneSociale.trim()) {
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
      // Call the API and ensure the response is type-safe

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const responseRaw = await userService.recoveryUsernameRequest({
        ragione_sociale: ragioneSociale.trim(),
        email: email.trim(),
      });
      // Type guard to check if response matches expected shape
      const response: RecoveryUsernameResponse =
        typeof responseRaw === "object" &&
        responseRaw !== null &&
        "success" in responseRaw &&
        typeof (responseRaw as { success: unknown }).success === "boolean"
          ? (responseRaw as RecoveryUsernameResponse)
          : { success: false, message: "Risposta API non valida." };
      if (response.success) {
        showToastSuccess(
          "Richiesta inoltrata con successo. Verrà ricontattato al più presto.",
        );
        onClose();
      } else {
        setError(
          typeof response.message === "string"
            ? response.message
            : "Impossibile inviare la richiesta.",
        );
      }
    } catch (err: unknown) {
      // Type-safe error handling: check if error is AxiosError with a string message
      let errorMessage = "Si è verificato un errore. Riprova più tardi.";
      if (
        err instanceof AxiosError &&
        err.response &&
        typeof err.response.data === "object" &&
        err.response.data !== null &&
        "message" in err.response.data &&
        typeof (err.response.data as { message?: unknown }).message === "string"
      ) {
        errorMessage = (err.response.data as { message: string }).message;
      }
      setError(
        typeof errorMessage === "string"
          ? errorMessage
          : "Si è verificato un errore. Riprova più tardi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <CustomDialogContent className="w-full max-w-sm overflow-visible border-0 bg-transparent p-0 shadow-none">
            {/* Main dialog card with modern, minimal style */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="relative z-50 mx-auto flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-zinc-100 bg-white px-6 py-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Custom close button in the top right, visually minimal */}
              <button
                type="button"
                aria-label="Chiudi"
                onClick={onClose}
                className="focus-visible:ring-primary absolute top-4 right-4 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                {/* Use a subtle icon, not the default X */}
                <span className="sr-only">Chiudi</span>
                {/* Optionally use a custom icon or a simple SVG */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 5l8 8M13 5l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
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
                      id="ragione-sociale"
                      value={ragioneSociale}
                      placeholder="Mario Rossi"
                      type="text"
                      className="peer border-border h-14 rounded-2xl border-[1.5px] ps-10 placeholder:text-black/30 dark:border-white/20 dark:placeholder:text-white/20"
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
                {/* inline error removed; using toast only */}
                {/* Submit button, full width, modern style */}
                <Button
                  type="submit"
                  disabled={
                    isLoading || !email.trim() || !ragioneSociale.trim()
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
          </CustomDialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
