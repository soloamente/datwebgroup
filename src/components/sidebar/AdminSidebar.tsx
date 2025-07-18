"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/app/api/auth";
import { navigationData } from "@/app/dashboard/admin/navigation";
import { SidebarHeader } from "@/components/sidebar/sidebar-header";
import { AdminSidebarNav } from "@/components/sidebar/admin-sidebar-nav";
import { LogoutButton } from "@/components/sidebar/logout-button";
import { CompactToggle } from "@/components/sidebar/compact-toggle";
import { MobileHeader } from "@/components/sidebar/mobile-header";
import { MobileOverlay } from "@/components/sidebar/mobile-overlay";

export function AdminDashboardClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const authStore = useAuthStore();

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      }
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
    setSidebarOpen(!sidebarOpen);
  };

  const handleCompactToggle = () => {
    setIsCompact(!isCompact);
  };

  return (
    <main className="flex min-h-screen transition-all duration-300">
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

        {/* Compact Toggle Button - Outside Header */}
        {!isMobile && (
          <div className="mb-4 flex justify-center">
            <CompactToggle
              isCompact={isCompact}
              onToggle={handleCompactToggle}
              position="sidebar"
            />
          </div>
        )}

        <AdminSidebarNav
          navigationData={navigationData}
          isCompact={isCompact}
        />

        <LogoutButton isCompact={isCompact} />
      </aside>

      {/* Compact Toggle Button - Between Sidebar and Content */}
      {!isMobile && (
        <div className="relative">
          <div className="absolute top-1/2 left-0 z-20 -translate-x-1/2 -translate-y-1/2">
            <CompactToggle
              isCompact={isCompact}
              onToggle={handleCompactToggle}
              position="floating"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <section className="flex w-full flex-1 flex-col gap-3 p-3 md:gap-4 md:p-4">
        {/* Mobile Header */}
        {isMobile && (
          <MobileHeader
            userData={userData}
            onToggle={handleSidebarToggle}
            sidebarOpen={sidebarOpen}
          />
        )}

        <div className="flex-1">{children}</div>
      </section>

      {/* Mobile Overlay */}
      <MobileOverlay
        isVisible={isMobile && sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </main>
  );
}
