"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import { userService, type DocumentClassStats } from "@/app/api/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Generate consistent colors for document classes
const getDocumentClassColor = (index: number) => {
  const colors = [
    "#3b82f6", // Blue
    "#10b981", // Green
    "#8b5cf6", // Purple
    "#f59e0b", // Orange
    "#ef4444", // Red
    "#06b6d4", // Cyan
    "#84cc16", // Lime
    "#f97316", // Orange
  ];
  return colors[index % colors.length];
};

export function ChartPieDonutText() {
  const [statsData, setStatsData] = useState<DocumentClassStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("Fetching document stats by class...");
        setIsLoading(true);
        setError(null);
        const response = await userService.getMyDocsStatsByClass();
        console.log("API Response:", response);
        if (response?.data) {
          setStatsData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch document stats by class:", err);
        setError(
          "Impossibile caricare le statistiche delle classi documentali.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStats();
  }, []);

  // Transform API data to chart format
  const chartData = React.useMemo(() => {
    return statsData.map((stat, index) => ({
      class: stat.class_name,
      count: stat.document_count,
      fill: getDocumentClassColor(index),
    }));
  }, [statsData]);

  // Generate chart config dynamically
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      count: {
        label: "Count",
      },
    };

    statsData.forEach((stat, index) => {
      config[stat.class_name] = {
        label: stat.class_name,
        color: getDocumentClassColor(index),
      };
    });

    return config;
  }, [statsData]);

  const totalCount = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="flex flex-col border-neutral-800 bg-neutral-900/50 text-white">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-lg">Distribuzione Classi</CardTitle>
          <CardDescription className="text-neutral-400">
            Caricamento...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex pb-0">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3 text-neutral-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-600 border-t-blue-500"></div>
              <span>Caricamento statistiche...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col border-neutral-800 bg-neutral-900/50 text-white">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-lg">Distribuzione Classi</CardTitle>
          <CardDescription className="text-neutral-400">
            Errore nel caricamento
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex h-[200px] items-center justify-center">
            <div className="text-center text-neutral-400">
              <p>{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col bg-neutral-900/50 text-white">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-lg">Distribuzione Classi</CardTitle>
          <CardDescription className="text-neutral-400">
            Nessun dato disponibile
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex w-full items-center justify-center">
            <div className="text-center text-neutral-400">
              <p>Nessuna classe documentale trovata</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full w-[500px] flex-col bg-neutral-900/50 text-white">
      <CardHeader className="items-center p-0">
        <CardTitle className="text-lg">Distribuzione Classi</CardTitle>
        <CardDescription className="text-neutral-400">
          Documenti per classe documentale
        </CardDescription>
      </CardHeader>
      <CardContent className="flex w-full flex-1 items-center justify-center p-0">
        <ChartContainer config={chartConfig} className="aspect-square w-full">
          <PieChart>
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="class"
              innerRadius={100}
              strokeWidth={10}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-white text-2xl font-bold"
                        >
                          {totalCount.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/prefer-nullish-coalescing
                          y={(viewBox.cy || 0) + 20}
                          className="fill-neutral-400 text-xs"
                        >
                          Documenti totali
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-xs">
        {/* <div className="flex items-center gap-2 leading-none font-medium text-green-400">
          {statsData.length} classi documentali{" "}
          <TrendingUp className="h-3 w-3" />
        </div> */}

        {/* Document Classes List - Compact Version */}
        <div className="flex w-full flex-col items-center justify-center space-y-2">
          {statsData.map((stat, index) => (
            <div
              key={stat.class_name}
              className="flex w-full max-w-[400px] items-center justify-between rounded-lg bg-neutral-800/50 p-2"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-md"
                  style={{ backgroundColor: getDocumentClassColor(index) }}
                ></div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {stat.class_name}
                  </div>
                  <div className="text-neutral-400">
                    {((stat.document_count / totalCount) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-medium text-white">
                  {stat.document_count.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
