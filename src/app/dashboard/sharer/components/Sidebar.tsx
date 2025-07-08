"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/app/api/auth";
import { GridIcon } from "public/pikaiconsv2.0/solid/grid";
import { UserIcon } from "public/pikaiconsv2.0/solid/user";
import { FolderIcon } from "public/pikaiconsv2.0/solid/folder";
import { DocumentIcon } from "@/components/icons/document";
import { getMyDocumentClasses, type MyDocumentClass } from "@/app/api/api";

const navigationData = {
  navGeneral: [
    {
      title: "Dashboard",
      url: "/dashboard/sharer",
      icon: GridIcon,
      description: "Vai alla dashboard principale",
    },
  ],

  navSharer: [
    {
      title: "Gestione Clienti",
      url: "/dashboard/sharer/utenti",
      icon: UserIcon,
      description: "Gestisci gli utenti del sistema",
    },
  ],

  navDocumenti: [
    {
      title: "Condividi Documenti",
      url: "/dashboard/sharer/documenti",
      icon: DocumentIcon,
      description: "Condividi i documenti con gli utenti",
    },
    {
      title: "Documenti",
      url: "/dashboard/sharer/documenti/condivisi",
      icon: FolderIcon,
      description: "Gestisci i documenti condivisi",
    },
  ],
};

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const slugify = (text: string) =>
  text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const authStore = useAuthStore();
  const [documentClasses, setDocumentClasses] = useState<MyDocumentClass[]>([]);
  const [isDocClassesVisible, setDocClassesVisible] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchDocumentClasses = async () => {
      if (authStore.user?.role === "sharer") {
        try {
          const response = await getMyDocumentClasses();
          setDocumentClasses(response.data);
        } catch (error) {
          console.error("Errore nel recupero delle classi documentali:", error);
        }
      }
    };

    if (isMounted) {
      void fetchDocumentClasses();
    }
  }, [authStore.user?.role, isMounted]);

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
    return pathname === url;
  };

  return (
    <aside
      id="sidebar"
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } bg-sidebar fixed z-30 m-2 flex h-[calc(100vh-1rem)] w-[300px] flex-col gap-4 rounded-2xl border p-3 transition-all duration-300 ease-in-out md:sticky md:top-4 md:m-4 md:h-[calc(100vh-2rem)] md:w-[300px] md:translate-x-0 md:p-4`}
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
            onClick={onToggle}
            aria-label="Chiudi sidebar"
          >
            <X size={18} />
          </Button>
        </div>
      </header>

      <nav
        id="sidebarContent"
        className="flex flex-1 flex-col gap-6 overflow-y-auto md:gap-8"
        aria-label="Main navigation"
      >
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
        {authStore.user?.role === "sharer" && (
          <div className="flex flex-col gap-2">
            <h3 className="px-2 text-xs font-medium tracking-wider uppercase opacity-60">
              Amministrazione
            </h3>
            {navigationData.navSharer.map((item) => (
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
        {/* Documenti Navigation */}
        <div className="flex flex-col gap-2">
          <h3 className="px-2 text-xs font-medium tracking-wider uppercase opacity-60">
            Documenti
          </h3>
          {navigationData.navDocumenti.map((item) => {
            if (item.title === "Documenti") {
              if (!isMounted) return null;

              return (
                <div key={item.title}>
                  <Button
                    variant={
                      pathname.startsWith(item.url) ? "outline" : "ghost"
                    }
                    className={`flex h-10 w-full items-center justify-between rounded-lg p-2 shadow-none transition-all duration-200 ${
                      pathname.startsWith(item.url)
                        ? "bg-accent border-accent-foreground/20"
                        : "hover:bg-accent/50"
                    }`}
                    onClick={() => setDocClassesVisible(!isDocClassesVisible)}
                  >
                    <div className="flex items-center">
                      <item.icon
                        size={20}
                        className={`mr-2 transition-colors duration-200 ${
                          pathname.startsWith(item.url)
                            ? "text-accent-foreground"
                            : "text-muted-foreground"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        isDocClassesVisible ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                  {isDocClassesVisible && (
                    <div className="border-border mt-2 ml-4 flex flex-col gap-1 border-l pl-4">
                      {documentClasses.map((docClass) => {
                        const docClassUrl = `${
                          item.url
                        }/${slugify(docClass.name)}`;
                        return (
                          <Link
                            href={docClassUrl}
                            key={docClass.id}
                            aria-label={docClass.name}
                          >
                            <Button
                              variant={
                                isActiveRoute(docClassUrl) ? "outline" : "ghost"
                              }
                              className={`flex h-9 w-full items-center justify-start rounded-md p-2 text-left shadow-none transition-all duration-200 ${
                                isActiveRoute(docClassUrl)
                                  ? "bg-accent border-accent-foreground/20"
                                  : "hover:bg-accent/50"
                              }`}
                            >
                              <span className="text-sm">{docClass.name}</span>
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            return (
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
            );
          })}
        </div>
      </nav>

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
  );
}
