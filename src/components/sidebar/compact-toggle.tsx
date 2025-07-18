"use client";

import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CompactToggleProps {
  isCompact: boolean;
  onToggle: () => void;
  position?: "sidebar" | "floating";
  className?: string;
}

export function CompactToggle({
  isCompact,
  onToggle,
  position = "sidebar",
  className = "",
}: CompactToggleProps) {
  const baseClassName = "h-8 w-8";
  const buttonClassName =
    position === "floating"
      ? `${baseClassName} rounded-full shadow-lg`
      : baseClassName;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={position === "floating" ? "outline" : "ghost"}
            size="icon"
            onClick={onToggle}
            aria-label={isCompact ? "Espandi sidebar" : "Comprimi sidebar"}
            className={`${buttonClassName} ${className}`}
          >
            {isCompact ? (
              <PanelLeftOpen size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side={position === "floating" ? "bottom" : "right"}>
          <p>{isCompact ? "Espandi sidebar" : "Comprimi sidebar"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
