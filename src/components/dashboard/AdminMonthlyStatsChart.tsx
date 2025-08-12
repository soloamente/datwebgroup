"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { userService, type AdminMonthlyStat } from "@/app/api/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/tabs";
import { Skeleton } from "@/components/ui/skeleton";

type MetricKey = "file_count" | "batch_count";

type ChartRow = AdminMonthlyStat & {
  xLabel: string; // label for X axis
  value: number; // selected metric value
};

const METRIC_LABEL: Record<MetricKey, string> = {
  file_count: "File",
  batch_count: "Batch",
};

export default function AdminMonthlyStatsChart() {
  const [metric, setMetric] = useState<MetricKey>("file_count");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminMonthlyStat[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const start = Date.now();
        const res = await userService.getAdminMonthlyStats();
        const elapsed = Date.now() - start;
        const min = 800;
        if (elapsed < min)
          await new Promise((r) => setTimeout(r, min - elapsed));
        if (isMounted && res?.success && res.data?.monthly_stats) {
          setStats(res.data.monthly_stats);
        }
      } catch (e) {
        console.error("Failed to load admin monthly stats", e);
        if (isMounted) setError("Impossibile caricare le statistiche.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const chartData: ChartRow[] = useMemo(() => {
    return stats.map((s) => ({
      ...s,
      xLabel: s.label,
      value: s[metric],
    }));
  }, [stats, metric]);

  const chartConfig = useMemo(
    () => ({
      value: {
        label: METRIC_LABEL[metric],
        color: "hsl(var(--chart-1))",
      },
    }),
    [metric],
  );

  if (isLoading) {
    return (
      <Card className="bg-card ring-border w-full border-none ring-1">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="grid gap-1.5">
            <CardTitle className="text-2xl">Statistiche </CardTitle>
            <CardDescription className="text-muted-foreground">
              <Skeleton className="h-4 w-48" />
            </CardDescription>
          </div>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="flex h-[250px] w-full items-center justify-center">
            <div className="text-muted-foreground">Caricamento grafico...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card ring-border mb-6 w-full border-none ring-1">
        <CardHeader>
          <CardTitle className="text-2xl">Statistiche </CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card ring-border w-full border-none ring-1">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="grid gap-1.5">
            <CardTitle className="text-2xl">Statistiche</CardTitle>
            <CardDescription className="text-muted-foreground">
              Andamento mensile per metrica
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-4">
          <Tabs
            value={metric}
            onValueChange={(v) => setMetric(v)}
            className="w-full"
          >
            <div className="px-0">
              <TabsList className="ring-border bg-muted/30 grid w-full grid-cols-2 rounded-lg p-1 ring-1">
                <TabsTrigger
                  value="file_count"
                  className="text-muted-foreground"
                >
                  File
                </TabsTrigger>

                <TabsTrigger
                  value="batch_count"
                  className="text-muted-foreground"
                >
                  Batch
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value={metric} className="mt-4">
              <ChartContainer
                config={chartConfig}
                className="[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground h-[250px] w-full [&_.recharts-cartesian-axis-tick_text]:font-medium [&_.recharts-cartesian-axis-tick_text]:opacity-100"
              >
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ top: 20, left: 12, right: 12 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="xLabel"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        const p = payload[0];
                        const item = p?.payload as ChartRow | undefined;
                        return (
                          <div className="bg-popover text-popover-foreground z-50 overflow-hidden rounded-lg border px-3 py-1.5 text-sm shadow-md">
                            <p className="font-semibold">{item?.label ?? ""}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: p?.color }}
                              />
                              <p>
                                {METRIC_LABEL[metric]}:{" "}
                                <span className="font-bold">
                                  {typeof p?.value === "number"
                                    ? p.value
                                    : Number(p?.value ?? 0)}
                                </span>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <defs>
                    <linearGradient id="fillAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="30%"
                        stopColor="oklch(0.51 0.1733 256.59)"
                        stopOpacity={1}
                      />
                      <stop
                        offset="100%"
                        stopColor="oklch(0.51 0.1733 256.59)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Bar
                    dataKey="value"
                    fill="url(#fillAdmin)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
