import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSharerLogo } from "@/hooks/use-sharer-logo";

interface UserData {
  name: string;
  role?: string;
  avatar: string;
}

interface SidebarHeaderProps {
  userData: UserData;
  onToggle: () => void;
  isCompact?: boolean;
  onCompactToggle?: () => void;
}

export function SidebarHeader({
  userData,
  onToggle,
  isCompact = false,
  onCompactToggle,
}: SidebarHeaderProps) {
  // Use the sharer logo hook to fetch the user's logo
  const { logoUrl, isLoading, error } = useSharerLogo();
  
  // Determine the avatar source: use sharer logo if available, otherwise fall back to userData.avatar
  const avatarSrc = logoUrl ?? userData.avatar;

  return (
    <header id="sidebarHeader" className="mb-6 md:mb-8">
      {isCompact ? (
        // Compact layout - centered avatar only
        <div className="flex justify-center">
          <motion.div
            layout
            initial={false}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="h-10 w-10 flex-shrink-0"
          >
            <Avatar className="ring-border/50 h-full w-full rounded-lg ring-1">
              <AvatarImage
                src={avatarSrc}
                alt={`Avatar di ${userData.name}`}
              />
              <AvatarFallback name={userData.name} size={40} variant="beam" />
            </Avatar>
          </motion.div>
        </div>
      ) : (
        // Expanded layout - full header with avatar, text, and buttons
        <motion.div
          layout
          initial={false}
          className="flex items-center justify-between"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {/* Avatar and User Info */}
          <motion.div
            layout
            initial={false}
            className="flex h-10 w-full min-w-0 items-center gap-2"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <motion.div
              layout
              initial={false}
              className="h-10 w-10 flex-shrink-0"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Avatar className="ring-border/50 h-full w-full rounded-lg ring-1">
                <AvatarImage
                  src={avatarSrc}
                  alt={`Avatar di ${userData.name}`}
                />
                <AvatarFallback name={userData.name} size={40} variant="beam" />
              </Avatar>
            </motion.div>

            {/* User Info - Smooth and clean animations */}
            <div className="min-w-0 flex-1 flex-col overflow-hidden">
              <h2 className="truncate text-sm font-semibold">
                {userData.name}
              </h2>
              {userData.role && (
                <p className="truncate text-xs capitalize opacity-60">
                  {userData.role}
                </p>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-1">
            {onCompactToggle && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={onCompactToggle}
                      aria-label="Comprimi sidebar"
                    >
                      <PanelLeftClose size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Comprimi sidebar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden"
              onClick={onToggle}
              aria-label="Chiudi sidebar"
            >
              <X size={16} />
            </Button>
          </div>
        </motion.div>
      )}
    </header>
  );
}
