"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/app/api/auth";
import { GridIcon } from "public/pikaiconsv2.0/solid/grid";
import { UserIcon } from "public/pikaiconsv2.0/solid/user";
import { FolderIcon } from "public/pikaiconsv2.0/solid/folder";
import { PlusSquareIcon } from "public/pikaiconsv2.0/solid/plus-square";
import { PencilEditSwooshIcon } from "public/pikaiconsv2.0/solid/pencil-edit-swoosh";
import { EnvelopeIcon } from "public/pikaiconsv2.0/solid/envelope";
import { ListChecksIcon } from "lucide-react";

const navigationData = {
  navGeneral: [
    {
      title: "Dashboard",
      url: "/dashboard/admin",
      icon: GridIcon,
      description: "Vai alla dashboard principale",
    },
  ],

  navAdmin: [
    {
      title: "Gestione Utenti",
      url: "/dashboard/admin/utenti/lista-sharer",
      icon: FolderIcon,
      description: "Visualizza e gestisci gli sharer",
    },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const authStore = useAuthStore();

  const userData = {
    name: authStore.user?.nominativo ?? authStore.user?.username ?? "Utente",
    role: authStore.user?.role,
    avatar: authStore.user?.avatar ?? "/avatars/user-placeholder.png",
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authStore.logout();
      router.push("/sign-in");
    } catch (error) {
      console.error("Errore durante il logout:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActiveRoute = (url: string) => {
    if (url === "#") return false;
    return pathname === url;
  };

  const handleSidebarToggle = () => {
    setIsTransitioning(true);
    setSidebarOpen(!sidebarOpen);
    setTimeout(() => setIsTransitioning(false), 200);
  };

  return (
    <main className="flex min-h-screen overflow-hidden transition-all duration-700">
      <aside
        id="sidebar"
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-sidebar fixed z-30 m-2 w-[300px] flex-col gap-4 rounded-2xl p-3 transition-all duration-200 md:relative md:m-4 md:w-[300px] md:translate-x-0 md:p-4`}
        aria-label="Sidebar"
      >
        <header id="sidebarHeader" className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex h-[42px] w-full items-center justify-start gap-2">
              <Image
                src={userData.avatar}
                alt={`Avatar di ${userData.name}`}
                width={42}
                height={42}
                className="rounded-lg"
                priority
              />
              <div className="flex-col">
                <h2 className="font-semibold">{userData.name}</h2>
                <p className="text-xs opacity-50">{userData.role}</p>
              </div>
            </div>
            <Button
              className="flex items-center gap-2"
              onClick={handleLogout}
              disabled={loading}
              aria-label="Logout"
            >
              <LogOut size={20} className="" />
            </Button>
          </div>
        </header>

        <nav
          id="sidebarContent"
          className="flex flex-col gap-6 md:gap-8"
          aria-label="Main navigation"
        >
          {/* General Navigation */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm opacity-40">Generale</h3>
            {navigationData.navGeneral.map((item) => (
              <div key={item.title}>
                <Link href={item.url} aria-label={item.description}>
                  <Button
                    variant={isActiveRoute(item.url) ? "outline" : "ghost"}
                    className="flex h-10 w-full items-center justify-start rounded-lg p-2 shadow-none"
                  >
                    <item.icon size={20} className="mr-2" aria-hidden="true" />
                    <span className="text-sm">{item.title}</span>
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Admin Navigation */}
          {authStore.isAdmin() && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm opacity-40">Amministrazione</h3>
              {navigationData.navAdmin.map((item) => (
                <Link
                  href={item.url}
                  key={item.title}
                  aria-label={item.description}
                >
                  <Button
                    variant={isActiveRoute(item.url) ? "outline" : "ghost"}
                    className="flex h-10 w-full items-center justify-start rounded-lg p-2 shadow-none"
                  >
                    <item.icon size={20} className="mr-2" aria-hidden="true" />
                    <span className="text-sm">{item.title}</span>
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </nav>
      </aside>

      <section
        id="content"
        className="flex w-full flex-1 flex-col gap-3 p-3 md:gap-4 md:p-4"
      >
        {isMobile && (
          <Button
            variant="outline"
            size="icon"
            className="mb-2 md:hidden"
            onClick={handleSidebarToggle}
            aria-label={sidebarOpen ? "Chiudi menu" : "Apri menu"}
            aria-expanded={sidebarOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </Button>
        )}
        <div
          className={`transition-opacity duration-200 ${isTransitioning ? "opacity-50" : "opacity-100"}`}
        >
          {children}
        </div>
      </section>

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </main>
  );
}
