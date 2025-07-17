"use client";

import useAuthStore from "@/app/api/auth";
import { SidebarNavLink } from "./sidebar-nav-link";
import { SidebarCollapsibleNav } from "./sidebar-collapsible-nav";
import type { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

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
  isCompact?: boolean;
  onExpandFromCompact?: () => void;
}

function NavSection({
  title,
  items,
  isCompact = false,
}: {
  title: string;
  items: NavItem[];
  isCompact?: boolean;
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
        <SidebarNavLink key={item.title} item={item} isCompact={isCompact} />
      ))}
    </div>
  );
}

export function SidebarNav({
  navigationData,
  isCompact = false,
  onExpandFromCompact,
}: SidebarNavProps) {
  const authStore = useAuthStore();
  const userRole = authStore.user?.role;

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
      />

      {userRole === "sharer" && (
        <NavSection
          title="Amministrazione"
          items={navigationData.navSharer}
          isCompact={isCompact}
        />
      )}

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
          Documenti
        </motion.h3>
        {navigationData.navDocumenti.map((item) => {
          if (item.title === "Documenti") {
            return (
              <SidebarCollapsibleNav
                key={item.title}
                item={item}
                isCompact={isCompact}
                onExpandFromCompact={onExpandFromCompact}
              />
            );
          }
          return (
            <SidebarNavLink
              key={item.title}
              item={item}
              isCompact={isCompact}
            />
          );
        })}
      </div>
    </nav>
  );
}
