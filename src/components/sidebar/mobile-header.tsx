"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
    </div>
  );
}
