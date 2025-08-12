"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/app/api/auth";
import { navigationData } from "@/app/dashboard/admin/navigation";
import { SidebarHeader } from "@/components/sidebar/sidebar-header";
import { AdminSidebarNav } from "@/components/sidebar/admin-sidebar-nav";
import { LogoutButton } from "@/components/sidebar/logout-button";
import { MobileHeader } from "@/components/sidebar/mobile-header";
import { MobileOverlay } from "@/components/sidebar/mobile-overlay";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AdminDashboardClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const authStore = useAuthStore();

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) {
    return null;
  }

  const userData = {
    name: authStore.user?.nominativo ?? authStore.user?.username ?? "Utente",
    role: authStore.user?.role,
    avatar: authStore.user?.avatar ?? "/avatars/user-placeholder.png",
  };

  const handleSidebarToggle = () => {
    setIsTransitioning(true);
    setSidebarOpen(!sidebarOpen);
    setTimeout(() => setIsTransitioning(false), 200);
  };

  const handleCompactToggle = () => {
    setIsCompact(!isCompact);
  };

  const handleExpandFromCompact = () => {
    if (isCompact) {
      setIsCompact(false);
    }
  };

  return (
    <main className="flex min-h-screen transition-all duration-700">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-sidebar fixed z-30 m-2 flex h-[calc(100vh-1rem)] ${
          isCompact ? "w-[80px]" : "w-[300px]"
        } flex-col gap-4 overflow-hidden rounded-2xl border p-3 transition-all duration-300 ease-in-out md:sticky md:top-4 md:m-4 md:h-[calc(100vh-2rem)] md:${
          isCompact ? "w-[80px]" : "w-[300px]"
        } md:translate-x-0 md:p-4`}
        aria-label="Sidebar"
      >
        <SidebarHeader
          userData={userData}
          onToggle={handleSidebarToggle}
          isCompact={isCompact}
        />

        <AdminSidebarNav
          navigationData={navigationData}
          isCompact={isCompact}
          onExpandFromCompact={handleExpandFromCompact}
        />

        <LogoutButton isCompact={isCompact} />
      </aside>

      {/* Compact Toggle Button - Fixed between sidebar and content */}
      {!isMobile && (
        <div
          className={`pointer-events-none fixed top-1/2 z-20 -translate-y-1/2 transition-all duration-300 ${
            isCompact ? "left-[calc(80px+1rem)]" : "left-[calc(300px+1rem)]"
          }`}
        >
          <div className="pointer-events-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCompactToggle}
                    aria-label={
                      isCompact ? "Espandi sidebar" : "Comprimi sidebar"
                    }
                    className="!hover:bg-transparent !focus:bg-transparent !active:bg-transparent h-8 w-8 rounded-full hover:!bg-transparent focus:!bg-transparent active:!bg-transparent"
                  >
                    <div className="bg-secondary h-24 w-1.5 rounded-lg" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{isCompact ? "Espandi sidebar" : "Comprimi sidebar"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      {/* Main Content */}
      <section
        id="content"
        className="flex w-full flex-1 flex-col gap-3 p-3 md:gap-4 md:p-4"
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="mb-4 flex items-center gap-3 md:hidden">
            <MobileHeader
              userData={userData}
              onToggle={handleSidebarToggle}
              sidebarOpen={sidebarOpen}
            />
          </div>
        )}

        <div
          className={`flex flex-grow flex-col transition-opacity duration-200 ${isTransitioning ? "opacity-50" : "opacity-100"}`}
        >
          {children}
        </div>
      </section>

      {/* Mobile Overlay */}
      {isMobile && (
        <MobileOverlay
          isVisible={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}
    </main>
  );
}
