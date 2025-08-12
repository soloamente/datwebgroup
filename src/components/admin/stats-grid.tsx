import { RiArrowRightUpLine } from "@remixicon/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface StatsCardProps {
  title: string;
  value: string;
  change: {
    value: string;
    trend: "up" | "down";
  };
  icon: React.ReactNode;
  href?: string;
  index?: number;
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  href = "/dashboard/admin",
  index = 0,
}: StatsCardProps) {
  const isPositive = change.trend === "up";
  const trendColor = isPositive ? "text-emerald-500" : "text-red-500";

  return (
    <div className="group before:from-input/30 before:via-input before:to-input/30 relative p-4 before:absolute before:inset-y-8 before:right-0 before:w-px before:bg-gradient-to-b last:before:hidden lg:p-5">
      <div className="relative flex items-center gap-4">
        <RiArrowRightUpLine
          className="absolute top-0 right-0 text-emerald-500 opacity-0 transition-opacity group-has-[a:hover]:opacity-100"
          size={20}
          aria-hidden="true"
        />
        {/* Icona */}
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-emerald-600/50 bg-emerald-600/25 text-emerald-500 max-[480px]:hidden">
          {icon}
        </div>
        {/* Contenuto */}
        <div>
          <Link
            href={href}
            className="text-muted-foreground/60 text-xs font-medium tracking-widest uppercase before:absolute before:inset-0"
          >
            {title}
          </Link>
          <div className="mb-2 text-2xl font-semibold">{value}</div>

          {/* Show percentage change for all cards if available */}
          {change.value && (
            <div className="text-muted-foreground/60 text-xs">
              <span className={cn("font-medium", trendColor)}>
                {isPositive ? "↗" : "↘"}{" "}
                {change.value.startsWith("0") ? "" : isPositive ? "+" : "-"}
                {change.value}
              </span>{" "}
              {index === 0 ? "vs mese precedente" : "vs mese scorsa"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatsGridProps {
  stats: StatsCardProps[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  // Dynamically set grid columns for 1-4 cards
  let gridCols = "";
  if (stats.length === 4) {
    gridCols = "grid-cols-1 sm:grid-cols-2 md:grid-cols-4";
  } else if (stats.length === 3) {
    gridCols = "grid-cols-1 sm:grid-cols-3";
  } else if (stats.length === 2) {
    gridCols = "grid-cols-1 sm:grid-cols-2";
  } else {
    gridCols = "grid-cols-1";
  }
  return (
    <div
      className={cn(
        "ring-border dark:from-sidebar/60 dark:to-sidebar bg-card grid rounded-2xl ring-1 dark:bg-gradient-to-br",
        gridCols,
      )}
    >
      {stats.map((stat, index) => (
        <StatsCard key={stat.title} {...stat} index={index} />
      ))}
    </div>
  );
}
