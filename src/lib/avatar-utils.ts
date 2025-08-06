export type AvatarVariant =
  | "marble"
  | "beam"
  | "pixel"
  | "sunset"
  | "ring"
  | "bauhaus";

export interface BoringAvatarProps {
  name: string;
  size?: number;
  variant?: AvatarVariant;
  colors?: string[];
  square?: boolean;
}

export function getInitials(name: string): string {
  if (!name) return "?";

  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarFallback(name: string): string {
  return getInitials(name);
}
