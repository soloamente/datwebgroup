"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import useAuthStore from "@/app/api/auth";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const authStore = useAuthStore();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authStore.logout();
      router.push("/login");
    } catch (error) {
      console.error("Errore durante il logout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-border/50 border-t pt-4">
      <Button
        variant="outline"
        className="hover:bg-accent/50 flex w-full items-center justify-start gap-2 rounded-lg p-2 shadow-none"
        onClick={handleLogout}
        disabled={loading}
        aria-label="Logout"
      >
        <LogOut size={20} className="text-muted-foreground" />
        <span className="text-sm font-medium">
          {loading ? "Disconnessione..." : "Logout"}
        </span>
      </Button>
    </div>
  );
}
