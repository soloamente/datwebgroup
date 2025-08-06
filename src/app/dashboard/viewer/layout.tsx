"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/app/api/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Settings } from "lucide-react";
import { IoExitOutline } from "react-icons/io5";

interface ViewerLayoutProps {
  children: React.ReactNode;
}

export default function ViewerLayout({ children }: ViewerLayoutProps) {
  const authStore = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    if (!authStore.isAuthenticated()) {
      void router.push("/login");
      return;
    }

    // Check if user is a viewer
    if (authStore.user?.role !== "viewer") {
      void router.push("/dashboard/admin");
      return;
    }
  }, [authStore, router]);

  const handleLogout = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    authStore.logout();
    void router.push("/login");
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-border bg-background sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-foreground text-xl font-semibold">
              Viewer Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={authStore.user?.avatar} />
                    <AvatarFallback>
                      {authStore.user?.nominativo?.charAt(0) ?? "V"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm leading-none font-medium">
                      {authStore.user?.nominativo}
                    </p>
                    <p className="text-muted-foreground/30 text-xs leading-none">
                      {authStore.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <IoExitOutline className="h-5 w-5" />
                  <span>Esci</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
