"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { userService, type AdminLoginStatsPieData } from "@/app/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";

export default function LoginStatsPieCard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminLoginStatsPieData | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await userService.getAdminLoginStatsPie();
        if (mounted && res?.success && res.data) setData(res.data);
      } catch (e) {
        if (mounted) setError("Impossibile caricare le statistiche di login.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const chartData = useMemo(() => {
    if (!data) return [] as { name: string; value: number; color: string }[];
    return [
      {
        name: "QR",
        value: data.total_qr_logins,
        color: "oklch(0.66 0.18 142)",
      },
      {
        name: "Classico",
        value: data.total_classic_logins,
        color: "oklch(0.66 0.18 22)",
      },
    ];
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-muted/20 ring-border h-full gap-0 border-none p-0 ring-1">
        <CardHeader className="items-center justify-center p-3 uppercase">
          <CardTitle className="text-muted-foreground text-sm">
            Statistiche Login
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-card ring-border rounded-2xl p-4 ring-1">
          {isLoading && (
            <div className="flex h-[220px] items-center justify-center">
              <Skeleton className="h-40 w-40 rounded-full" />
            </div>
          )}
          {!isLoading && error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
          {!isLoading && !error && data && (
            <ChartContainer config={{}} className="h-[240px] w-full">
              <PieChart width={240} height={240}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0];
                    return (
                      <div className="bg-popover text-popover-foreground z-50 rounded-md border px-2 py-1 text-xs shadow">
                        {String(p?.name)}: {String(p?.value)}
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ChartContainer>
          )}
          {!isLoading && !error && data && (
            <div className="text-muted-foreground mt-3 grid grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-2 text-sm">
                Totale login{" "}
                <span className="text-foreground bg-muted/20 ring-border rounded-md border-none p-2 font-semibold ring-1">
                  {data.total_logins.toLocaleString("it-IT")}
                </span>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                Utenti unici{" "}
                <span className="text-foreground bg-muted/20 ring-border rounded-md border-none p-2 font-semibold ring-1">
                  {data.total_unique_users.toLocaleString("it-IT")}
                </span>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                Login QR{" "}
                <span className="text-foreground bg-muted/20 ring-border rounded-md border-none p-2 font-semibold ring-1">
                  {data.qr_percentage}%
                </span>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                Classico{" "}
                <span className="text-foreground bg-muted/20 ring-border rounded-md border-none p-2 font-semibold ring-1">
                  {data.classic_percentage}%
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
