"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import UsernameInput from "@/components/login/username-input";
import PasswordInput from "@/components/login/password-input";
import useAuthStore from "@/app/api/auth";
import { useRouter } from "next/navigation";

interface AdminLoginFormProps {
  onSuccess: (data: {
    success: boolean;
    email?: string;
    username?: string;
    password?: string;
  }) => void;
}

export default function AdminLoginForm({ onSuccess }: AdminLoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const authStore = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Attempting login with username:", username);
      const result = await authStore.prelogin(
        username.trim(), // Use username as email initially
        username.trim(),
        password,
      );
      console.log("Prelogin result:", result);

      if (result?.success) {
        console.log("OTP required, switching to OTP step");
        console.log("API Response - userEmail:", result.userEmail);
        console.log("API Response - username:", username);

        // Force using a real email for testing
        const emailToUse = result.userEmail ?? "test@example.com";
        console.log("Using email for OTP step:", emailToUse);

        onSuccess({
          success: true,
          email: emailToUse,
          username,
          password,
        });
        return;
      } else {
        console.log("Login failed:", result?.message);
        setError(
          result?.message ??
            "Login fallito. Controlla le credenziali e riprova.",
        );
        return;
      }

      // This code will only run if we don't return above
      if (authStore.isAuthenticated()) {
        if (authStore.user?.must_change_password) {
          router.push("/change-password");
        } else {
          router.push("/dashboard/clienti");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error instanceof Error ? error.message : "Errore durante il login",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6 md:space-y-6">
      <div className="flex flex-col space-y-4 md:space-y-6">
        <UsernameInput
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="text-center text-sm text-red-500">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        className="bg-primary hover:bg-button-hover h-14 w-full cursor-pointer rounded-2xl text-white transition-all duration-700 md:text-lg"
      >
        {loading ? "Accedendo..." : "Continua"}
      </Button>
    </form>
  );
}
