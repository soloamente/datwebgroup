"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { userService, type AdminTopSharer } from "@/app/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { GoTrophy } from "react-icons/go";
import {
  FaTrophy,
  Fa2,
  Fa3,
  Fa4,
  Fa5,
  Fa6,
  Fa7,
  Fa8,
  Fa9,
} from "react-icons/fa6";
import { MonthFilter } from "@/components/filters/month-filter";

export default function TopSharerStatsCard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topSharers, setTopSharers] = useState<AdminTopSharer[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await userService.getAdminTopSharerStats(selectedMonths);
        if (mounted && res?.success && res.data?.top_sharers) {
          setTopSharers(res.data.top_sharers.slice(0, 10));
        }
      } catch {
        if (mounted)
          setError("Impossibile caricare le statistiche top sharer.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [selectedMonths]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-muted/20 ring-border h-full gap-0 border-none p-1 ring-1">
        <CardHeader className="items-center justify-center pt-2 pr-2 pb-3 pl-4 uppercase">
          <div className="flex w-full items-center justify-between">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm sm:text-sm">
              <GoTrophy className="h-3 w-3 sm:h-4 sm:w-4" />
              Classifica Utenti
            </CardTitle>
            <MonthFilter
              selectedMonths={selectedMonths}
              onMonthsChange={setSelectedMonths}
              className="ml-auto"
            />
          </div>
        </CardHeader>
        <CardContent className="bg-card ring-border flex h-full flex-col gap-2 rounded-lg p-3 ring-1 sm:gap-3 sm:rounded-lg sm:p-4">
          {isLoading && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full sm:h-10" />
              ))}
            </div>
          )}
          {!isLoading && error && (
            <div className="text-xs text-red-500 sm:text-sm">{error}</div>
          )}
          {!isLoading && !error && (
            <ul className="divide-border divide-y">
              {topSharers.map((s, idx) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-2 py-2 sm:gap-4"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
                    {/* Rank icon */}
                    <span aria-hidden className="shrink-0">
                      {idx === 0 ? (
                        <FaTrophy className="size-4 text-amber-500 sm:size-5" />
                      ) : idx === 1 ? (
                        <Fa2 className="text-muted-foreground size-4 sm:size-5" />
                      ) : idx === 2 ? (
                        <Fa3 className="text-muted-foreground size-4 sm:size-5" />
                      ) : idx === 3 ? (
                        <Fa4 className="text-muted-foreground size-4 sm:size-5" />
                      ) : idx === 4 ? (
                        <Fa5 className="text-muted-foreground size-4 sm:size-5" />
                      ) : idx === 5 ? (
                        <Fa6 className="text-muted-foreground size-4 sm:size-5" />
                      ) : idx === 6 ? (
                        <Fa7 className="text-muted-foreground size-4 sm:size-5" />
                      ) : idx === 7 ? (
                        <Fa8 className="text-muted-foreground size-4 sm:size-5" />
                      ) : idx === 8 ? (
                        <Fa9 className="text-muted-foreground size-4 sm:size-5" />
                      ) : (
                        <span className="text-muted-foreground block w-4 text-center text-xs sm:w-5">
                          {idx + 1}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium sm:text-sm">
                        {s.nominativo}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {s.username} • {s.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <Badge className="bg-primary/10 text-primary ring-primary/40 border-none px-1 py-0.5 text-xs ring-1 sm:px-2 sm:py-1">
                      <span className="hidden sm:inline">
                        {s.total_files.toLocaleString("it-IT")} file
                      </span>
                      <span className="sm:hidden">
                        {s.total_files.toLocaleString("it-IT")}
                      </span>
                    </Badge>
                    <Badge className="bg-muted/20 text-muted-foreground ring-border border-none px-1 py-0.5 text-xs ring-1 sm:px-2 sm:py-1">
                      <span className="hidden sm:inline">
                        {s.total_batches.toLocaleString("it-IT")} batch
                      </span>
                      <span className="sm:hidden">
                        {s.total_batches.toLocaleString("it-IT")}
                      </span>
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
