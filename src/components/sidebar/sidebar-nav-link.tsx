import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface SidebarNavLinkProps {
  item: {
    title: string;
    url: string;
    icon:
      | LucideIcon
      | React.ComponentType<{ size?: number; className?: string }>;
    description: string;
  };
  isCompact?: boolean;
}

export function SidebarNavLink({
  item,
  isCompact = false,
}: SidebarNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === item.url;

  if (isCompact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={item.url} aria-label={item.description}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
              >
                <Button
                  variant={isActive ? "outline" : "ghost"}
                  className={`flex h-10 w-full items-center justify-center rounded-lg p-2 shadow-none transition-all duration-200 ${
                    isActive
                      ? "bg-accent border-accent-foreground/20"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <item.icon
                    size={20}
                    className={`transition-colors duration-200 ${
                      isActive
                        ? "text-accent-foreground"
                        : "text-muted-foreground"
                    }`}
                    aria-hidden="true"
                  />
                </Button>
              </motion.div>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Link href={item.url} aria-label={item.description}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        className="min-w-0"
      >
        <Button
          variant={isActive ? "outline" : "ghost"}
          className={`flex h-10 w-full min-w-0 items-center justify-start px-2 py-2 shadow-none transition-all duration-200 ${
            isActive
              ? "bg-accent border-accent-foreground/20"
              : "hover:bg-accent/50"
          }`}
        >
          <item.icon
            size={20}
            className={`transition-colors duration-200 ${
              isActive ? "text-accent-foreground" : "text-muted-foreground"
            }`}
            aria-hidden="true"
          />
          <span className="truncate text-sm font-medium">{item.title}</span>
        </Button>
      </motion.div>
    </Link>
  );
}
