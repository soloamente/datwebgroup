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
  const [activeTab, setActiveTab] = useState("year");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await userService.getMyFileStats();
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
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to fetch file stats", error.message);
        } else {
          console.error("An unknown error occurred");
        }
      }
    };
    void fetchStats();
  }, [activeTab]);

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Riepilogo
          </h1>
        </div>
        <Card className="w-full border-neutral-800 bg-neutral-900/50 text-white">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="grid gap-1.5">
              <CardTitle className="text-2xl">Record massimi</CardTitle>
              <CardDescription className="text-neutral-400">
                Aumento di 2 volte rispetto al mese scorso
              </CardDescription>
            </div>
            <p className="font-semibold text-green-500">+12.83%</p>
          </CardHeader>
          <CardContent className="px-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
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
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex items-end justify-between">
            <div>
              <p className="text-3xl leading-none font-bold">+19.23%</p>
            </div>
            <div className="text-right text-sm text-neutral-400">
              <p>Ultimo aggiornamento</p>
              <p>Oggi, 06:49</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
