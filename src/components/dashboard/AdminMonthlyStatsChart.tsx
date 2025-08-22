"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { userService, type AdminDailyBatchFileStat } from "@/app/api/api";
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
import { type DateRange as DayPickerDateRange } from "react-day-picker";
import { format as formatDate } from "date-fns";

type MetricKey = "file_count" | "batch_count";

type ChartRow = {
  xLabel: string;
  label: string;
  value: number;
};

const METRIC_LABEL: Record<MetricKey, string> = {
  file_count: "File",
  batch_count: "Batch",
};

type PresetKey =
  | "last7days"
  | "last30days"
  | "last3months"
  | "last6months"
  | "last12months"
  | "total"
  | "custom";

interface AdminMonthlyStatsChartProps {
  onPeriodChange?: (payload: {
    dateRange: DayPickerDateRange | undefined;
    activePresetKey: PresetKey;
  }) => void;
  dateRange?: DayPickerDateRange | undefined;
  activePresetKey?: PresetKey;
}

export default function AdminMonthlyStatsChart({
  onPeriodChange,
  dateRange: externalDateRange,
  activePresetKey: externalActivePresetKey,
}: AdminMonthlyStatsChartProps) {
  const [metric, setMetric] = useState<MetricKey>("file_count");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartRow[]>([]);
  const [dateRange, setDateRange] = useState<DayPickerDateRange | undefined>(
    () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      return { from: start, to: now };
    },
  );
  const [activePresetKey, setActivePresetKey] =
    useState<PresetKey>("last12months");

  // Use external props when provided, otherwise fall back to internal state
  const effectiveDateRange = externalDateRange ?? dateRange;
  const effectiveActivePresetKey = externalActivePresetKey ?? activePresetKey;

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const start = Date.now();

        // Build params only when both dates are provided
        const params = (() => {
          if (effectiveDateRange?.from && effectiveDateRange?.to) {
            return {
              start_date: formatDate(effectiveDateRange.from, "yyyy-MM-dd"),
              end_date: formatDate(effectiveDateRange.to, "yyyy-MM-dd"),
            } as const;
          }
          return undefined;
        })();

        const res = await userService.getAdminDailyBatchFileStats(params);

        // Ensure a minimum loading time for smoother UX
        const elapsed = Date.now() - start;
        const min = 800;
        if (elapsed < min)
          await new Promise((r) => setTimeout(r, min - elapsed));

        if (!isMounted) return;

        const daily: AdminDailyBatchFileStat[] = res?.data?.daily_stats ?? [];

        // If backend ignored params, enforce client-side filtering
        const filteredDaily: AdminDailyBatchFileStat[] = (() => {
          if (params) {
            const { start_date, end_date } = params;
            return daily.filter(
              (d) => d.date >= start_date && d.date <= end_date,
            );
          }
          return daily;
        })();

        // Always aggregate by month for cleaner visualization
        const byMonth = new Map<
          string,
          {
            period: string;
            label: string;
            file_count: number;
            batch_count: number;
          }
        >();
        for (const d of filteredDaily) {
          const dt = new Date(d.date);
          const year = dt.getFullYear();
          const month = String(dt.getMonth() + 1).padStart(2, "0");
          const period = `${year}-${month}`;
          const label = dt.toLocaleDateString("it-IT", {
            month: "long",
            year: "numeric",
          });
          const prev = byMonth.get(period);
          byMonth.set(period, {
            period,
            label,
            file_count: (prev?.file_count ?? 0) + (d.file_count ?? 0),
            batch_count: (prev?.batch_count ?? 0) + (d.batch_count ?? 0),
          });
        }
        const monthly = Array.from(byMonth.values()).sort((a, b) =>
          a.period.localeCompare(b.period),
        );
        const formattedMonthly: ChartRow[] = monthly.map((m) => ({
          xLabel: m.label,
          label: m.label,
          value: metric === "file_count" ? m.file_count : m.batch_count,
        }));
        setChartData(formattedMonthly);
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
  }, [effectiveDateRange, metric]);

  // Notify parent when the selected period changes
  useEffect(() => {
    onPeriodChange?.({ dateRange, activePresetKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, activePresetKey]);

  // Truncate month label to avoid hidden ticks on resize, e.g. "Ottobre 2024" -> "Ott 24"
  const formatMonthLabel = (label: string): string => {
    if (!label) return label;
    const parts = label.split(" ");
    const month = parts[0]?.slice(0, 3) ?? label.slice(0, 3);
    const year = parts[1]?.slice(-2) ?? "";
    return year ? `${month} ${year}` : month;
  };

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
      <Card className="bg-muted/20 ring-border w-full gap-0 border-none p-1 ring-1">
        <CardHeader className="m-0 flex flex-row items-start justify-between px-2 pt-3 pb-4">
          <div className="flex items-center gap-2">
            <Tabs
              value={metric}
              onValueChange={(v) => setMetric(v as MetricKey)}
            >
              <TabsList className="ring-border bg-muted/30 grid w-full grid-cols-2 rounded-lg p-1 ring-1">
                <TabsTrigger
                  value="file_count"
                  className="text-muted-foreground text-xs sm:text-sm"
                >
                  File
                </TabsTrigger>
                <TabsTrigger
                  value="batch_count"
                  className="text-muted-foreground text-xs sm:text-sm"
                >
                  Batch
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="bg-card ring-border rounded-xl px-3 ring-1 sm:rounded-2xl sm:px-4">
          <div className="mt-4">
            <div className="flex h-[200px] w-full items-center justify-center sm:h-[250px]">
              <div className="text-muted-foreground text-xs sm:text-sm">
                Caricamento grafico...
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card ring-border mb-6 w-full border-none ring-1">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">"" </CardTitle>
          <CardDescription className="text-xs text-red-500 sm:text-sm">
            {error}
          </CardDescription>
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
      <Card className="bg-muted/20 ring-border w-full gap-0 border-none p-1 ring-1">
        <CardHeader className="m-0 flex flex-row items-start justify-between px-2 pt-3 pb-4">
          <div className="flex items-center gap-2">
            <Tabs
              value={metric}
              onValueChange={(v) => setMetric(v as MetricKey)}
            >
              <TabsList className="ring-border bg-muted/40 grid w-full grid-cols-2 rounded-lg border-none p-1 ring-1">
                <TabsTrigger
                  value="file_count"
                  className="text-muted-foreground data-[state=active]ring-border data-[state=active]ring-1 text-xs data-[state=active]:border-none sm:text-sm"
                >
                  File
                </TabsTrigger>
                <TabsTrigger
                  value="batch_count"
                  className="text-muted-foreground data-[state=active]ring-border data-[state=active]ring-1 text-xs data-[state=active]:border-none sm:text-sm"
                >
                  Batch
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="bg-card ring-border rounded-xl px-3 ring-1 sm:rounded-2xl sm:px-4">
          <div className="mt-4">
            <ChartContainer
              config={chartConfig}
              className="[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground h-[200px] w-full sm:h-[250px] [&_.recharts-cartesian-axis-tick_text]:font-medium [&_.recharts-cartesian-axis-tick_text]:opacity-100"
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
                  interval={0}
                  minTickGap={0}
                  tickFormatter={formatMonthLabel}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      const p = payload[0];
                      const item = p?.payload as ChartRow | undefined;
                      return (
                        <div className="bg-popover text-popover-foreground z-50 overflow-hidden rounded-lg border px-2 py-1 text-xs shadow-md sm:px-3 sm:py-1.5 sm:text-sm">
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
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
