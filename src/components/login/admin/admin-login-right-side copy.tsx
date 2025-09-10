"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";

import AdminOtpForm from "./admin-otp-form";
import AdminQrScanner from "./admin-qr-scanner";
import UsernameInput from "@/components/login/username-input";
import PasswordInput from "@/components/login/password-input";
import EmailInput from "@/components/ui/email-input";

import { userService, type Sharer } from "@/app/api/api";
import { Loader2 } from "lucide-react";
import { ResetPasswordDialog } from "@/components/reset-passoword";
import Aurora from "@/components/backgrounds/aurora";
import StarBorder from "@/components/ui/star-border/button-border";
import { toast } from "sonner";
import LoginRecoverUsernameDialog from "@/components/login/login-recover-username-dialog";
import { QrIcon } from "@/components/icons/qr";

type LoginStep = "usernameInput" | "passwordInput" | "otpInput" | "login";

interface CheckUsernameResponse {
  exists: boolean;
  role: string | null;
  nominativo?: string;
  message?: string;
}

interface AuthStoreActions {
  prelogin: (
    email: string,
    username: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string; userEmail?: string }>;
}

interface AdminLoginRightSideProps {
  step: LoginStep;
  setStep: React.Dispatch<React.SetStateAction<LoginStep>>;
  loginMode: "credentials" | "qr";
  setLoginMode: React.Dispatch<React.SetStateAction<"credentials" | "qr">>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  userRole: string | null;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onLoginSuccess: (data: {
    success: boolean;
    email?: string;
    username?: string;
    password?: string;
  }) => void;
  onQrScan: (data: string) => void;
  onQrError: (error: string) => void;
  onLoginModeChange: (mode: "credentials" | "qr") => void;
  onUsernameChecked: (
    username: string,
    role: string,
    nominativo?: string,
  ) => void;
  onForgotPassword: () => Promise<void>;
  authStore: AuthStoreActions;
}

