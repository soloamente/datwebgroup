"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/app/api/auth";
import { navigationData } from "@/app/dashboard/admin/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isCompact, setIsCompact] = useState(false);
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
        {/* Header */}
        <header className="mb-6 md:mb-8">
          {isCompact ? (
            // Compact layout - centered avatar only
            <div className="flex justify-center">
              <motion.div
                animate={{
                  width: 36,
                  height: 36,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                className="flex-shrink-0"
              >
                <Image
                  src={userData.avatar}
                  alt={`Avatar di ${userData.name}`}
                  width={42}
                  height={42}
                  className="ring-border/50 h-full w-full rounded-lg object-cover ring-1 transition-all duration-200"
                  priority
                />
              </motion.div>
            </div>
          ) : (
            // Expanded layout - full header with avatar, text, and buttons
            <motion.div
              className="flex items-center justify-between"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              {/* Avatar and User Info */}
              <motion.div
                className="flex h-[42px] w-full min-w-0 items-center gap-2"
                animate={{
                  width: "100%",
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <motion.div
                  animate={{
                    width: 42,
                    height: 42,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  className="flex-shrink-0"
                >
                  <Image
                    src={userData.avatar}
                    alt={`Avatar di ${userData.name}`}
                    width={42}
                    height={42}
                    className="ring-border/50 h-full w-full rounded-lg object-cover ring-1 transition-all duration-200"
                    priority
                  />
                </motion.div>

                {/* User Info */}
                <div className="min-w-0 flex-1 flex-col overflow-hidden">
                  <h2 className="truncate text-sm font-semibold">
                    {userData.name}
                  </h2>
                  <p className="truncate text-xs capitalize opacity-60">
                    {userData.role}
                  </p>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 md:hidden"
                  onClick={handleSidebarToggle}
                  aria-label="Chiudi sidebar"
                >
                  <X size={16} />
                </Button>
              </div>
            </motion.div>
          )}
        </header>

        {/* Compact Toggle Button - Outside Header */}
        {!isMobile && (
          <div className="mb-4 flex justify-center">
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
                    className="h-8 w-8"
                  >
                    {isCompact ? (
                      <PanelLeftOpen size={16} />
                    ) : (
                      <PanelLeftClose size={16} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{isCompact ? "Espandi sidebar" : "Comprimi sidebar"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto md:gap-8">
          {/* General Navigation */}
          <div className="flex flex-col gap-2">
            <motion.h3
              className="px-2 text-xs font-medium tracking-wider uppercase opacity-60"
              animate={{
                opacity: isCompact ? 0 : 1,
                height: isCompact ? 0 : "auto",
                marginBottom: isCompact ? 0 : undefined,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              style={{
                overflow: "hidden",
              }}
            >
              Generale
            </motion.h3>
            {navigationData.navGeneral.map((item) => (
              <div key={item.title} className="min-w-0">
                {isCompact ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={item.url} aria-label={item.description}>
                          <Button
                            variant={
                              isActiveRoute(item.url) ? "outline" : "ghost"
                            }
                            className={`flex h-10 w-full min-w-0 items-center justify-center rounded-lg p-2 shadow-none transition-all duration-200 ${
                              isActiveRoute(item.url)
                                ? "bg-accent border-accent-foreground/20"
                                : "hover:bg-accent/50"
                            }`}
                          >
                            <item.icon
                              size={20}
                              className={`transition-colors duration-200 ${
                                isActiveRoute(item.url)
                                  ? "text-accent-foreground"
                                  : "text-muted-foreground"
                              }`}
                              aria-hidden="true"
                            />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Link href={item.url} aria-label={item.description}>
                    <Button
                      variant={isActiveRoute(item.url) ? "outline" : "ghost"}
                      className={`flex h-10 w-full min-w-0 items-center justify-start rounded-lg px-2 py-2 shadow-none transition-all duration-200 ${
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
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {item.title}
                      </span>
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Admin Navigation */}
          {authStore.isAdmin() && (
            <div className="flex flex-col gap-2">
              <motion.h3
                className="px-2 text-xs font-medium tracking-wider uppercase opacity-60"
                animate={{
                  opacity: isCompact ? 0 : 1,
                  height: isCompact ? 0 : "auto",
                  marginBottom: isCompact ? 0 : undefined,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                style={{
                  overflow: "hidden",
                }}
              >
                Amministrazione
              </motion.h3>
              {navigationData.navAdmin.map((item) => (
                <div key={item.title} className="min-w-0">
                  {isCompact ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={item.url} aria-label={item.description}>
                            <Button
                              variant={
                                isActiveRoute(item.url) ? "outline" : "ghost"
                              }
                              className={`flex h-10 w-full min-w-0 items-center justify-center rounded-lg p-2 shadow-none transition-all duration-200 ${
                                isActiveRoute(item.url)
                                  ? "bg-accent border-accent-foreground/20"
                                  : "hover:bg-accent/50"
                              }`}
                            >
                              <item.icon
                                size={20}
                                className={`transition-colors duration-200 ${
                                  isActiveRoute(item.url)
                                    ? "text-accent-foreground"
                                    : "text-muted-foreground"
                                }`}
                                aria-hidden="true"
                              />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Link href={item.url} aria-label={item.description}>
                      <Button
                        variant={isActiveRoute(item.url) ? "outline" : "ghost"}
                        className={`flex h-10 w-full min-w-0 items-center justify-start rounded-lg px-2 py-2 shadow-none transition-all duration-200 ${
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
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                          {item.title}
                        </span>
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
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
              className="hover:bg-accent/50 flex w-full items-center justify-start px-2 py-2 shadow-none"
              onClick={handleLogout}
              disabled={loading}
              aria-label="Logout"
            >
              <LogOut size={20} className="text-muted-foreground mr-2" />
              <span className="min-w-0 flex-1 text-sm font-medium">
                {loading ? "Disconnessione..." : "Logout"}
              </span>
            </Button>
          )}
        </div>
      </aside>

      {/* Compact Toggle Button - Between Sidebar and Content */}
      {!isMobile && (
        <div className="relative">
          <div className="absolute top-1/2 left-0 z-20 -translate-x-1/2 -translate-y-1/2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCompactToggle}
                    aria-label={
                      isCompact ? "Espandi sidebar" : "Comprimi sidebar"
                    }
                    className="h-8 w-8 rounded-full shadow-lg"
                  >
                    {isCompact ? (
                      <PanelLeftOpen size={16} />
                    ) : (
                      <PanelLeftClose size={16} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{isCompact ? "Espandi sidebar" : "Comprimi sidebar"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

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
                className="ring-border/50 rounded-lg object-cover ring-1"
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
