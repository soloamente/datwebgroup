"use client";

import { useState, useEffect } from "react";
import useAuthStore from "@/app/api/auth";
import { GridIcon } from "public/pikaiconsv2.0/solid/grid";
import { UserIcon } from "public/pikaiconsv2.0/solid/user";
import { FolderIcon } from "public/pikaiconsv2.0/solid/folder";
import { DocumentIcon } from "@/components/icons/document";
import { SidebarHeader } from "@/components/sidebar/sidebar-header";
import { SidebarNav } from "@/components/sidebar/sidebar-nav";
import { LogoutButton } from "@/components/sidebar/logout-button";

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

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const authStore = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  const userData = {
    name: authStore.user?.nominativo ?? authStore.user?.username ?? "Utente",
    role: authStore.user?.role,
    avatar: authStore.user?.avatar ?? "/avatars/user-placeholder.png",
  };

  return (
    <aside
      id="sidebar"
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } bg-sidebar fixed z-30 m-2 flex h-[calc(100vh-1rem)] w-[300px] flex-col gap-4 rounded-2xl border p-3 transition-all duration-300 ease-in-out md:sticky md:top-4 md:m-4 md:h-[calc(100vh-2rem)] md:w-[300px] md:translate-x-0 md:p-4`}
      aria-label="Sidebar"
    >
      <SidebarHeader userData={userData} onToggle={onToggle} />
      <SidebarNav navigationData={navigationData} />
      <LogoutButton />
    </aside>
  );
}