export default function AdminLoginRightSide({
  step,
  setStep,
  loginMode,
  setLoginMode,
  email,
  setEmail,
  username,
  setUsername,
  userRole,
  password,
  setPassword,
  error,
  setError,
  isLoading,
  setIsLoading,
  onLoginSuccess,
  onQrScan,
  onQrError,
  onLoginModeChange,
  onUsernameChecked,
  onForgotPassword,
  authStore,
}: AdminLoginRightSideProps) {
  const [currentUsername, setCurrentUsername] = useState(username ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [userNominativo, setUserNominativo] = useState<string>("");
  const [showChangePasswordDialog, setShowChangePasswordDialog] =
    useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showRecoverUsernameDialog, setShowRecoverUsernameDialog] =
    useState(false);
  const { theme } = useTheme();

  const colorStops =
    theme === "dark"
      ? ["#0763C9", "#A2A8AB", "#0763C9"] // Light colors for dark theme
      : ["#A2A8AB", "#0763C9", "#A2A8AB"]; // Dark colors for light theme

  const handleUsernameContinue = async () => {
    if (!currentUsername.trim()) {
      toast.error("Inserisci il tuo username.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const result = await userService.checkUsername(currentUsername.trim());

      if (result.exists && result.role) {
        setUserNominativo(result.nominativo ?? "");
        onUsernameChecked(
          currentUsername.trim(),
          result.role,
          result.nominativo,
        );
      } else {
        const message =
          result.message ?? "Utente non trovato o username non valido.";
        setError(message);
        toast.error(message);
      }
    } catch (e: unknown) {
      let message = "Verifica dello username non riuscita. Riprova.";
      if (
        typeof e === "object" &&
        e !== null &&
        "isAxiosError" in e &&
        e.isAxiosError
      ) {
        const axiosError = e as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        }
      } else if (e instanceof Error) {
        message = e.message;
      }
      setError(message);
      toast.error(message);
      console.error("Check username error:", e);
    }
    setIsLoading(false);
  };

  const handleChangePassword = () => {
    setShowChangePasswordDialog(true);
  };

  const handleDialogClose = () => {
    setShowChangePasswordDialog(false);
  };

  const handlePasswordReset = () => {
    setShowChangePasswordDialog(false);
  };

  const handlePasswordLogin = async () => {
    if (!currentPassword) {
      setError("La password è obbligatoria.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const result = await authStore.prelogin(
        username,
        username,
        currentPassword,
      );

      if (result?.success) {
        onLoginSuccess({
          success: true,
          email: result.userEmail,
          username: username,
          password: currentPassword,
        });
      } else {
        const message =
          result?.message ?? "Accesso non riuscito. Controlla le credenziali.";
        setError(message);
        toast.error(message);
      }
    } catch (e) {
      setError("Si è verificato un errore durante il login.");
      toast.error("Si è verificato un errore durante il login.");
      console.error("Password login error:", e);
    }
    setIsLoading(false);
  };

  const handleUsernameInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      void handleUsernameContinue();
    }
  };

  const handlePasswordInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      void handlePasswordLogin();
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case "usernameInput":
        return (
          <>
            <div className="mb-8 w-full md:mb-10">
              <h1 className="text-header-login mb-2 w-full text-center text-3xl font-medium transition-all duration-700 md:text-3xl">
                Benvenuto su NotarShareDoc!
              </h1>
              <p className="text-description-login text-center transition-all duration-700 sm:text-sm md:text-sm lg:text-sm">
                Inserisci il tuo username per continuare.
              </p>
            </div>
            <div className="space-y-6">
              <UsernameInput
                value={currentUsername}
                onChange={(e) => setCurrentUsername(e.target.value)}
                // Add Enter key handler
                onKeyDown={handleUsernameInputKeyDown}
              />
              {/* inline error removed; using toast only */}
              {/* Glowing animated background behind the button */}
              <div className="relative w-full">
                <div className="pointer-events-none absolute -inset-1 z-0 animate-pulse rounded-2xl bg-gradient-to-tr from-blue-400/40 via-blue-200/10 to-blue-600/30 blur-sm" />
                <Button
                  onClick={handleUsernameContinue}
                  disabled={isLoading}
                  className="bg-primary hover:bg-button-hover ring-primary/50 relative z-10 h-12 w-full cursor-pointer rounded-2xl text-white ring-3 transition-all duration-700 md:h-14 md:text-lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Continua"
                  )}
                </Button>
              </div>
            </div>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="text-muted-foreground bg-login-credentials rounded-2xl px-2">
                  o continua con
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => setShowQrModal(true)}
                className="bg-secondary-button/80 hover:bg-secondary-button/60 ring-secondary-button/50 h-12 w-full rounded-2xl text-white transition-all duration-500 ease-in-out md:h-14 md:text-lg"
              >
                Codice QR
              </Button>
            </div>

            {/* Username recovery button and dialog */}
            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => setShowRecoverUsernameDialog(true)}
                className="bg-secondary-button/80 hover:bg-secondary-button/60 h-12 w-full rounded-2xl text-white transition-all duration-500 ease-in-out md:h-14 md:text-lg"
              >
                Username dimenticato?
              </Button>
            </div>
          </>
        );
      case "passwordInput":
        return (
          <>
            <div className="mb-8 md:mb-10">
              <h1 className="text-header-login mb-2 w-full text-center text-3xl font-medium transition-all duration-700 md:text-3xl">
                Benvenuto {userNominativo ?? username}
              </h1>
              <p className="text-description-login text-center transition-all duration-700 sm:text-sm md:text-sm lg:text-sm">
                Inserisci la tua password per continuare.
              </p>
            </div>
            <div className="space-y-6">
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                label=""
                // Add Enter key handler
                onKeyDown={handlePasswordInputKeyDown}
              />
              {/* inline error removed; using toast only */}
              <div className="relative w-full">
                <div className="pointer-events-none absolute -inset-1 z-0 animate-pulse rounded-2xl bg-gradient-to-tr from-blue-400/40 via-blue-200/10 to-blue-600/30 blur-sm" />
                <Button
                  onClick={handlePasswordLogin}
                  disabled={isLoading}
                  className="bg-primary hover:bg-button-hover ring-primary/50 relative z-10 h-12 w-full cursor-pointer rounded-2xl text-white ring-3 transition-all duration-700 md:h-14 md:text-lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Continua"
                  )}
                </Button>
              </div>
            </div>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full rounded-2xl" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="text-muted-foreground bg-login-credentials rounded-2xl px-2">
                  o continua con
                </span>
              </div>
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={isLoading}
              className="bg-secondary-button/80 hover:bg-secondary-button/60 h-12 w-full rounded-2xl text-white transition-all duration-500 ease-in-out md:h-14 md:text-lg"
            >
              Password dimenticata?
            </Button>
          </>
        );
      case "otpInput":
        return (
          <>
            <div className="mb-8 md:mb-10">
              <h1 className="text-header-login mb-2 w-full text-center text-3xl font-medium transition-all duration-700 md:text-3xl">
                Benvenuto {userNominativo ?? username}
              </h1>
              <p className="text-description-login text-center transition-all duration-700 sm:text-sm md:text-sm lg:text-sm">
                {`Inserisci qui sotto il codice OTP inviato alla tua email.`}
              </p>
            </div>
            <AdminOtpForm
              email={email}
              username={username}
              password={password}
            />
          </>
        );
      default:
        return (
          <div>
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="flex h-full w-full flex-col justify-center rounded-2xl px-6 py-8 md:w-3/5 md:px-16 lg:px-24"
    >
      <div
        className={`absolute z-0 h-full w-full ${
          theme === "light" ? "inset-0 rotate-180" : "inset-0"
        }`}
      >
        <Aurora
          colorStops={colorStops}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      <div className="z-10 mx-auto w-full md:w-md lg:max-w-lg">
        <div className="relative h-24 w-24 md:absolute md:top-10 md:right-10 md:h-24 md:w-24">
          <Image
            src="/logo_positivo.png"
            alt="Logo"
            width={100}
            height={100}
            className="mx-auto mb-4"
          />
        </div>

        {renderStepContent()}

        {/* QR Scanner Modal */}
        <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
          <AnimatePresence>
            {showQrModal && (
              <DialogContent className="max-w-md overflow-visible !border-0 !bg-transparent p-0 !shadow-none">
                {/* Overlay moved OUTSIDE the modal card for proper full-screen coverage */}
                <div
                  className="fixed inset-0 z-40 backdrop-blur-sm"
                  aria-hidden="true"
                />
                {/* Glassmorphism modal card with improved padding and spacing */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                  className="relative z-50 mx-auto w-full max-w-md rounded-2xl border border-white/20 bg-white/70 p-6 shadow-2xl backdrop-blur-lg md:p-8 dark:bg-slate-900/80"
                  style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
                >
                  {/* Close button (icon) in top-right, spaced from edge */}
                  <button
                    onClick={() => setShowQrModal(false)}
                    aria-label="Chiudi la finestra QR"
                    className="absolute top-4 right-4 z-10 rounded-full bg-white/70 p-2 text-gray-700 shadow hover:bg-white/90 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  {/* QR code icon/illustration with extra bottom margin */}
                  <div className="mb-4 flex flex-col items-center justify-center pt-8">
                    <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100/80 shadow-inner">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="6"
                          height="6"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <rect
                          x="15"
                          y="3"
                          width="6"
                          height="6"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <rect
                          x="3"
                          y="15"
                          width="6"
                          height="6"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M15 15h2v2h-2zM19 19h2v2h-2zM15 19h2v2h-2zM19 15h2v2h-2z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                    {/* Centro tutti i testi del modal QR, sia orizzontalmente che verticalmente */}
                    <DialogHeader className="flex w-full flex-col items-center justify-center text-center">
                      <DialogTitle className="text-2xl font-bold text-blue-900 dark:text-white">
                        Accedi con QR Code
                      </DialogTitle>
                      <DialogDescription className="mt-1 text-center text-base text-gray-700 dark:text-gray-200">
                        Inquadra il codice QR con la fotocamera per accedere
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  {/* Scanner area with extra margin and padding for separation */}
                  <div className="relative mt-4 mb-4 flex w-full justify-center">
                    <div className="absolute -inset-1 animate-pulse rounded-2xl bg-gradient-to-tr from-blue-400/40 via-blue-200/10 to-blue-600/30 blur-sm" />
                    <div className="relative z-10 w-full max-w-xs rounded-2xl border border-blue-300/60 bg-transparent p-2 shadow-lg">
                      <AdminQrScanner
                        onScan={() => {
                          // QR scanner handles scanning internally
                        }} // Empty function since QR scanner handles it internally
                        onError={(err) => {
                          toast.error(err); // Show error as toast
                          setShowQrModal(false); // Optionally close modal on error
                        }}
                        disabled={!showQrModal} // Only scan when modal is open
                      />
                    </div>
                  </div>
                  {/* Privacy notice with extra margin-top and padding-x */}
                  <div className="mt-6 flex items-center justify-center px-6 pb-2 text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-300">
                      <svg
                        className="mr-1 inline h-4 w-4 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                        />
                      </svg>
                      La fotocamera viene utilizzata solo per la scansione del
                      QR code. Nessun dato viene salvato.
                    </span>
                  </div>
                </motion.div>
              </DialogContent>
            )}
          </AnimatePresence>
        </Dialog>
      </div>
      <ResetPasswordDialog
        isOpen={showChangePasswordDialog}
        onClose={handleDialogClose}
        onPasswordReset={handlePasswordReset}
        user={
          {
            id: 0, // This is a temporary ID since we don't have the actual user ID
            username,
            email,
            nominativo: username,
            role: "admin",
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Sharer
        }
      />
      <LoginRecoverUsernameDialog
        open={showRecoverUsernameDialog}
        onClose={() => setShowRecoverUsernameDialog(false)}
      />
    </motion.div>
  );
}
