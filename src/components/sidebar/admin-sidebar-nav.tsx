"use client";

import useAuthStore from "@/app/api/auth";
import { SidebarNavLink } from "./sidebar-nav-link";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  description: string;
};

type AdminNavigationData = {
  navGeneral: NavItem[];
  navAdmin: NavItem[];
};

interface AdminSidebarNavProps {
  navigationData: AdminNavigationData;
  isCompact?: boolean;
  onExpandFromCompact?: () => void;
}

function NavSection({
  title,
  items,
  isCompact = false,
  onExpandFromCompact,
}: {
  title: string;
  items: NavItem[];
  isCompact?: boolean;
  onExpandFromCompact?: () => void;
}) {
  return (
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
        {title}
      </motion.h3>
      {items.map((item) => (
        <SidebarNavLink
          key={item.title}
          item={item}
          isCompact={isCompact}
          onExpandFromCompact={onExpandFromCompact}
        />
      ))}
    </div>
  );
}

export function AdminSidebarNav({
  navigationData,
  isCompact = false,
  onExpandFromCompact,
}: AdminSidebarNavProps) {
  const authStore = useAuthStore();

  return (
    <nav
      id="sidebarContent"
      className="flex flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto md:gap-8"
      aria-label="Main navigation"
    >
      <NavSection
        title="Generale"
        items={navigationData.navGeneral}
        isCompact={isCompact}
        onExpandFromCompact={onExpandFromCompact}
      />

      {authStore.isAdmin() && (
        <NavSection
          title="Amministrazione"
          items={navigationData.navAdmin}
          isCompact={isCompact}
          onExpandFromCompact={onExpandFromCompact}
        />
      )}
    </nav>
  );
}
