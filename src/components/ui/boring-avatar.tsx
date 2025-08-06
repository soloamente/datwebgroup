"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { Avatar as BoringAvatar } from "boring-avatars";

import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/avatar-utils";

interface BoringAvatarFallbackProps
  extends React.ComponentProps<typeof AvatarPrimitive.Fallback> {
  name: string;
  size?: number;
  variant?: "marble" | "beam" | "pixel" | "sunset" | "ring" | "bauhaus";
  colors?: string[];
  square?: boolean;
}

function BoringAvatarFallback({
  className,
  name,
  size = 40,
  variant = "marble",
  colors = ["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"],
  square = false,
  ...props
}: BoringAvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <BoringAvatar
        size={size}
        name={name}
        variant={variant}
        colors={colors}
        square={square}
      />
    </AvatarPrimitive.Fallback>
  );
}

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, BoringAvatarFallback };
