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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/tabs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { type DailyStat, type MonthlyStat, userService } from "@/app/api/api";
import {
  calculateStats,
  formatPercentage,
  formatNumber,
  getPeriodDescription,
} from "@/lib/stats-calculator";
import { RecentSharesGrid } from "@/components/dashboard/recent-shares-grid";
import { Skeleton } from "@/components/ui/skeleton";

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

// Loading skeleton component for the dashboard
const DashboardSkeleton = () => (
  <div className="bg-background min-h-screen">
    <div className="w-full">
      {/* Statistics Chart Skeleton */}
      <Card className="mb-6 w-full border-neutral-800 bg-neutral-900/50 text-white">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="grid gap-1.5">
            <CardTitle className="text-2xl">Record massimi</CardTitle>
            <CardDescription className="text-neutral-400">
              <Skeleton className="h-4 w-48 bg-neutral-700" />
            </CardDescription>
          </div>
          <Skeleton className="h-6 w-16 bg-neutral-700" />
        </CardHeader>
        <CardContent className="px-4">
          <Tabs value="year" className="w-full">
            <div className="px-0">
              <TabsList className="grid w-auto grid-cols-3 rounded-lg bg-neutral-800/60 p-1">
                <TabsTrigger value="week" disabled>
                  Settimana
                </TabsTrigger>
                <TabsTrigger value="month" disabled>
                  Mese
                </TabsTrigger>
                <TabsTrigger value="year" disabled>
                  Anno
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="year" className="mt-4">
              <div className="flex h-[250px] w-full items-center justify-center">
                <div className="text-neutral-400">Caricamento grafico...</div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex items-end justify-between">
          <div>
            <Skeleton className="h-8 w-20 bg-neutral-700" />
          </div>
          <div className="text-right text-sm text-neutral-400">
            <p>Ultimo aggiornamento</p>
            <p>Oggi, --:--</p>
          </div>
        </CardFooter>
      </Card>

      {/* Additional Statistics Cards Skeleton */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="border-neutral-800 bg-neutral-900/50 text-white"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24 bg-neutral-700" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-1 h-8 w-16 bg-neutral-700" />
              <Skeleton className="h-3 w-20 bg-neutral-700" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Users Section Skeleton */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-neutral-800 bg-neutral-900/50 text-white">
          <CardHeader>
            <CardTitle className="text-xl">Condivisioni recenti</CardTitle>
            <CardDescription className="text-neutral-400">
              Le tue ultime condivisioni di documenti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full bg-neutral-700" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-neutral-700" />
                    <Skeleton className="h-3 w-1/2 bg-neutral-700" />
                  </div>
                  <Skeleton className="h-6 w-20 bg-neutral-700" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [activeTab, setActiveTab] = useState<"week" | "month" | "year">("year");
  const [statsCalculations, setStatsCalculations] = useState<ReturnType<
    typeof calculateStats
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // Add a minimum loading time to ensure the skeleton is visible
        const startTime = Date.now();

        const response = await userService.getMyFileStats();

        // Ensure minimum loading time of 1 second for better UX
        const elapsedTime = Date.now() - startTime;
        const minLoadingTime = 1000;

        if (elapsedTime < minLoadingTime) {
          await new Promise((resolve) =>
            setTimeout(resolve, minLoadingTime - elapsedTime),
          );
        }

        if (!response.data) {
          return;
        }

        let data: (DailyStat | MonthlyStat)[] = [];
        if (activeTab === "week") {
          data = response.data.last_7_days;
        } else if (activeTab === "month") {
          data = response.data.last_30_days;
        } else if (activeTab === "year") {
          data = response.data.last_365_days;
        }

        const formattedData = data.map(
          (d) =>
            ({
              ...d,
              desktop: d.file_count,
              month: d.label,
            }) as ChartData,
        );
        setChartData(formattedData);

        // Calculate statistics
        const calculations = calculateStats(response.data, activeTab);
        setStatsCalculations(calculations);
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
  }, [activeTab]);

  // Show skeleton while loading
  if (isLoading) {
    return <DashboardSkeleton />;
  }

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

  return (
    <div className="bg-background min-h-screen">
      <div className="w-full">
        {/* Statistics Chart */}
        <Card className="mb-6 w-full border-neutral-800 bg-neutral-900/50 text-white">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="grid gap-1.5">
              <CardTitle className="text-2xl">Record massimi</CardTitle>
              <CardDescription className="text-neutral-400">
                {statsCalculations ? (
                  <>
                    {formatNumber(statsCalculations.totalFiles)} file totali nei{" "}
                    {getPeriodDescription(activeTab)}
                  </>
                ) : (
                  "Caricamento statistiche..."
                )}
              </CardDescription>
            </div>
            {statsCalculations && (
              <p
                className={`font-semibold ${statsCalculations.percentageChange >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {formatPercentage(statsCalculations.percentageChange)}
              </p>
            )}
          </CardHeader>
          <CardContent className="px-4">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value)}
              className="w-full"
            >
              <div className="px-0">
                <TabsList className="grid w-auto grid-cols-3 rounded-lg bg-neutral-800/60 p-1">
                  <TabsTrigger value="week">Settimana</TabsTrigger>
                  <TabsTrigger value="month">Mese</TabsTrigger>
                  <TabsTrigger value="year">Anno</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value={activeTab} className="mt-4">
                {isLoading ? (
                  <div className="flex h-[250px] w-full items-center justify-center">
                    <div className="text-neutral-400">
                      Caricamento grafico...
                    </div>
                  </div>
                ) : (
                  <ChartContainer
                    config={chartConfig}
                    className="h-[250px] w-full"
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
                        tickFormatter={(value: string) => value.slice(0, 6)}
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
                            offset="5%"
                            stopColor="var(--color-desktop)"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-desktop)"
                            stopOpacity={0.1}
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
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex items-end justify-between">
            <div>
              {statsCalculations ? (
                <p className="text-3xl leading-none font-bold">
                  {formatPercentage(statsCalculations.percentageChange)}
                </p>
              ) : (
                <p className="text-3xl leading-none font-bold">--</p>
              )}
            </div>
            <div className="text-right text-sm text-neutral-400">
              <p>Ultimo aggiornamento</p>
              <p>Oggi, {lastUpdate}</p>
            </div>
          </CardFooter>
        </Card>

        {/* Additional Statistics Cards */}
        {statsCalculations && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-neutral-800 bg-neutral-900/50 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Media giornaliera
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(statsCalculations.averageFilesPerDay)}
                </div>
                <p className="text-xs text-neutral-400">file al giorno</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Record massimo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsCalculations.maxFilesInPeriod}
                </div>
                <p className="text-xs text-neutral-400">file in un giorno</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Totale file
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(statsCalculations.totalFiles)}
                </div>
                <p className="text-xs text-neutral-400">file totali</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Media mensile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(statsCalculations.averageFilesPerMonth)}
                </div>
                <p className="text-xs text-neutral-400">file al mese</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Users Section */}
        <div className="grid grid-cols-1 gap-6">
          <RecentSharesGrid />
        </div>
      </div>
    </div>
  );
}
