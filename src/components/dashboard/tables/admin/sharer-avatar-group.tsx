"use client";

import { type Sharer } from "@/app/api/api";
import {
  AvatarGroup,
  AvatarGroupTooltip,
} from "@/components/animate-ui/components/avatar-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Helper to get up to 2 initials, fallback to '?'
const getInitials = (name: string | undefined) => {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    // If only one part, take up to 2 letters
    return parts[0]?.slice(0, 2).toUpperCase() ?? "?";
  }
  // If two or more parts, take the first letter of the first two parts
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  const initials = (first + second).toUpperCase();
  return initials || "?";
};

// SharerAvatarGroup: Animated, modern avatar group for sharers, matching user-presence-avatar.tsx style
export function SharerAvatarGroup({ sharers }: { sharers: Sharer[] }) {
  // Show up to 3 avatars, stack them, and show a "+N" badge if more
  const maxVisible = 3;
  const visibleSharers = sharers.slice(0, maxVisible);
  const extraCount = sharers.length - maxVisible;

  return (
    <div className="flex items-center">
      {/* Animated avatar group container with improved contrast */}
      <div className="flex rounded-full bg-neutral-200/80 p-0.5 dark:bg-neutral-800/80">
        <AvatarGroup
          className="h-7 -space-x-2"
          tooltipProps={{ side: "top", sideOffset: 16 }}
        >
          {visibleSharers.map((sharer, idx) => (
            <Avatar
              key={sharer.nominativo + idx}
              className="size-7 border-2 border-neutral-200/80 shadow-sm dark:border-neutral-800/80"
            >
              <AvatarImage src={sharer.logo_url} alt={sharer.nominativo} />
              <AvatarFallback
                name={sharer.nominativo}
                size={28}
                className="text-foreground/90 bg-neutral-100 text-[10px] font-semibold dark:bg-neutral-700"
              >
                {getInitials(sharer.nominativo)}
              </AvatarFallback>
              <AvatarGroupTooltip>
                <span className="text-white">{sharer.nominativo}</span>
              </AvatarGroupTooltip>
            </Avatar>
          ))}
        </AvatarGroup>
        {extraCount > 0 && (
          <div
            className="text-foreground/90 ml-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-neutral-200/80 bg-neutral-100 text-[10px] font-semibold shadow-sm dark:border-neutral-800/80 dark:bg-neutral-700"
            title={`+${extraCount} altri`}
            aria-label={`+${extraCount} altri`}
          >
            +{extraCount}
          </div>
        )}
      </div>
    </div>
  );
}
