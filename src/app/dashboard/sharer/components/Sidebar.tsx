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
      url: "/dashboard/sharer",
      icon: GridIcon,
      description: "Vai alla dashboard principale",
    },
  ],

  navSharer: [
    {
      title: "Gestione Utenti",
      url: "/dashboard/sharer/utenti",
      icon: UserIcon,
      description: "Gestisci gli utenti del sistema",
    },
  ],
};

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [loading, setLoading] = useState(false);
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
      } fixed z-30 m-2 w-[300px] flex-col gap-4 rounded-2xl bg-[#e1e4e6] p-3 transition-all duration-200 md:relative md:m-4 md:w-[300px] md:translate-x-0 md:p-4`}
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
        {authStore.user?.role === "sharer" && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm opacity-40">Amministrazione</h3>
            {navigationData.navSharer.map((item) => (
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
  );
}
