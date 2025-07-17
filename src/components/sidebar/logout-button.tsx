"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import useAuthStore from "@/app/api/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LogoutButtonProps {
  isCompact?: boolean;
}

export function LogoutButton({ isCompact = false }: LogoutButtonProps) {
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
      {isCompact ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="hover:bg-accent/50 flex w-full items-center justify-center rounded-lg p-2 shadow-none"
                onClick={handleLogout}
                disabled={loading}
                aria-label="Logout"
              >
                <LogOut size={20} className="text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{loading ? "Disconnessione..." : "Logout"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button
          variant="outline"
          className="hover:bg-accent/50 flex w-full items-center justify-start rounded-lg px-2 py-2 shadow-none"
          onClick={handleLogout}
          disabled={loading}
          aria-label="Logout"
        >
          <LogOut size={20} className="text-muted-foreground mr-2" />
          <span className="text-sm font-medium">
            {loading ? "Disconnessione..." : "Logout"}
          </span>
        </Button>
      )}
    </div>
  );
}
