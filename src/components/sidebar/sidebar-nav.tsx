"use client";

import useAuthStore from "@/app/api/auth";
import { SidebarNavLink } from "./sidebar-nav-link";
import { SidebarCollapsibleNav } from "./sidebar-collapsible-nav";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  description: string;
};

type NavigationData = {
  navGeneral: NavItem[];
  navSharer: NavItem[];
  navDocumenti: NavItem[];
};

interface SidebarNavProps {
  navigationData: NavigationData;
}

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="px-2 text-xs font-medium tracking-wider uppercase opacity-60">
        {title}
      </h3>
      {items.map((item) => (
        <SidebarNavLink key={item.title} item={item} />
      ))}
    </div>
  );
}

export function SidebarNav({ navigationData }: SidebarNavProps) {
  const authStore = useAuthStore();
  const userRole = authStore.user?.role;

  return (
    <nav
      id="sidebarContent"
      className="flex flex-1 flex-col gap-6 overflow-y-auto md:gap-8"
      aria-label="Main navigation"
    >
      <NavSection title="Generale" items={navigationData.navGeneral} />

      {userRole === "sharer" && (
        <NavSection title="Amministrazione" items={navigationData.navSharer} />
      )}

      <div className="flex flex-col gap-2">
        <h3 className="px-2 text-xs font-medium tracking-wider uppercase opacity-60">
          Documenti
        </h3>
        {navigationData.navDocumenti.map((item) => {
          if (item.title === "Documenti") {
            return <SidebarCollapsibleNav key={item.title} item={item} />;
          }
          return <SidebarNavLink key={item.title} item={item} />;
        })}
      </div>
    </nav>
  );
}
