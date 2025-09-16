"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import {
  userService,
  type AdminLoginStatsPieData,
  type AdminDailyLoginStat,
} from "@/app/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { Pie, PieChart, Cell } from "recharts";
import {
  DateRangeFilter,
  type DateField,
} from "@/components/filters/date-range-filter";

export default function LoginStatsPieCard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminLoginStatsPieData | null>(null);
  const [animatedData, setAnimatedData] =
    useState<AdminLoginStatsPieData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [dateField, setDateField] = useState<string>("created_at");
  const [animationKey, setAnimationKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Available date fields for filtering
  const availableDateFields: DateField[] = [
    { value: "created_at", label: "Data creazione" },
    { value: "updated_at", label: "Data aggiornamento" },
  ];

  // Animation values for smooth transitions
  const qrLoginsMotion = useMotionValue(0);
  const classicLoginsMotion = useMotionValue(0);
  const totalLoginsMotion = useMotionValue(0);

  // Transform motion values to integers for display
  const animatedQrLogins = useTransform(qrLoginsMotion, (value) =>
    Math.round(value),
  );
  const animatedClassicLogins = useTransform(classicLoginsMotion, (value) =>
    Math.round(value),
  );
  const animatedTotalLogins = useTransform(totalLoginsMotion, (value) =>
    Math.round(value),
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Always use the daily stats API
        const startDate = dateRange?.from
          ? format(dateRange.from, "yyyy-MM-dd")
          : undefined;
        const endDate = dateRange?.to
          ? format(dateRange.to, "yyyy-MM-dd")
          : undefined;

        const dailyStatsRes = await userService.getAdminDailyLoginStats(
          startDate,
          endDate,
        );

        if (mounted && dailyStatsRes?.data) {
          // Filter daily stats by date range if specified
          let filteredStats = dailyStatsRes.data.daily_stats;

          if (startDate && endDate) {
            filteredStats = dailyStatsRes.data.daily_stats.filter((stat) => {
              const statDate = stat.date;
              return statDate >= startDate && statDate <= endDate;
            });
          }

          // Aggregate daily stats into pie chart data
          const aggregatedData = aggregateDailyStats(filteredStats);

          // Animate to new values
          if (data) {
            setIsAnimating(true);
            animate(qrLoginsMotion, aggregatedData.total_qr_logins, {
              duration: 0.8,
              ease: "easeOut",
            });
            animate(classicLoginsMotion, aggregatedData.total_classic_logins, {
              duration: 0.8,
              ease: "easeOut",
            });
            animate(totalLoginsMotion, aggregatedData.total_logins, {
              duration: 0.8,
              ease: "easeOut",
            });

            // Update animated data immediately for smooth chart transition
            setAnimatedData(aggregatedData);

            // Update real data after animation
            setTimeout(() => {
              if (mounted) {
                setData(aggregatedData);
                setIsAnimating(false);
              }
            }, 800);
          } else {
            // First load - set data directly
            setData(aggregatedData);
            setAnimatedData(aggregatedData);
            qrLoginsMotion.set(aggregatedData.total_qr_logins);
            classicLoginsMotion.set(aggregatedData.total_classic_logins);
            totalLoginsMotion.set(aggregatedData.total_logins);
          }

          // Trigger animation by updating key
          setAnimationKey((prev) => prev + 1);
        }
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
  }, [dateRange]);

  // Function to aggregate daily stats into pie chart format
  const aggregateDailyStats = (
    dailyStats: AdminDailyLoginStat[],
  ): AdminLoginStatsPieData => {
    const totalLogins = dailyStats.reduce(
      (sum, stat) => sum + stat.total_logins,
      0,
    );
    const totalQrLogins = dailyStats.reduce(
      (sum, stat) => sum + stat.qr_logins,
      0,
    );
    const totalClassicLogins = dailyStats.reduce(
      (sum, stat) => sum + stat.classic_logins,
      0,
    );

    const qrPercentage =
      totalLogins > 0 ? (totalQrLogins / totalLogins) * 100 : 0;
    const classicPercentage =
      totalLogins > 0 ? (totalClassicLogins / totalLogins) * 100 : 0;

    return {
      total_logins: totalLogins,
      total_qr_logins: totalQrLogins,
      total_classic_logins: totalClassicLogins,
      total_unique_users: 0, // Not used anymore
      qr_percentage: qrPercentage,
      classic_percentage: classicPercentage,
      period: {
        start: dailyStats.length > 0 ? (dailyStats[0]?.date ?? "") : "",
        end:
          dailyStats.length > 0
            ? (dailyStats[dailyStats.length - 1]?.date ?? "")
            : "",
      },
    };
  };

  const chartData = useMemo(() => {
    // Use animated data for smooth transitions
    const displayData = isAnimating ? animatedData : data;
    if (!displayData)
      return [] as { name: string; value: number; color: string }[];

    return [
      {
        name: "QR",
        value: displayData.total_qr_logins,
        color: "oklch(0.66 0.18 142)",
      },
      {
        name: "Classico",
        value: displayData.total_classic_logins,
        color: "oklch(0.66 0.18 22)",
      },
    ];
  }, [data, animatedData, isAnimating]);

  // Calculate approximate percentages for Totale login
  const totalLoginPercentage = useMemo(() => {
    if (!data || data.total_logins === 0) return 0;
    // Totale login is always 100% of itself, but we can show it as a reference
    return 100;
  }, [data]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleDateFieldChange = (field: string) => {
    setDateField(field);
  };

  const handlePresetChange = (preset: {
    key: string;
    view: "day" | "month";
  }) => {
    // Handle preset changes if needed
    console.log("Preset changed:", preset);
  };

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
              <svg
                className="h-3 w-3 sm:h-4 sm:w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Statistiche Login
            </CardTitle>
            <DateRangeFilter
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
              dateField={dateField}
              onDateFieldChange={handleDateFieldChange}
              availableDateFields={availableDateFields}
              onPresetChange={handlePresetChange}
              className="ml-auto"
            />
          </div>
        </CardHeader>
        <CardContent className="bg-card ring-border h-full rounded-xl p-3 ring-1 sm:rounded-2xl sm:p-4">
          {isLoading && (
            <div className="flex h-[180px] items-center justify-center sm:h-[220px]">
              <Skeleton className="h-32 w-32 rounded-full sm:h-40 sm:w-40" />
            </div>
          )}
          {!isLoading && error && (
            <div className="text-xs text-red-500 sm:text-sm">{error}</div>
          )}
          {!isLoading && !error && data && (
            <motion.div
              key={animationKey}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ChartContainer
                config={{}}
                className="h-[200px] w-full sm:h-[240px]"
              >
                <PieChart
                  width={200}
                  height={200}
                  className="sm:h-[240px] sm:w-[240px]"
                >
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    className="sm:innerRadius-[60px] sm:outerRadius-[90px]"
                    startAngle={90}
                    endAngle={-270}
                    animationDuration={isAnimating ? 800 : 1000}
                    animationBegin={0}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0];
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="bg-popover text-popover-foreground z-50 rounded-md border px-2 py-1 text-xs shadow"
                        >
                          {String(p?.name)}: {String(p?.value)}
                        </motion.div>
                      );
                    }}
                  />
                </PieChart>
              </ChartContainer>
            </motion.div>
          )}
          {!isLoading && !error && data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-muted-foreground mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-3 sm:gap-4"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="flex flex-col gap-2 text-xs sm:text-sm"
              >
                Totale login{" "}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="text-foreground bg-muted/20 ring-border flex items-center gap-2 rounded-md border-none p-2 font-semibold ring-1"
                >
                  {isAnimating ? (
                    <motion.span>{animatedTotalLogins}</motion.span>
                  ) : (
                    data.total_logins.toLocaleString("it-IT")
                  )}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="flex flex-col gap-2 text-xs sm:text-sm"
              >
                Login QR{" "}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="text-foreground bg-muted/20 ring-border flex items-center gap-2 rounded-md border-none p-2 font-semibold ring-1"
                >
                  {isAnimating ? (
                    <motion.span>{animatedQrLogins}</motion.span>
                  ) : (
                    data.total_qr_logins.toLocaleString("it-IT")
                  )}
                  <Separator orientation="vertical" />
                  <span className="text-muted-foreground font-medium">
                    {isAnimating ? (
                      <motion.span>
                        {Math.round(
                          (animatedQrLogins.get() /
                            Math.max(animatedTotalLogins.get(), 1)) *
                            100,
                        )}
                        %
                      </motion.span>
                    ) : (
                      Math.round(data.qr_percentage)
                    )}
                    %
                  </span>
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="flex flex-col gap-2 text-xs sm:text-sm"
              >
                Classico{" "}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                  className="text-foreground bg-muted/20 ring-border flex items-center gap-2 rounded-md border-none p-2 font-semibold ring-1"
                >
                  {isAnimating ? (
                    <motion.span>{animatedClassicLogins}</motion.span>
                  ) : (
                    data.total_classic_logins.toLocaleString("it-IT")
                  )}
                  <Separator orientation="vertical" />
                  <span className="text-muted-foreground font-medium">
                    {isAnimating ? (
                      <motion.span>
                        {Math.round(
                          (animatedClassicLogins.get() /
                            Math.max(animatedTotalLogins.get(), 1)) *
                            100,
                        )}
                        %
                      </motion.span>
                    ) : (
                      Math.round(data.classic_percentage)
                    )}
                    %
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
