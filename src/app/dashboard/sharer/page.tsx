"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { Area, AreaChart } from "recharts";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { type DailyStat, type MonthlyStat, userService } from "@/app/api/api";
import {
  calculateStats,
  calculateStatsFromDaily,
  formatPercentage,
  formatNumber,
  getPeriodDescription,
} from "@/lib/stats-calculator";
import { RecentSharesGrid } from "@/components/dashboard/recent-shares-grid";
import { ChartPieDonutText } from "@/components/dashboard/chart-pie-donut";
import { TrendingUp, Trophy, Files, CalendarDays } from "lucide-react";
import { BsFileEarmarkBarGraph, BsFileEarmarkText } from "react-icons/bs";
import { ImAttachment } from "react-icons/im";
import { DateRangeFilter } from "@/components/filters/date-range-filter";
import { type DateRange as DayPickerDateRange } from "react-day-picker";
import {
  format as formatDate,
  differenceInCalendarDays,
  addDays,
} from "date-fns";

type ChartData =
  | (DailyStat & { desktop: number; month: string })
  | (MonthlyStat & { desktop: number; month: string });

const CustomTooltipContent = ({
  active,
  payload,
}: TooltipProps<number, string>) => {
  if (active && payload?.length && payload[0]) {
    const data = payload[0].payload as ChartData;
    let dateLabel = "";

    if ("date" in data && data.date) {
      dateLabel = new Date(data.date).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } else if ("period" in data && data.period) {
      const [year, month] = data.period.split("-");
      const date = new Date(Number(year), Number(month) - 1);
      dateLabel = date.toLocaleDateString("it-IT", {
        month: "long",
        year: "numeric",
      });
    }

    return (
      <div className="bg-popover text-popover-foreground z-50 overflow-hidden rounded-lg border px-3 py-1.5 text-sm shadow-md">
        <p className="font-semibold">{dateLabel}</p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: payload[0].color }}
          />
          <p>
            File: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default function DashboardPage() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  // activeTab kept for backward compatibility in calculations; no longer shown in UI
  const [activeTab, setActiveTab] = useState<"week" | "month" | "year">("year");
  const [statsCalculations, setStatsCalculations] = useState<ReturnType<
    typeof calculateStats
  > | null>(null);
  const [prevStatsCalculations, setPrevStatsCalculations] = useState<ReturnType<
    typeof calculateStatsFromDaily
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DayPickerDateRange | undefined>(
    () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      return { from: start, to: now };
    },
  );
  const [dateField, setDateField] = useState<string>("sent_at");
  const [aggregationView, setAggregationView] = useState<"day" | "month">(
    "month",
  );
  const [activePresetKey, setActivePresetKey] = useState<
    | "last7days"
    | "last30days"
    | "last3months"
    | "last6months"
    | "last12months"
    | "total"
    | "custom"
  >("last12months");

  const getComparisonLabel = (): string => {
    switch (activePresetKey) {
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // Add a minimum loading time to ensure the skeleton is visible
        const startTime = Date.now();

        // If a date range is selected, use the daily stats endpoint with range
        if (dateRange?.from && dateRange?.to) {
          const start_date = formatDate(dateRange.from, "yyyy-MM-dd");
          const end_date = formatDate(dateRange.to, "yyyy-MM-dd");
          const response = await userService.getMyDailyBatchFileStats({
            start_date,
            end_date,
          });

          // Ensure minimum loading time of 1 second for better UX
          const elapsedTime = Date.now() - startTime;
          const minLoadingTime = 1000;
          if (elapsedTime < minLoadingTime) {
            await new Promise((resolve) =>
              setTimeout(resolve, minLoadingTime - elapsedTime),
            );
          }

          const daily = response.data.daily_stats ?? [];
          // Enforce client-side filtering in case backend ignores params
          const startStr = start_date;
          const endStr = end_date;
          const filteredDaily = daily.filter(
            (d) => d.date >= startStr && d.date <= endStr,
          );
          if (aggregationView === "month") {
            // Aggregate by month (YYYY-MM)
            const byMonth = new Map<
              string,
              { period: string; label: string; file_count: number }
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
                file_count: (prev?.file_count ?? 0) + d.file_count,
              });
            }
            const monthly = Array.from(byMonth.values()).sort((a, b) =>
              a.period.localeCompare(b.period),
            );
            const formattedMonthly = monthly.map(
              (m) =>
                ({
                  period: m.period,
                  label: m.label,
                  file_count: m.file_count,
                  desktop: m.file_count,
                  month: m.label,
                }) as ChartData,
            );
            setChartData(formattedMonthly);
          } else {
            const formattedDaily = filteredDaily.map(
              (d) =>
                ({
                  ...d,
                  desktop: d.file_count,
                  month: d.label,
                }) as ChartData,
            );
            setChartData(formattedDaily);
          }
          // Compute derived stats for the selected custom range so additional cards show
          const derived = calculateStatsFromDaily(filteredDaily);
          setStatsCalculations(derived);
          // Compute previous equal-length period for comparisons
          const inclusiveDays =
            differenceInCalendarDays(dateRange.to, dateRange.from) + 1;
          const prevEnd = addDays(dateRange.from, -1);
          const prevStart = addDays(dateRange.from, -inclusiveDays);
          const prevResp = await userService.getMyDailyBatchFileStats({
            start_date: formatDate(prevStart, "yyyy-MM-dd"),
            end_date: formatDate(prevEnd, "yyyy-MM-dd"),
          });
          const prevDailyRaw = prevResp.data.daily_stats ?? [];
          const prevDaily = prevDailyRaw.filter(
            (d) =>
              d.date >= formatDate(prevStart, "yyyy-MM-dd") &&
              d.date <= formatDate(prevEnd, "yyyy-MM-dd"),
          );
          setPrevStatsCalculations(calculateStatsFromDaily(prevDaily));
          return;
        }

        // No explicit date range: get full daily stats and aggregate as requested
        const responseDaily = await userService.getMyDailyBatchFileStats();

        // Ensure minimum loading time of 1 second for better UX
        const elapsedTime = Date.now() - startTime;
        const minLoadingTime = 1000;

        if (elapsedTime < minLoadingTime) {
          await new Promise((resolve) =>
            setTimeout(resolve, minLoadingTime - elapsedTime),
          );
        }

        if (!responseDaily.data) {
          return;
        }

        const allDaily = responseDaily.data.daily_stats ?? [];
        // Stats for cards always from daily (lifetime)
        setStatsCalculations(calculateStatsFromDaily(allDaily));
        // When Total is selected (no explicit range), compare ultimo anno vs anno precedente
        const nowDate = new Date();
        const currentFrom = new Date(
          nowDate.getFullYear(),
          nowDate.getMonth() - 11,
          1,
        );
        const currentTo = nowDate;
        const currentFromStr = formatDate(currentFrom, "yyyy-MM-dd");
        const currentToStr = formatDate(currentTo, "yyyy-MM-dd");
        const currentYearDaily = allDaily.filter(
          (d) => d.date >= currentFromStr && d.date <= currentToStr,
        );
        // Previous 12 months immediately before current range
        const inclusiveDaysYear =
          differenceInCalendarDays(currentTo, currentFrom) + 1;
        const prevYearEnd = addDays(currentFrom, -1);
        const prevYearStart = addDays(currentFrom, -inclusiveDaysYear);
        const prevYearResp = await userService.getMyDailyBatchFileStats({
          start_date: formatDate(prevYearStart, "yyyy-MM-dd"),
          end_date: formatDate(prevYearEnd, "yyyy-MM-dd"),
        });
        const prevYearRaw = prevYearResp.data.daily_stats ?? [];
        const prevYearDaily = prevYearRaw.filter(
          (d) =>
            d.date >= formatDate(prevYearStart, "yyyy-MM-dd") &&
            d.date <= formatDate(prevYearEnd, "yyyy-MM-dd"),
        );
        setPrevStatsCalculations(calculateStatsFromDaily(prevYearDaily));

        if (aggregationView === "month") {
          const byMonth = new Map<
            string,
            { period: string; label: string; file_count: number }
          >();
          for (const d of allDaily) {
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
              file_count: (prev?.file_count ?? 0) + d.file_count,
            });
          }
          const monthly = Array.from(byMonth.values()).sort((a, b) =>
            a.period.localeCompare(b.period),
          );
          const formattedMonthly = monthly.map(
            (m) =>
              ({
                period: m.period,
                label: m.label,
                file_count: m.file_count,
                desktop: m.file_count,
                month: m.label,
              }) as ChartData,
          );
          setChartData(formattedMonthly);
        } else {
          const formattedDaily = allDaily.map(
            (d) =>
              ({
                ...d,
                desktop: d.file_count,
                month: d.label,
              }) as ChartData,
          );
          setChartData(formattedDaily);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to fetch file stats", error.message);
        } else {
          console.error("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };
    void fetchStats();
  }, [activeTab, dateRange, aggregationView]);

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
  };

  // Get current time for last update
  const now = new Date();
  const lastUpdate = now.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Deltas vs precedente periodo di uguale durata (o anno precedente per "Totale")
  const deltaTotalPrevPeriod =
    statsCalculations && prevStatsCalculations
      ? Math.round(
          statsCalculations.totalFiles - prevStatsCalculations.totalFiles,
        )
      : 0;
  const deltaMaxPrevPeriod =
    statsCalculations && prevStatsCalculations
      ? Math.round(
          statsCalculations.maxFilesInPeriod -
            prevStatsCalculations.maxFilesInPeriod,
        )
      : 0;
  const deltaAvgDailyPrevPeriod =
    statsCalculations && prevStatsCalculations
      ? Math.round(
          statsCalculations.averageFilesPerDay -
            prevStatsCalculations.averageFilesPerDay,
        )
      : 0;
  const deltaAvgMonthly =
    statsCalculations && prevStatsCalculations
      ? Math.round(
          statsCalculations.averageFilesPerMonth -
            prevStatsCalculations.averageFilesPerMonth,
        )
      : 0;

  return (
    <div className="min-h-screen">
      <div className="w-full">
        {/* Statistics Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-card ring-border mb-6 w-full border-none ring-1">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="grid gap-1.5">
                <CardTitle className="text-2xl">Statistiche</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {dateRange?.from && dateRange?.to ? (
                    <>
                      Periodo selezionato:{" "}
                      {dateRange.from.toLocaleDateString("it-IT")} –{" "}
                      {dateRange.to.toLocaleDateString("it-IT")}{" "}
                    </>
                  ) : statsCalculations ? (
                    <>
                      {formatNumber(statsCalculations.totalFiles)} file totali
                      nei {getPeriodDescription(activeTab)}
                    </>
                  ) : (
                    "Caricamento statistiche..."
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <DateRangeFilter
                  dateRange={dateRange}
                  onDateRangeChange={(range) => {
                    setDateRange(range);
                    setPrevStatsCalculations(null);
                    setActivePresetKey(range ? "custom" : "total");
                    // Default to monthly aggregation when no filters are active
                    if (!range) {
                      setAggregationView("month");
                    }
                  }}
                  onPresetChange={(preset) => {
                    setAggregationView(preset.view);
                    // Track preset key for comparison labels
                    // preset.key is one of: last7days, last30days, last3months, last6months, last12months, total
                    // When preset is total, dateRange will be cleared by the filter
                    // This helps us render clearer labels
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    setActivePresetKey(preset.key as typeof activePresetKey);
                  }}
                  dateField={dateField}
                  onDateFieldChange={(field) => setDateField(field)}
                  availableDateFields={[
                    { value: "sent_at", label: "Data invio" },
                  ]}
                  className=""
                  align="end"
                />
              </div>
            </CardHeader>
            <CardContent className="px-4">
              {isLoading ? (
                <div className="flex h-[250px] w-full items-center justify-center">
                  <div className="text-muted-foreground">
                    Caricamento grafico...
                  </div>
                </div>
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground h-[250px] w-full [&_.recharts-cartesian-axis-tick_text]:font-medium [&_.recharts-cartesian-axis-tick_text]:opacity-100"
                >
                  <BarChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                      top: 20,
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      interval={0}
                      minTickGap={0}
                      tickFormatter={(value: string) => {
                        if (!value) return value;
                        const tokens = value
                          .toLowerCase()
                          .replaceAll(",", "")
                          .split(/\s+/)
                          .filter(Boolean);
                        const monthTokens = new Set([
                          "gennaio",
                          "gen",
                          "febbraio",
                          "feb",
                          "marzo",
                          "mar",
                          "aprile",
                          "apr",
                          "maggio",
                          "mag",
                          "giugno",
                          "giu",
                          "luglio",
                          "lug",
                          "agosto",
                          "ago",
                          "settembre",
                          "set",
                          "ottobre",
                          "ott",
                          "novembre",
                          "nov",
                          "dicembre",
                          "dic",
                        ]);
                        let day: string | null = null;
                        let month: string | null = null;
                        let year: string | null = null;
                        for (const t of tokens) {
                          if (/^\d{4}$/.test(t)) year = t;
                          else if (/^\d{1,2}$/.test(t)) day = t;
                          else if (monthTokens.has(t)) month = t;
                        }
                        const monthAbbr = month
                          ? month.slice(0, 3)
                          : (tokens
                              .find((t) => monthTokens.has(t))
                              ?.slice(0, 3) ?? tokens[0]?.slice(0, 3));
                        if (day && monthAbbr) return `${day} ${monthAbbr}`;
                        if (monthAbbr && year)
                          return `${monthAbbr} ${year.slice(-2)}`;
                        return monthAbbr ?? value.slice(0, 3);
                      }}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip
                      cursor={false}
                      content={<CustomTooltipContent />}
                    />
                    <defs>
                      <linearGradient
                        id="fillDesktop"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
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
                      dataKey="desktop"
                      fill="url(#fillDesktop)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Statistics Cards */}
        {statsCalculations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-muted/20 gap-0 border-none p-0 px-1 pb-1 ring-0 shadow-none">
                <CardHeader className="p-2">
                  <CardTitle className="text-muted-foreground/90 flex items-center gap-2 px-2 text-[13px] font-medium uppercase">
                    <TrendingUp className="h-4 w-4" /> Media giornaliera
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-card ring-border h-full rounded-lg px-4 py-3 ring-1">
                  <div className="text-2xl font-medium">
                    {Math.round(
                      statsCalculations.averageFilesPerDay,
                    ).toLocaleString("it-IT")}{" "}
                    {statsCalculations.averageFilesPerDay > 1
                      ? "files"
                      : "file"}
                  </div>

                  <p className="text-[13px]">
                    <span
                      className={
                        deltaAvgDailyPrevPeriod >= 0
                          ? "font-semibold text-green-600"
                          : "font-semibold text-red-600"
                      }
                    >
                      {deltaAvgDailyPrevPeriod > 0
                        ? "+"
                        : deltaAvgDailyPrevPeriod < 0
                          ? "-"
                          : ""}
                      {Math.abs(deltaAvgDailyPrevPeriod).toLocaleString(
                        "it-IT",
                      )}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {getComparisonLabel()}
                    </span>{" "}
                  </p>

                  {/* Mini trend chart */}
                  <ChartContainer
                    config={{
                      desktop: { label: "Trend", color: "hsl(var(--chart-1))" },
                    }}
                    className={`mt-3 aspect-auto h-12 w-full [&_.recharts-cartesian-axis]:hidden [&_.recharts-cartesian-grid]:hidden ${
                      deltaAvgDailyPrevPeriod >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <AreaChart
                      data={chartData}
                      margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="fillMiniAvgDay"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="30%"
                            stopColor="currentColor"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="100%"
                            stopColor="currentColor"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="desktop"
                        stroke="currentColor"
                        fill="url(#fillMiniAvgDay)"
                        strokeWidth={1}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 gap-0 border-none p-0 px-1 pb-1 ring-0 shadow-none">
                <CardHeader className="p-2">
                  <CardTitle className="text-muted-foreground/90 flex items-center gap-2 px-2 text-[13px] font-medium uppercase">
                    <Trophy className="h-4 w-4" /> Record massimo
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-card ring-border h-full rounded-lg px-4 py-3 ring-1">
                  <div className="text-2xl font-medium">
                    {statsCalculations.maxFilesInPeriod}{" "}
                    {statsCalculations.maxFilesInPeriod > 1 ? "files" : "file"}
                  </div>
                  <p className="text-[13px]">
                    <span
                      className={
                        deltaMaxPrevPeriod >= 0
                          ? "font-semibold text-green-600"
                          : "font-semibold text-red-600"
                      }
                    >
                      {deltaMaxPrevPeriod > 0
                        ? "+"
                        : deltaMaxPrevPeriod < 0
                          ? "-"
                          : ""}
                      {Math.abs(deltaMaxPrevPeriod).toLocaleString("it-IT")}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {getComparisonLabel()}
                    </span>{" "}
                  </p>

                  {/* Mini trend chart */}
                  <ChartContainer
                    config={{
                      desktop: { label: "Trend", color: "hsl(var(--chart-2))" },
                    }}
                    className={`mt-3 aspect-auto h-12 w-full [&_.recharts-cartesian-axis]:hidden [&_.recharts-cartesian-grid]:hidden ${
                      deltaMaxPrevPeriod >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <AreaChart
                      data={chartData}
                      margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="fillMiniMax"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="30%"
                            stopColor="currentColor"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="100%"
                            stopColor="currentColor"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="desktop"
                        stroke="currentColor"
                        fill="url(#fillMiniMax)"
                        strokeWidth={1}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 gap-0 border-none p-0 px-1 pb-1 ring-0 shadow-none">
                <CardHeader className="p-2">
                  <CardTitle className="text-muted-foreground/90 flex items-center gap-2 px-2 text-[13px] font-medium uppercase">
                    <ImAttachment className="h-3.5 w-3.5" /> Totale file
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-card ring-border h-full rounded-lg px-4 py-3 ring-1">
                  <div className="text-2xl font-medium">
                    {Math.round(statsCalculations.totalFiles).toLocaleString(
                      "it-IT",
                    )}{" "}
                    {statsCalculations.totalFiles > 1 ? "files" : "file"}
                  </div>
                  <p className="text-[13px]">
                    <span
                      className={
                        deltaTotalPrevPeriod >= 0
                          ? "font-semibold text-green-600"
                          : "font-semibold text-red-600"
                      }
                    >
                      {deltaTotalPrevPeriod > 0
                        ? "+"
                        : deltaTotalPrevPeriod < 0
                          ? "-"
                          : ""}
                      {Math.abs(deltaTotalPrevPeriod).toLocaleString("it-IT")}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {getComparisonLabel()}
                    </span>{" "}
                  </p>

                  {/* Mini cumulative trend chart */}
                  <ChartContainer
                    config={{
                      desktop: { label: "Trend", color: "hsl(var(--chart-3))" },
                    }}
                    className={`mt-3 aspect-auto h-12 w-full [&_.recharts-cartesian-axis]:hidden [&_.recharts-cartesian-grid]:hidden ${
                      deltaTotalPrevPeriod >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <AreaChart
                      data={chartData.map((d, i, arr) => ({
                        ...d,
                        desktop: arr
                          .slice(0, i + 1)
                          .reduce((s, x) => s + (x.desktop as number), 0),
                      }))}
                      margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="fillMiniTotal"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="30%"
                            stopColor="currentColor"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="100%"
                            stopColor="currentColor"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="desktop"
                        stroke="currentColor"
                        fill="url(#fillMiniTotal)"
                        strokeWidth={1}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 gap-0 border-none p-0 px-1 pb-1 ring-0 shadow-none">
                <CardHeader className="p-2">
                  <CardTitle className="text-muted-foreground/90 flex items-center gap-2 px-2 text-[13px] font-medium uppercase">
                    <CalendarDays className="h-4 w-4" /> Media mensile
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-card ring-border h-full rounded-lg px-4 py-3 ring-1">
                  <div className="text-2xl font-medium">
                    {Math.round(
                      statsCalculations.averageFilesPerMonth,
                    ).toLocaleString("it-IT")}{" "}
                    {statsCalculations.averageFilesPerMonth > 1
                      ? "files"
                      : "file"}
                  </div>
                  <p className="text-[13px]">
                    <span
                      className={
                        deltaAvgMonthly >= 0
                          ? "font-semibold text-green-600"
                          : "font-semibold text-red-600"
                      }
                    >
                      {deltaAvgMonthly > 0
                        ? "+"
                        : deltaAvgMonthly < 0
                          ? "-"
                          : ""}
                      {Math.abs(deltaAvgMonthly).toLocaleString("it-IT")}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {getComparisonLabel()}
                    </span>{" "}
                  </p>

                  {/* Mini trend chart */}
                  <ChartContainer
                    config={{
                      desktop: { label: "Trend", color: "hsl(var(--chart-4))" },
                    }}
                    className={`mt-3 aspect-auto h-12 w-full [&_.recharts-cartesian-axis]:hidden [&_.recharts-cartesian-grid]:hidden ${
                      deltaAvgMonthly >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    <AreaChart
                      data={chartData}
                      margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="fillMiniAvgMonth"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="30%"
                            stopColor="currentColor"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="100%"
                            stopColor="currentColor"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="desktop"
                        stroke="currentColor"
                        fill="url(#fillMiniAvgMonth)"
                        strokeWidth={1}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Recent Shares Section with Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1">
              <RecentSharesGrid />
            </div>
            <div className="flex-shrink-0">
              <ChartPieDonutText />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
