"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Image from "next/image";

interface UserData {
  name: string;
  role?: string;
  avatar: string;
}

interface MobileHeaderProps {
  userData: UserData;
  onToggle: () => void;
  sidebarOpen: boolean;
}

export function MobileHeader({
  userData,
  onToggle,
  sidebarOpen,
}: MobileHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-3 md:hidden">
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10"
        onClick={onToggle}
        aria-label="Apri menu"
        aria-expanded={sidebarOpen}
      >
        <Menu size={20} />
      </Button>
      <div className="flex items-center gap-2">
        <Image
          src={userData.avatar}
          alt={`Avatar di ${userData.name}`}
          width={32}
          height={32}
          className="ring-border/50 rounded-lg object-cover ring-1"
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{userData.name}</span>
          <span className="text-xs capitalize opacity-60">{userData.role}</span>
        </div>
      </div>
    </div>
  );
}
