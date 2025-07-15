import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface SidebarNavLinkProps {
  item: {
    title: string;
    url: string;
    icon:
      | LucideIcon
      | React.ComponentType<{ size?: number; className?: string }>;
    description: string;
  };
}

export function SidebarNavLink({ item }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === item.url;

  return (
    <Link href={item.url} aria-label={item.description}>
      <Button
        variant={isActive ? "outline" : "ghost"}
        className={`flex h-10 w-full items-center justify-start rounded-lg p-2 shadow-none transition-all duration-200 ${
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
        <span className="text-sm font-medium">{item.title}</span>
      </Button>
    </Link>
  );
}
