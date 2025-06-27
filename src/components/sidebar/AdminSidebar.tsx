"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/app/api/auth";
import { navigationData } from "@/app/dashboard/admin/navigation";

interface CookieStorage {
  state: {
    user: {
      id: number;
      username: string;
      nominativo: string;
      email: string;
      role: string;
      active: boolean;
      created_at: string;
      updated_at: string;
    } | null;
  };
}

export function AdminDashboardClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
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

  const isActiveRoute = (url: string) => {
    if (url === "#") return false;
    // Exact match to prevent dashboard being active when on sub-routes
    return pathname === url;
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <main className="flex min-h-screen transition-all duration-300">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-sidebar fixed z-30 m-2 flex h-[calc(100vh-1rem)] w-[300px] flex-col gap-4 rounded-2xl border p-3 transition-all duration-300 ease-in-out md:sticky md:top-4 md:m-4 md:h-[calc(100vh-2rem)] md:w-[300px] md:translate-x-0 md:p-4`}
        aria-label="Sidebar"
      >
        {/* Header */}
        <header className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex h-[42px] w-full items-center justify-start gap-2">
              <Image
                src={userData.avatar}
                alt={`Avatar di ${userData.name}`}
                width={42}
                height={42}
                className="ring-border/50 rounded-lg ring-1"
                priority
              />
              <div className="flex-col">
                <h2 className="text-sm font-semibold">{userData.name}</h2>
                <p className="text-xs capitalize opacity-60">{userData.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={handleSidebarToggle}
              aria-label="Chiudi sidebar"
            >
              <X size={18} />
            </Button>
          </div>
        </header>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto md:gap-8">
          {/* General Navigation */}
          <div className="flex flex-col gap-2">
            <h3 className="px-2 text-xs font-medium tracking-wider uppercase opacity-60">
              Generale
            </h3>
            {navigationData.navGeneral.map((item) => (
              <div key={item.title}>
                <Link href={item.url} aria-label={item.description}>
                  <Button
                    variant={isActiveRoute(item.url) ? "outline" : "ghost"}
                    className={`flex h-10 w-full items-center justify-start rounded-lg p-2 shadow-none transition-all duration-200 ${
                      isActiveRoute(item.url)
                        ? "bg-accent border-accent-foreground/20"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <item.icon
                      size={20}
                      className={`mr-2 transition-colors duration-200 ${
                        isActiveRoute(item.url)
                          ? "text-accent-foreground"
                          : "text-muted-foreground"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Admin Navigation */}
          {authStore.isAdmin() && (
            <div className="flex flex-col gap-2">
              <h3 className="px-2 text-xs font-medium tracking-wider uppercase opacity-60">
                Amministrazione
              </h3>
              {navigationData.navAdmin.map((item) => (
                <Link
                  href={item.url}
                  key={item.title}
                  aria-label={item.description}
                >
                  <Button
                    variant={isActiveRoute(item.url) ? "outline" : "ghost"}
                    className={`flex h-10 w-full items-center justify-start rounded-lg p-2 shadow-none transition-all duration-200 ${
                      isActiveRoute(item.url)
                        ? "bg-accent border-accent-foreground/20"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <item.icon
                      size={20}
                      className={`mr-2 transition-colors duration-200 ${
                        isActiveRoute(item.url)
                          ? "text-accent-foreground"
                          : "text-muted-foreground"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
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
      </aside>

      {/* Main Content */}
      <section className="flex w-full flex-1 flex-col gap-3 p-3 md:gap-4 md:p-4">
        {/* Mobile Header */}
        {isMobile && (
          <div className="mb-4 flex items-center gap-3 md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={handleSidebarToggle}
              aria-label="Apri menu"
              aria-expanded={sidebarOpen}
            >
              <Menu size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <Image
                src={userData.avatar}
                alt={`Avatar di ${userData.name}`}
                width={32}
                height={32}
                className="rounded-lg"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{userData.name}</span>
                <span className="text-xs capitalize opacity-60">
                  {userData.role}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1">{children}</div>
      </section>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </main>
  );
}
