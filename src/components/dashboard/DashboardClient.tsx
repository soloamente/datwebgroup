"use client";

import { useState, useEffect, useId, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Share2 } from "lucide-react";
import { type DashboardData } from "../../app/dashboard/admin/types";
import { userService } from "@/app/api/api";
import DashboardChart from "./DashboardChart";
import StatCard from "./StatCard";
import { Chart01 } from "../charts/chart-01";
import { Chart06 } from "../charts/chart-06";
import { Chart02 } from "../charts/chart-02";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import AdminMonthlyStatsChart from "./AdminMonthlyStatsChart";
import TopSharerStatsCard from "./TopSharerStatsCard";
import LoginStatsPieCard from "./LoginStatsPieCard";
import { type DateRange as DayPickerDateRange } from "react-day-picker";
import {
  addDays,
  differenceInCalendarDays,
  format as formatDate,
} from "date-fns";
import { it } from "date-fns/locale";
import { DateRangeFilter } from "@/components/filters/date-range-filter";
// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

export default function DashboardClient() {
  const uid = useId();
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [totalBatches, setTotalBatches] = useState<number>(0);
  const [periodFiles, setPeriodFiles] = useState<number>(0);
  const [periodBatches, setPeriodBatches] = useState<number>(0);
  const [monthlySeries, setMonthlySeries] = useState<
    Array<{ label: string; files: number; batches: number }>
  >([]);
  const [periodSeries, setPeriodSeries] = useState<
    Array<{ label: string; files: number; batches: number }>
  >([]);
  const [badgeFiles, setBadgeFiles] = useState<{
    text: string;
    className: string;
  }>({ text: "", className: "bg-muted text-muted-foreground" });
  const [badgeBatches, setBadgeBatches] = useState<{
    text: string;
    className: string;
  }>({ text: "", className: "bg-muted text-muted-foreground" });
  type PresetKey =
    | "last7days"
    | "last30days"
    | "last3months"
    | "last6months"
    | "last12months"
    | "total"
    | "custom";
  const [selectedDateRange, setSelectedDateRange] = useState<
    DayPickerDateRange | undefined
  >();
  const [activePresetKey, setActivePresetKey] =
    useState<PresetKey>("last12months");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  console.log("periodSeries", periodSeries);
  // Compute comparison labels tied to selected period
  const getComparisonLabel = (preset: PresetKey): string => {
    switch (preset) {
      case "last7days":
        return "vs. 7 giorni precedenti";
      case "last30days":
        return "vs. 30 giorni precedenti";
      case "last3months":
        return "vs. 3 mesi precedenti";
      case "last6months":
        return "vs. 6 mesi precedenti";
      case "last12months":
        return "vs. 12 mesi precedenti";
      case "total":
        return "vs. anno precedente";
      case "custom":
      default:
        return "vs. periodo precedente";
    }
  };

  // When the period in the Statistics card changes, recompute badges for files and batches
  useEffect(() => {
    const computeBadges = async () => {
      try {
        let newPeriodSeries: Array<{
          label: string;
          files: number;
          batches: number;
        }> = [];

        // If no selection (Total), compare ultimo anno vs anno precedente
        if (!selectedDateRange?.from || !selectedDateRange?.to) {
          const res = await userService.getAdminDailyBatchFileStats();
          const all = res?.data?.daily_stats ?? [];

          const nowDate = new Date();
          const currentFrom = new Date(
            nowDate.getFullYear(),
            nowDate.getMonth() - 11,
            1,
          );
          const currentTo = nowDate;
          const currentFromStr = formatDate(currentFrom, "yyyy-MM-dd");
          const currentToStr = formatDate(currentTo, "yyyy-MM-dd");
          const prevTo = new Date(currentFrom);
          prevTo.setDate(prevTo.getDate() - 1);
          const prevFrom = new Date(
            prevTo.getFullYear(),
            prevTo.getMonth() - 11,
            1,
          );
          const prevFromStr = formatDate(prevFrom, "yyyy-MM-dd");
          const prevToStr = formatDate(prevTo, "yyyy-MM-dd");

          const inRange = (d: string, from: string, to: string) =>
            d >= from && d <= to;

          const curr = all.filter((d) =>
            inRange(d.date, currentFromStr, currentToStr),
          );
          const prev = all.filter((d) =>
            inRange(d.date, prevFromStr, prevToStr),
          );

          // Aggregate current year data by month for chart
          const byMonth = new Map<
            string,
            { files: number; batches: number; label: string }
          >();
          for (const d of curr) {
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
              files: (prev?.files ?? 0) + (d.file_count ?? 0),
              batches: (prev?.batches ?? 0) + (d.batch_count ?? 0),
              label,
            });
          }
          newPeriodSeries = Array.from(byMonth.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([_, data]) => ({
              label: data.label,
              files: data.files,
              batches: data.batches,
            }));

          const currFiles = curr.reduce((s, d) => s + (d.file_count ?? 0), 0);
          const prevFiles = prev.reduce((s, d) => s + (d.file_count ?? 0), 0);
          const currBatches = curr.reduce(
            (s, d) => s + (d.batch_count ?? 0),
            0,
          );
          const prevBatches = prev.reduce(
            (s, d) => s + (d.batch_count ?? 0),
            0,
          );

          const deltaFiles = currFiles - prevFiles;
          const deltaBatches = currBatches - prevBatches;
          const signFiles = deltaFiles > 0 ? "+" : "";
          const signBatches = deltaBatches > 0 ? "+" : "";
          const label = getComparisonLabel(activePresetKey);

          setBadgeFiles({
            text: `${signFiles}${deltaFiles} ${label}`,
            className:
              deltaFiles > 0
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : deltaFiles < 0
                  ? "bg-red-500/15 text-red-700 dark:text-red-300"
                  : "bg-muted text-muted-foreground",
          });
          setBadgeBatches({
            text: `${signBatches}${deltaBatches} ${label}`,
            className:
              deltaBatches > 0
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : deltaBatches < 0
                  ? "bg-red-500/15 text-red-700 dark:text-red-300"
                  : "bg-muted text-muted-foreground",
          });
          setPeriodSeries(newPeriodSeries);
          setPeriodFiles(currFiles);
          setPeriodBatches(currBatches);
          return;
        }

        // Explicit range: compare range vs previous range with same length
        const from = selectedDateRange.from;
        const to = selectedDateRange.to;
        if (!from || !to) return;

        const inclusiveDays = differenceInCalendarDays(to, from) + 1;
        const prevEnd = addDays(from, -1);
        const prevStart = addDays(from, -inclusiveDays);

        // Fetch both current and previous ranges
        const [currRes, prevRes] = await Promise.all([
          userService.getAdminDailyBatchFileStats({
            start_date: formatDate(from, "yyyy-MM-dd"),
            end_date: formatDate(to, "yyyy-MM-dd"),
          }),
          userService.getAdminDailyBatchFileStats({
            start_date: formatDate(prevStart, "yyyy-MM-dd"),
            end_date: formatDate(prevEnd, "yyyy-MM-dd"),
          }),
        ]);

        const curr = (currRes?.data?.daily_stats ?? []).filter(
          (d) =>
            d.date >= formatDate(from, "yyyy-MM-dd") &&
            d.date <= formatDate(to, "yyyy-MM-dd"),
        );
        const prev = (prevRes?.data?.daily_stats ?? []).filter(
          (d) =>
            d.date >= formatDate(prevStart, "yyyy-MM-dd") &&
            d.date <= formatDate(prevEnd, "yyyy-MM-dd"),
        );

        // For custom ranges, aggregate by day or week depending on range length
        const rangeDays = differenceInCalendarDays(to, from) + 1;
        if (rangeDays <= 30) {
          // Daily aggregation for short ranges
          newPeriodSeries = curr.map((d) => ({
            label: formatDate(new Date(d.date), "dd MMM", { locale: it }),
            files: d.file_count ?? 0,
            batches: d.batch_count ?? 0,
          }));
        } else {
          // Weekly aggregation for longer ranges
          const byWeek = new Map<
            string,
            { files: number; batches: number; label: string }
          >();
          for (const d of curr) {
            const dt = new Date(d.date);
            const weekStart = new Date(dt);
            weekStart.setDate(dt.getDate() - dt.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            const weekKey = `${weekStart.getTime()}`;
            const label = `${formatDate(weekStart, "dd MMM", { locale: it })} - ${formatDate(weekEnd, "dd MMM", { locale: it })}`;
            const prev = byWeek.get(weekKey);
            byWeek.set(weekKey, {
              files: (prev?.files ?? 0) + (d.file_count ?? 0),
              batches: (prev?.batches ?? 0) + (d.batch_count ?? 0),
              label,
            });
          }
          newPeriodSeries = Array.from(byWeek.values()).sort((a, b) => {
            const aDate = a.label.split(" - ")[0];
            const bDate = b.label.split(" - ")[0];
            return (
              new Date(aDate || "").getTime() - new Date(bDate || "").getTime()
            );
          });
        }

        const currFiles = curr.reduce((s, d) => s + (d.file_count ?? 0), 0);
        const prevFiles = prev.reduce((s, d) => s + (d.file_count ?? 0), 0);
        const currBatches = curr.reduce((s, d) => s + (d.batch_count ?? 0), 0);
        const prevBatches = prev.reduce((s, d) => s + (d.batch_count ?? 0), 0);

        const deltaFiles = currFiles - prevFiles;
        const deltaBatches = currBatches - prevBatches;
        const signFiles = deltaFiles > 0 ? "+" : "";
        const signBatches = deltaBatches > 0 ? "+" : "";
        const label = getComparisonLabel(activePresetKey);

        setBadgeFiles({
          text: `${signFiles}${deltaFiles} ${label}`,
          className:
            deltaFiles > 0
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : deltaFiles < 0
                ? "bg-red-500/15 text-red-700 dark:text-red-300"
                : "bg-muted text-muted-foreground",
        });
        setBadgeBatches({
          text: `${signBatches}${deltaBatches} ${label}`,
          className:
            deltaBatches > 0
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : deltaBatches < 0
                ? "bg-red-500/15 text-red-700 dark:text-red-300"
                : "bg-muted text-muted-foreground",
        });
        setPeriodSeries(newPeriodSeries);
        setPeriodFiles(currFiles);
        setPeriodBatches(currBatches);
      } catch (e) {
        // Fallback: leave existing badges if any
        // eslint-disable-next-line no-console
        console.error("Failed computing period badges", e);
      }
    };
    void computeBadges();
  }, [selectedDateRange, activePresetKey]);

  const filesDelta = useMemo(() => {
    if (periodSeries.length >= 2) {
      const prev = periodSeries[periodSeries.length - 2];
      const curr = periodSeries[periodSeries.length - 1];
      return (curr?.files ?? 0) - (prev?.files ?? 0);
    }
    return 0;
  }, [periodSeries]);

  const batchesDelta = useMemo(() => {
    if (periodSeries.length >= 2) {
      const prev = periodSeries[periodSeries.length - 2];
      const curr = periodSeries[periodSeries.length - 1];
      return (curr?.batches ?? 0) - (prev?.batches ?? 0);
    }
    return 0;
  }, [periodSeries]);

  const filesTrendUp = filesDelta >= 0;
  const batchesTrendUp = batchesDelta >= 0;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch historical totals and monthly stats in parallel
        const [totalsRes, monthlyRes] = await Promise.all([
          userService.getAdminTotalStats(),
          userService.getAdminMonthlyStats(),
        ]);

        if (!totalsRes?.success || !totalsRes.data) {
          setError("Impossibile recuperare i totali.");
          return;
        }

        const totalFiles = totalsRes.data.total_files ?? 0;
        const totalBatches = totalsRes.data.total_batches ?? 0;
        const placeholder: DashboardData = {
          totalDocuments: totalFiles,
          sharedDocuments: 0,
          activeClients: 0,
          pendingRequests: 0,
          privateDocuments: 0,
          chartData: { labels: [], values: [] },
        };
        setData(placeholder);
        setTotalFiles(totalFiles);
        setTotalBatches(totalBatches);

        // Prefer deltas from total-stats if present (last 30 days); fallback to monthly series
        const monthly = monthlyRes?.data?.monthly_stats ?? [];
        if (Array.isArray(monthly)) {
          setMonthlySeries(
            monthly.map(
              (m: {
                label?: string;
                file_count?: number;
                batch_count?: number;
              }) => ({
                label: m.label ?? "",
                files: m.file_count ?? 0,
                batches: m.batch_count ?? 0,
              }),
            ),
          );
        }
        if (
          typeof totalsRes.data.files_last_30_days === "number" &&
          typeof totalsRes.data.batches_last_30_days === "number"
        ) {
          const deltaFiles = totalsRes.data.files_last_30_days - totalFiles;
          const deltaBatches =
            totalsRes.data.batches_last_30_days - totalBatches;
          const signFiles = deltaFiles > 0 ? "+" : "";
          const signBatches = deltaBatches > 0 ? "+" : "";
          setBadgeFiles({
            text: `${signFiles}${deltaFiles} negli ultimi 30 giorni`,
            className:
              deltaFiles > 0
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : deltaFiles < 0
                  ? "bg-red-500/15 text-red-700 dark:text-red-300"
                  : "bg-muted text-muted-foreground",
          });
          setBadgeBatches({
            text: `${signBatches}${deltaBatches} negli ultimi 30 giorni`,
            className:
              deltaBatches > 0
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : deltaBatches < 0
                  ? "bg-red-500/15 text-red-700 dark:text-red-300"
                  : "bg-muted text-muted-foreground",
          });
        } else if (Array.isArray(monthly) && monthly.length >= 2) {
          const lastTwo = monthly.slice(-2);
          const prevFiles = lastTwo[0]?.file_count ?? 0;
          const currFiles = lastTwo[1]?.file_count ?? 0;
          const deltaFiles = currFiles - prevFiles;
          const signFiles = deltaFiles > 0 ? "+" : "";
          setBadgeFiles({
            text: `${signFiles}${deltaFiles} rispetto a un mese fa`,
            className:
              deltaFiles > 0
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : deltaFiles < 0
                  ? "bg-red-500/15 text-red-700 dark:text-red-300"
                  : "bg-muted text-muted-foreground",
          });

          const prevBatches = lastTwo[0]?.batch_count ?? 0;
          const currBatches = lastTwo[1]?.batch_count ?? 0;
          const deltaBatches = currBatches - prevBatches;
          const signBatches = deltaBatches > 0 ? "+" : "";
          setBadgeBatches({
            text: `${signBatches}${deltaBatches} rispetto a un mese fa`,
            className:
              deltaBatches > 0
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : deltaBatches < 0
                  ? "bg-red-500/15 text-red-700 dark:text-red-300"
                  : "bg-muted text-muted-foreground",
          });
        } else {
          setBadgeFiles({
            text: "",
            className: "bg-muted text-muted-foreground",
          });
          setBadgeBatches({
            text: "",
            className: "bg-muted text-muted-foreground",
          });
        }
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    // eslint-disable-next-line
    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-500">Error</h2>
          <p className="mt-2 text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto lg:m-0">
        <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-4 rounded-xl transition-colors duration-200 sm:gap-6 md:min-h-min lg:gap-8">
          <header className="flex items-center justify-between px-2 pt-4 sm:px-4">
            <h1 className="text-3xl font-medium sm:text-4xl lg:text-5xl">
              Dashboard
            </h1>
          </header>

          <div className="bg-muted/20 flex flex-col gap-3 rounded-2xl p-2 sm:gap-4 sm:rounded-3xl">
            <div className="flex items-center justify-between gap-3 pt-2 pr-2 pb-1 pl-4">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Statistiche
                  </h2>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Analisi dettagliata delle performance
                  </p>
                </div>
              </div>
              {/* Temporal Filter moved here */}
              <DateRangeFilter
                dateRange={selectedDateRange}
                onDateRangeChange={(r: DayPickerDateRange | undefined) => {
                  setSelectedDateRange(r);
                  setActivePresetKey(r ? "custom" : "total");
                }}
                dateField="sent_at"
                onDateFieldChange={() => {}}
                availableDateFields={[
                  { value: "sent_at", label: "Data invio" },
                ]}
                align="center"
                onPresetChange={(preset: {
                  key: string;
                  view: "day" | "month";
                }) => {
                  if (
                    preset.key === "last7days" ||
                    preset.key === "last30days" ||
                    preset.key === "last3months" ||
                    preset.key === "last6months" ||
                    preset.key === "last12months" ||
                    preset.key === "total" ||
                    preset.key === "custom"
                  ) {
                    setActivePresetKey(preset.key as PresetKey);
                  } else {
                    setActivePresetKey("custom");
                  }
                }}
              />
            </div>

            <AdminMonthlyStatsChart
              dateRange={selectedDateRange}
              activePresetKey={activePresetKey}
              onPeriodChange={({ dateRange, activePresetKey }) => {
                setSelectedDateRange(dateRange);
                setActivePresetKey(activePresetKey);
              }}
            />

            <div className="mb-0">
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:gap-4">
                <Card className="bg-muted/20 ring-border h-fit flex-1 gap-0 border-none p-1 ring-1">
                  <CardHeader className="items-center justify-center p-2 uppercase sm:p-3">
                    <CardTitle className="text-muted-foreground text-xs sm:text-sm">
                      <span className="inline-flex items-center gap-1 sm:gap-2">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">
                          Totale File condivisi
                        </span>
                        <span className="sm:hidden">File condivisi</span>
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-card ring-border flex h-full flex-col items-center justify-center gap-3 rounded-xl p-4 ring-1 sm:gap-4 sm:rounded-2xl sm:p-8">
                    {isLoading ? (
                      <Skeleton className="h-8 w-24 sm:h-12 sm:w-40" />
                    ) : (
                      <AnimatePresence mode="wait">
                        <motion.h1
                          key={periodFiles}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="text-2xl font-semibold sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl dark:text-white"
                        >
                          {periodFiles.toLocaleString("it-IT")}
                        </motion.h1>
                      </AnimatePresence>
                    )}
                    <Badge
                      className={`h-fit w-fit rounded-full ${badgeFiles.className}`}
                    >
                      <p className="px-2 py-1 text-xs sm:text-sm">
                        {badgeFiles.text}
                      </p>
                    </Badge>
                    {isLoading || periodSeries.length === 0 ? (
                      <Skeleton className="h-12 w-full sm:h-16" />
                    ) : (
                      <ChartContainer
                        config={{
                          value: {
                            label: "File",
                            color: "hsl(var(--chart-1))",
                          },
                        }}
                        className={`aspect-auto h-12 w-full sm:h-16 [&_.recharts-cartesian-axis]:hidden [&_.recharts-cartesian-grid]:hidden ${filesTrendUp ? "text-green-600" : "text-red-600"}`}
                      >
                        <AreaChart
                          data={periodSeries.map((r) => ({
                            label: r.label,
                            value: r.files,
                          }))}
                          margin={{ left: 0, right: 0, top: 4, bottom: 0 }}
                          key={`files-${periodSeries.length}-${periodFiles}`}
                        >
                          <defs>
                            <linearGradient
                              id={`${uid}-files`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="currentColor"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="100%"
                                stopColor="currentColor"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="label" hide />
                          <YAxis hide domain={["dataMin", "dataMax"]} />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="currentColor"
                            strokeWidth={1}
                            fill={`url(#${uid}-files)`}
                            isAnimationActive={true}
                            animationDuration={600}
                          />
                        </AreaChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-muted/20 ring-border h-fit flex-1 gap-0 border-none p-1 ring-1">
                  <CardHeader className="items-center justify-center p-2 uppercase sm:p-3">
                    <CardTitle className="text-muted-foreground text-xs sm:text-sm">
                      <span className="inline-flex items-center gap-1 sm:gap-2">
                        <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">
                          Totale condivisioni
                        </span>
                        <span className="sm:hidden">Condivisioni</span>
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-card ring-border flex h-full flex-col items-center justify-center gap-3 rounded-xl p-4 ring-1 sm:gap-4 sm:rounded-2xl sm:p-8">
                    {isLoading ? (
                      <Skeleton className="h-8 w-24 sm:h-12 sm:w-40" />
                    ) : (
                      <AnimatePresence mode="wait">
                        <motion.h1
                          key={periodBatches}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="text-2xl font-semibold sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl dark:text-white"
                        >
                          {periodBatches.toLocaleString("it-IT")}
                        </motion.h1>
                      </AnimatePresence>
                    )}
                    <Badge
                      className={`h-fit w-fit rounded-full ${badgeBatches.className}`}
                    >
                      <p className="px-2 py-1 text-xs sm:text-sm">
                        {badgeBatches.text}
                      </p>
                    </Badge>
                    {isLoading || periodSeries.length === 0 ? (
                      <Skeleton className="h-12 w-full sm:h-16" />
                    ) : (
                      <ChartContainer
                        config={{
                          value: {
                            label: "Condivisioni",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                        className={`aspect-auto h-12 w-full sm:h-16 [&_.recharts-cartesian-axis]:hidden [&_.recharts-cartesian-grid]:hidden ${batchesTrendUp ? "text-green-600" : "text-red-600"}`}
                      >
                        <AreaChart
                          data={periodSeries.map((r) => ({
                            label: r.label,
                            value: r.batches,
                          }))}
                          margin={{ left: 0, right: 0, top: 4, bottom: 0 }}
                          key={`batches-${periodSeries.length}-${periodBatches}`}
                        >
                          <defs>
                            <linearGradient
                              id={`${uid}-batches`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="currentColor"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="100%"
                                stopColor="currentColor"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="label" hide />
                          <YAxis hide domain={["dataMin", "dataMax"]} />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="currentColor"
                            strokeWidth={1}
                            fill={`url(#${uid}-batches)`}
                            isAnimationActive={true}
                            animationDuration={600}
                          />
                        </AreaChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col justify-between gap-4 sm:gap-6 lg:gap-8">
            {/* <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-1 md:mb-8 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
              <StatCard
                title="Documenti condivisi"
                value={data?.sharedDocuments}
                badge={{
                  text: "+12%",
                  color: "green",
                }}
                icon={FileText}
                isLoading={isLoading}
              />

              <StatCard
                title="Clienti attivi"
                value={data?.activeClients}
                badge={{
                  text: "+5%",
                  color: "blue",
                }}
                icon={Users}
                isLoading={isLoading}
              />

              <StatCard
                title="Richieste pendenti"
                value={data?.pendingRequests}
                badge={{
                  text: "+8%",
                  color: "amber",
                }}
                icon={Clock}
                isLoading={isLoading}
              />

              <StatCard
                title="Documenti privati"
                value={data?.privateDocuments}
                badge={{
                  text: "+15%",
                  color: "purple",
                }}
                icon={Lock}
                isLoading={isLoading}
              />
            </div> */}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TopSharerStatsCard />
              <LoginStatsPieCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
