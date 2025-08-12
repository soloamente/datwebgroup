"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { userService, type AdminTopSharer } from "@/app/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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

export default function TopSharerStatsCard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topSharers, setTopSharers] = useState<AdminTopSharer[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await userService.getAdminTopSharerStats();
        if (mounted && res?.success && res.data?.top_sharers) {
          setTopSharers(res.data.top_sharers.slice(0, 10));
        }
      } catch (e) {
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
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-muted/20 ring-border h-full gap-0 border-none p-0 ring-1">
        <CardHeader className="items-center justify-center p-3 uppercase">
          <CardTitle className="text-muted-foreground text-sm">
            Classifica Utenti
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-card ring-border flex h-full flex-col gap-3 rounded-2xl p-4 ring-1">
          {isLoading && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          )}
          {!isLoading && error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
          {!isLoading && !error && (
            <ul className="divide-border divide-y">
              {topSharers.map((s, idx) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-4 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {/* Rank icon */}
                    <span aria-hidden className="shrink-0">
                      {idx === 0 ? (
                        <FaTrophy className="size-5 text-amber-500" />
                      ) : idx === 1 ? (
                        <Fa2 className="text-muted-foreground" />
                      ) : idx === 2 ? (
                        <Fa3 className="text-muted-foreground" />
                      ) : idx === 3 ? (
                        <Fa4 className="text-muted-foreground" />
                      ) : idx === 4 ? (
                        <Fa5 className="text-muted-foreground" />
                      ) : idx === 5 ? (
                        <Fa6 className="text-muted-foreground" />
                      ) : idx === 6 ? (
                        <Fa7 className="text-muted-foreground" />
                      ) : idx === 7 ? (
                        <Fa8 className="text-muted-foreground" />
                      ) : idx === 8 ? (
                        <Fa9 className="text-muted-foreground" />
                      ) : (
                        <span className="text-muted-foreground block w-5 text-center text-xs">
                          {idx + 1}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {s.nominativo}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {s.username} • {s.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className="bg-primary/10 text-primary ring-primary/40 border-none ring-1">
                      {s.total_files.toLocaleString("it-IT")} file
                    </Badge>
                    <Badge className="bg-muted/20 text-muted-foreground ring-border border-none ring-1">
                      {s.total_batches.toLocaleString("it-IT")} batch
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
