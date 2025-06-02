"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/app/api/auth";
import AdminLoginLeftSide from "./admin-login-left-side";
import AdminLoginRightSide from "./admin-login-right-side";
import { userService } from "@/app/api/api";

// Define a type for the expected API response from /api/reset-password-by-username
interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export default function AdminLoginWrapper() {
  const [step, setStep] = useState<
    "usernameInput" | "passwordInput" | "otpInput" | "login"
  >("usernameInput");
  const [loginMode, setLoginMode] = useState<"credentials" | "qr">(
    "credentials",
  );
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const authStore = useAuthStore();

  useEffect(() => {
    if (authStore.isAuthenticated()) {
      if (authStore.user?.must_change_password) {
        router.push("/change-password");
      } else {
        if (authStore.isAdmin()) {
          router.push("/dashboard/admin");
        } else if (userRole === "sharer") {
          router.push("/dashboard/sharer");
        } else if (userRole === "viewer") {
          router.push("/dashboard/viewer");
        } else {
          router.push("/dashboard/clienti");
        }
      }
    }
  }, [authStore, router, userRole]);

  const handleLoginSuccess = (data: {
    success: boolean;
    email?: string;
    username?: string;
    password?: string;
  }) => {
    console.log("Login success data:", data);
    if (data.success && data.email && data.username && data.password) {
      console.log("Setting state values and changing to OTP step");
      console.log("Email value being set:", data.email);
      console.log("Username value being set:", data.username);
      setEmail(data.email);
      setUsername(data.username);
      setPassword(data.password);
      setStep("otpInput");
      setError(null);
    } else {
      console.log("Invalid login data, not changing step");
      setError("Failed to prepare for OTP. Please try again.");
    }
  };

  const handleQrScan = async (data: string) => {
    setError("QR code login is currently not supported in this flow.");
  };

  const handleQrError = (errorMsg: string) => {
    setError(errorMsg);
  };

  const handleUsernameChecked = (checkedUsername: string, role: string) => {
    setUsername(checkedUsername);
    setUserRole(role);
    setStep("passwordInput");
    setError(null);
  };

  const handleForgotPassword = async () => {
    if (!username) {
      setError("Username is required to reset password.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await userService.resetPasswordByUsername(username);
      if (result.success) {
        setError(result.message);
      } else {
        setError(result.message ?? "Failed to reset password.");
      }
    } catch (e: unknown) {
      let message = "An error occurred while trying to reset password.";
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
      console.error("Forgot password error:", e);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center gap-2 overflow-hidden p-2">
      <AdminLoginLeftSide />
      <AdminLoginRightSide
        step={step}
        setStep={setStep}
        loginMode={loginMode}
        setLoginMode={setLoginMode}
        email={email}
        setEmail={setEmail}
        username={username}
        setUsername={setUsername}
        userRole={userRole}
        password={password}
        setPassword={setPassword}
        error={error}
        setError={setError}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onLoginSuccess={handleLoginSuccess}
        onQrScan={handleQrScan}
        onQrError={handleQrError}
        onLoginModeChange={setLoginMode}
        onUsernameChecked={handleUsernameChecked}
        onForgotPassword={handleForgotPassword}
        authStore={authStore}
      />
    </div>
  );
}
