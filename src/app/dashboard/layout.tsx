"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/app/auth/sign-in/auth";
import { GridIcon } from "public/pikaiconsv2.0/solid/grid";
import { UserIcon } from "public/pikaiconsv2.0/solid/user";
import { FolderIcon } from "public/pikaiconsv2.0/solid/folder";
import { PlusSquareIcon } from "public/pikaiconsv2.0/solid/plus-square";
import { PencilEditSwooshIcon } from "public/pikaiconsv2.0/solid/pencil-edit-swoosh";
import { EnvelopeIcon } from "public/pikaiconsv2.0/solid/envelope";

{
  /** da rimuovere per gli admin */
}
const navigationData = {
  navGeneral: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: GridIcon,
    },
    {
      title: "Clienti",
      url: "#",
      icon: UserIcon,
      items: [
        {
          title: "Gestisci",
          url: "#",
        },
        {
          title: "Richieste",
          url: "#",
        },
      ],
    },
  ],
  navDocumenti: [
    {
      title: "Tutti",
      url: "#",
      icon: FolderIcon,
    },
    {
      title: "Condividi",
      url: "#",
      icon: PlusSquareIcon,
    },
    {
      title: "Gestisci",
      url: "#",
      icon: PencilEditSwooshIcon,
    },
    {
      title: "Richieste",
      url: "#",
      icon: EnvelopeIcon,
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
  const router = useRouter();
  const pathname = usePathname();
  const authStore = useAuthStore();

  useEffect(() => {
    if (!authStore.isAuthenticated()) {
      router.push("/auth/sign-in");
      return;
    }

    if (!authStore.isAdmin() && window.location.pathname.includes("/admin")) {
      router.push("/dashboard");
    }
  }, [authStore, router]);

  const userData = {
    name: authStore.user?.nominativo ?? authStore.user?.username ?? "Utente",
    role: authStore.user?.role ?? "",
    avatar: authStore.user?.avatar ?? "/avatars/user-placeholder.png",
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authStore.logout();
      router.push("/auth/sign-in");
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

  const adminNavItems = authStore.isAdmin()
    ? [
        {
          title: "Gestione Utenti",
          url: "/dashboard/admin/utenti",
          icon: UserIcon,
        },
        {
          title: "Impostazioni",
          url: "/dashboard/admin/settings",
          icon: GridIcon,
        },
      ]
    : [];

  const isActiveRoute = (url: string) => {
    if (url === "#") return false;
    return pathname === url;
  };

  if (!authStore.isAuthenticated()) {
    return null;
  }

  return (
    <main className="flex min-h-screen overflow-hidden bg-[#eaeced] transition-all duration-700 dark:bg-gray-900">
      <section
        id="sidebar"
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed z-30 m-2 w-[300px] flex-col gap-4 rounded-2xl bg-[#e1e4e6] p-3 transition-all duration-200 md:relative md:m-4 md:w-[300px] md:translate-x-0 md:p-4 dark:bg-gray-800`}
      >
        <header id="sidebarHeader" className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex h-[42px] w-full items-center justify-start gap-2">
              <Image
                src={userData.avatar}
                alt="User Avatar"
                width={42}
                height={42}
                className="rounded-lg"
              />
              <div className="flex-col">
                <h2 className="font-semibold dark:text-white">
                  {userData.name}
                </h2>
                <p className="text-xs opacity-50 dark:text-gray-300">
                  {userData.role}
                </p>
              </div>
            </div>
            <Button
              className="flex items-center gap-2"
              onClick={handleLogout}
              disabled={loading}
            >
              <LogOut size={20} className="dark:text-gray-300" />
            </Button>
          </div>
        </header>

        <nav id="sidebarContent" className="flex flex-col gap-6 md:gap-8">
          {/* Navigation sections */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm opacity-40 dark:text-gray-400">Generale</h3>
            {navigationData.navGeneral.map((item) => (
              <Link href={item.url} key={item.title}>
                <Button
                  variant={isActiveRoute(item.url) ? "outline" : "ghost"}
                  className="flex h-10 w-full items-center justify-start rounded-lg p-2 shadow-none dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                >
                  <item.icon size={20} className="mr-2" />
                  <span className="text-sm">{item.title}</span>
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm opacity-40 dark:text-gray-400">Documenti</h3>
            {navigationData.navDocumenti.map((item) => (
              <Link href={item.url} key={item.title}>
                <Button
                  variant={isActiveRoute(item.url) ? "outline" : "ghost"}
                  className="flex h-10 w-full items-center justify-start rounded-lg p-2 shadow-none dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                >
                  <item.icon size={20} className="mr-2" />
                  <span className="text-sm">{item.title}</span>
                </Button>
              </Link>
            ))}
          </div>

          {authStore.isAdmin() && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm opacity-40 dark:text-gray-400">
                Amministrazione
              </h3>
              {adminNavItems.map((item) => (
                <Link href={item.url} key={item.title}>
                  <Button
                    variant={isActiveRoute(item.url) ? "outline" : "ghost"}
                    className="flex h-10 w-full items-center justify-start rounded-lg p-2 shadow-none dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                  >
                    <item.icon size={20} className="mr-2" />
                    <span className="text-sm">{item.title}</span>
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </nav>
      </section>

      <section
        id="content"
        className="flex w-full flex-1 flex-col gap-3 p-3 md:gap-4 md:p-4"
      >
        {isMobile && (
          <Button
            variant="outline"
            size="icon"
            className="mb-2 md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
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
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span className="sr-only">Toggle Menu</span>
          </Button>
        )}
        {children}
      </section>

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </main>
  );
}
