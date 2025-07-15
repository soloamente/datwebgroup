import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface UserData {
  name: string;
  role?: string;
  avatar: string;
}

interface SidebarHeaderProps {
  userData: UserData;
  onToggle: () => void;
}

export function SidebarHeader({ userData, onToggle }: SidebarHeaderProps) {
  return (
    <header id="sidebarHeader" className="mb-6 md:mb-8">
      <div className="flex items-center justify-between">
        <div className="flex h-[42px] w-full items-center justify-start gap-2">
          <Image
            src={userData.avatar}
            alt={`Avatar di ${userData.name}`}
            width={42}
            height={42}
            className="ring-border/50 rounded-lg ring-1"
            priority
          />
          <div className="flex-col">
            <h2 className="text-sm font-semibold">{userData.name}</h2>
            {userData.role && (
              <p className="text-xs capitalize opacity-60">{userData.role}</p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onToggle}
          aria-label="Chiudi sidebar"
        >
          <X size={18} />
        </Button>
      </div>
    </header>
  );
}
