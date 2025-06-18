import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Type for each action in the dropdown
export interface ActionsDropdownAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (event: React.MouseEvent | React.KeyboardEvent) => void;
  disabled?: boolean;
  destructive?: boolean;
  show?: boolean; // Optional: for conditional rendering
  ariaLabel?: string;
}

export interface ActionsDropdownProps {
  actions: ActionsDropdownAction[];
  triggerAriaLabel?: string;
  align?: "start" | "center" | "end";
  className?: string;
}

/**
 * Reusable, accessible dropdown menu for row/table actions.
 * - Uses Radix DropdownMenu for accessibility and animation.
 * - Accepts an array of actions (icon, label, onClick, etc.).
 * - Visually separates destructive actions.
 * - Keyboard and screen reader accessible.
 */
export const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  actions,
  triggerAriaLabel = "Azioni",
  align = "end",
  className,
}) => {
  // Split actions into normal and destructive for visual separation
  const normalActions = actions.filter(
    (a) => !a.destructive && (a.show ?? true),
  );
  const destructiveActions = actions.filter(
    (a) => a.destructive && (a.show ?? true),
  );

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                aria-label={triggerAriaLabel}
                className="text-muted-foreground/60 focus-visible:ring-primary/70 shadow-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <MoreVertical size={20} aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            {triggerAriaLabel}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent
        align={align}
        className={cn("min-w-[180px] p-1", className)}
      >
        <DropdownMenuGroup>
          {normalActions.map((action, idx) => (
            <DropdownMenuItem
              key={action.label}
              onClick={action.onClick}
              disabled={action.disabled}
              aria-label={action.ariaLabel ?? action.label}
              className="focus:bg-muted/60 hover:bg-muted/60 focus:text-foreground hover:text-foreground transition-colors"
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              <span>{action.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        {normalActions.length > 0 && destructiveActions.length > 0 && (
          <DropdownMenuSeparator />
        )}
        {destructiveActions.length > 0 && (
          <DropdownMenuGroup>
            {destructiveActions.map((action) => (
              <DropdownMenuItem
                key={action.label}
                onClick={action.onClick}
                disabled={action.disabled}
                aria-label={action.ariaLabel ?? action.label}
                className="focus:bg-destructive/10 hover:bg-destructive/10 text-destructive focus:text-destructive hover:text-destructive transition-colors"
              >
                {action.icon && (
                  <span className="text-destructive mr-2">{action.icon}</span>
                )}
                <span>{action.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Usage example (see sharer-table.tsx for integration):
// <ActionsDropdown actions={[{ label: 'Edit', icon: <EditIcon />, onClick: ... }]} />
