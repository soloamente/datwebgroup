"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useDocumentClasses } from "@/hooks/use-document-classes";
import type { LucideIcon } from "lucide-react";
import { slugify } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SidebarCollapsibleNavProps {
  item: {
    title: string;
    url: string;
    icon:
      | LucideIcon
      | React.ComponentType<{ size?: number; className?: string }>;
    description: string;
  };
}

function CollapsibleNavLink({ url, name }: { url: string; name: string }) {
  const pathname = usePathname();
  const isActive = pathname === url;

  return (
    <Link href={url} aria-label={name}>
      <Button
        variant={isActive ? "outline" : "ghost"}
        className={`flex h-9 w-full items-center justify-start rounded-md p-2 text-left shadow-none transition-all duration-200 ${
          isActive
            ? "bg-accent border-accent-foreground/20"
            : "hover:bg-accent/50"
        }`}
      >
        <span className="text-sm">{name}</span>
      </Button>
    </Link>
  );
}

export function SidebarCollapsibleNav({ item }: SidebarCollapsibleNavProps) {
  const pathname = usePathname();
  const { documentClasses, isLoading } = useDocumentClasses();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const isActive = pathname.startsWith(item.url);

  return (
    <div>
      <Button
        variant={isActive ? "outline" : "ghost"}
        className={`flex h-10 w-full items-center justify-start rounded-lg p-2 shadow-none transition-all duration-200 ${
          isActive
            ? "bg-accent border-accent-foreground/20"
            : "hover:bg-accent/50"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <item.icon
          size={20}
          className={`transition-colors duration-200 ${
            isActive ? "text-accent-foreground" : "text-muted-foreground"
          }`}
          aria-hidden="true"
        />
        <span className="text-sm font-medium">{item.title}</span>
        <div className="ml-auto flex items-center gap-2">
          {!isLoading && documentClasses.length > 0 && (
            <Badge variant="outline" className="h-5">
              {documentClasses.length}
            </Badge>
          )}
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </Button>
      {isOpen && (
        <div className="border-border mt-2 ml-4 flex flex-col gap-1 border-l pl-4">
          {isLoading ? (
            <p className="text-muted-foreground p-2 text-sm">Caricamento...</p>
          ) : (
            documentClasses.map((docClass) => (
              <CollapsibleNavLink
                key={docClass.id}
                url={`${item.url}/${slugify(docClass.name)}`}
                name={docClass.name}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
