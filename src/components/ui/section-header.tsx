import { cn } from "@/lib/utils";
import type { RemixiconComponentType } from "@remixicon/react";

interface SectionHeaderProps {
  icon: RemixiconComponentType;
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export const SectionHeader = ({
  icon: Icon,
  title,
  children,
  className,
}: SectionHeaderProps) => (
  <div className={cn("flex items-center justify-between", className)}>
    <h3 className="flex items-center gap-3 text-xl font-semibold">
      <Icon className="size-6" />
      {title}
    </h3>
    {children}
  </div>
);
