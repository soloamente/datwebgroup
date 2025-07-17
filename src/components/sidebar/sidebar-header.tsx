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
  return (
    <header id="sidebarHeader" className="mb-6 md:mb-8">
      {isCompact ? (
        // Compact layout - centered avatar only
        <div className="flex justify-center">
          <motion.div
            animate={{
              width: 36,
              height: 36,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="flex-shrink-0"
          >
            <Image
              src={userData.avatar}
              alt={`Avatar di ${userData.name}`}
              width={42}
              height={42}
              className="ring-border/50 h-full w-full rounded-lg object-cover ring-1 transition-all duration-200"
              priority
            />
          </motion.div>
        </div>
      ) : (
        // Expanded layout - full header with avatar, text, and buttons
        <motion.div
          className="flex items-center justify-between"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          {/* Avatar and User Info */}
          <motion.div
            className="flex h-[42px] w-full min-w-0 items-center gap-2"
            animate={{
              width: "100%",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <motion.div
              animate={{
                width: 42,
                height: 42,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="flex-shrink-0"
            >
              <Image
                src={userData.avatar}
                alt={`Avatar di ${userData.name}`}
                width={42}
                height={42}
                className="ring-border/50 h-full w-full rounded-lg object-cover ring-1 transition-all duration-200"
                priority
              />
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
