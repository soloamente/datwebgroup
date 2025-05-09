"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/app/api/auth";
import AdminLoginLeftSide from "./admin-login-left-side";
import AdminLoginRightSide from "./admin-login-right-side";

export default function AdminLoginWrapper() {
  const [step, setStep] = useState("login");
  const [loginMode, setLoginMode] = useState<"credentials" | "qr">(
    "credentials",
  );
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const authStore = useAuthStore();

  useEffect(() => {
    if (authStore.isAuthenticated()) {
      if (!authStore.isAdmin()) {
        router.push("/auth/sign-in/clienti");
        return;
      }

      if (authStore.user?.must_change_password) {
        router.push("/change-password");
      } else {
        router.push("/dashboard/admin");
      }
    }
  }, [authStore, router]);

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
      setStep("otp");
      console.log("Current step after change:", step);
    } else {
      console.log("Invalid login data, not changing step");
    }
  };

  const handleQrScan = async (data: string) => {
    try {
      if (!data) {
        setError("Invalid QR code data");
        return;
      }

      const loginData = {
        success: true,
        email: "admin@example.com",
        username: "admin",
        password: "password",
      };

      handleLoginSuccess(loginData);
    } catch (err) {
      setError("Failed to process QR code login");
    }
  };

  const handleQrError = (error: string) => {
    setError(error);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center gap-2 overflow-hidden p-2">
      <AdminLoginLeftSide />
      <AdminLoginRightSide
        step={step}
        loginMode={loginMode}
        email={email}
        username={username}
        password={password}
        error={error}
        onLoginSuccess={handleLoginSuccess}
        onQrScan={handleQrScan}
        onQrError={handleQrError}
        onLoginModeChange={setLoginMode}
      />
    </div>
  );
}
