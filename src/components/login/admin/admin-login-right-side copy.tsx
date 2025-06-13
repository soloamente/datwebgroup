"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import AdminOtpForm from "./admin-otp-form";
import AdminQrScanner from "./admin-qr-scanner";
import UsernameInput from "@/components/login/username-input";
import PasswordInput from "@/components/login/password-input";

import { userService, type Sharer } from "@/app/api/api";
import { Loader2 } from "lucide-react";
import { ResetPasswordDialog } from "@/components/reset-passoword";
import Aurora from "@/components/backgrounds/aurora";
import StarBorder from "@/components/ui/star-border/button-border";
import { toast } from "sonner";

type LoginStep = "usernameInput" | "passwordInput" | "otpInput" | "login";

interface CheckUsernameResponse {
  exists: boolean;
  role: string | null;
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
  onUsernameChecked: (username: string, role: string) => void;
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
  const [currentUsername, setCurrentUsername] = useState(username || "");
  const [currentPassword, setCurrentPassword] = useState("");

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
        onUsernameChecked(currentUsername.trim(), result.role);
      } else {
        setError(result.message ?? "User not found or invalid username.");
      }
    } catch (e: unknown) {
      let message = "Failed to check username. Please try again.";
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
      console.error("Check username error:", e);
    }
    setIsLoading(false);
  };

  const [showChangePasswordDialog, setShowChangePasswordDialog] =
    useState(false);

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
      setError("Password is required.");
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
        setError(result?.message ?? "Login failed. Check credentials.");
      }
    } catch (e) {
      setError("An error occurred during login.");
      console.error("Password login error:", e);
    }
    setIsLoading(false);
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
              />
              {error && (
                <p className="text-center text-sm text-red-500">{error}</p>
              )}
              <StarBorder
                as="button"
                color="white"
                speed="5s"
                onClick={handleUsernameContinue}
                disabled={isLoading}
                className="w-full cursor-pointer rounded-2xl md:text-lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Continua"
                )}
              </StarBorder>
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
                onClick={() => onLoginModeChange("qr")}
                className="bg-secondary-button/80 hover:bg-secondary-button/60 h-12 w-full rounded-2xl text-white transition-all duration-500 ease-in-out md:h-14 md:text-lg"
              >
                Codice QR
              </Button>
            </div>

            {/* TODO: Add a button to recover the username. It opens a dialog to put an email and then it sends an email to the user with the username */}
            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => onLoginModeChange("qr")}
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
              <h1 className="text-primary mb-2 text-center text-3xl font-medium transition-all duration-700 md:text-3xl dark:text-white">
                Benvenuto {username}
              </h1>
              <p className="text-description text-center transition-all duration-700 sm:text-sm md:text-sm lg:text-sm">
                Inserisci la tua password per continuare.
              </p>
            </div>
            <div className="space-y-4">
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                label=""
              />
              {error && (
                <p className="text-center text-sm text-red-500">{error}</p>
              )}
              <Button
                onClick={handlePasswordLogin}
                disabled={isLoading}
                className="bg-primary hover:bg-button-hover h-12 w-full cursor-pointer rounded-2xl text-white transition-all duration-700 md:h-14 md:text-lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Accedi"
                )}
              </Button>
            </div>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full rounded-2xl" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="text-muted-foreground px-2 dark:bg-[#0E151D]">
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
              <h1 className="text-primary mb-2 text-3xl font-bold transition-all duration-700 md:text-3xl dark:text-white">
                Benvenuto {username}
              </h1>
              <p className="text-description transition-all duration-700 sm:text-sm md:text-sm lg:text-sm">
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
      <div className="absolute inset-0 z-0 h-full w-full">
        <Aurora
          colorStops={["#0763C9", "#A2A8AB", "#0763C9"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      <div className="absolute bottom-2">{/* <AdminGradientTracing /> */}</div>
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

        {loginMode === "qr" && step !== "otpInput" && (
          <>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="text-muted-foreground px-2 dark:bg-[#0E151D]">
                  o continua con
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-col justify-center gap-4">
              <StarBorder
                as="button"
                color="#0763C9"
                speed="4s"
                onClick={() => onLoginModeChange("qr")}
                className="bg-secondary hover:bg-secondary/60 border-border h-12 w-full rounded-2xl border transition-all duration-500 ease-in-out md:h-14 md:text-lg"
              >
                Codice QR
              </StarBorder>
            </div>
            <AdminQrScanner onScan={onQrScan} onError={onQrError} />
            {error && loginMode === "qr" && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </>
        )}
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
    </motion.div>
  );
}
