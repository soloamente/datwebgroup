"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | undefined;
  badge: {
    text: string;
    color: "green" | "blue" | "amber" | "purple";
  };
  icon: LucideIcon;
  isLoading: boolean;
}

export default function StatCard({
  title,
  value,
  badge,
  icon: Icon,
  isLoading,
}: StatCardProps) {
  const badgeColors = {
    green:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    amber:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    purple:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <Card className="flex h-full flex-col justify-between p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-base font-medium text-gray-800 md:text-lg dark:text-white">
          {title}
        </h3>
      </div>
      <div className="mt-auto flex items-end justify-between">
        {isLoading ? (
          <Skeleton className="h-12 w-20" />
        ) : (
          <h1 className="text-5xl font-semibold text-gray-900 md:text-6xl dark:text-white">
            {value}
          </h1>
        )}
        <Badge
          className={`ml-2 h-8 rounded-full border-0 ${badgeColors[badge.color]} px-3`}
        >
          {badge.text}
        </Badge>
      </div>
    </Card>
  );
}
