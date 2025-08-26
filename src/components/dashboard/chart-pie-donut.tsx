"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import { useTheme } from "next-themes";
import {
  userService,
  type DocumentClassStats,
  getMyDocumentClasses,
  type MyDocumentClass,
} from "@/app/api/api";

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
import {
  getDocumentClassColorById,
  getDocumentClassColorByName,
} from "@/lib/class-colors";

// Generate consistent colors for document classes
// Prefer using class id when possible to align with RecentShares color mapping
const getColor = (
  classId: number | undefined,
  className: string,
  index: number,
) => {
  if (typeof classId === "number") return getDocumentClassColorById(classId);
  // Fallback to name-based hashing to keep stability if id is unavailable
  return (
    getDocumentClassColorByName(className) ?? getDocumentClassColorById(index)
  );
};

export function ChartPieDonutText() {
  const [statsData, setStatsData] = useState<DocumentClassStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docClasses, setDocClasses] = useState<MyDocumentClass[]>([]);
  const { theme } = useTheme();

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

  useEffect(() => {
    let isMounted = true;
    const loadDocClasses = async () => {
      try {
        const res = await getMyDocumentClasses();
        if (isMounted && res?.data) {
          setDocClasses(res.data);
        }
      } catch (e) {
        console.warn(
          "Impossibile caricare le classi documentali per la mappatura colori",
          e,
        );
      }
    };
    void loadDocClasses();
    return () => {
      isMounted = false;
    };
  }, []);

  // Transform API data to chart format
  const chartData = React.useMemo(() => {
    const nameToId = new Map<string, number>();
    docClasses.forEach((c) => nameToId.set(c.name, c.id));
    return statsData.map((stat, index) => {
      const id = nameToId.get(stat.class_name);
      const fill = getColor(id, stat.class_name, index);
      return {
        class: stat.class_name,
        count: stat.document_count,
        fill,
      };
    });
  }, [statsData, docClasses]);

  // Generate chart config dynamically
  const chartConfig = React.useMemo(() => {
    const nameToId = new Map<string, number>();
    docClasses.forEach((c) => nameToId.set(c.name, c.id));
    const config: ChartConfig = {
      count: {
        label: "Count",
      },
    };

    statsData.forEach((stat, index) => {
      const id = nameToId.get(stat.class_name);
      config[stat.class_name] = {
        label: stat.class_name,
        color: getColor(id, stat.class_name, index),
      };
    });

    return config;
  }, [statsData, docClasses]);

  const totalCount = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="bg-card ring-border flex flex-col border-none ring-1">
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
    <Card className="bg-card flex h-full w-[500px] flex-col">
      <CardHeader className="items-center p-0">
        <CardTitle className="text-lg">Distribuzione Classi</CardTitle>
        <CardDescription className="text-muted-foreground">
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
                    const textColor = theme === "dark" ? "#ffffff" : "#000000";
                    const mutedColor = theme === "dark" ? "#9ca3af" : "#6b7280";

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
                          className="text-2xl font-bold"
                          fill={textColor}
                        >
                          {totalCount.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/prefer-nullish-coalescing
                          y={(viewBox.cy || 0) + 20}
                          className="text-xs"
                          fill={mutedColor}
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
              className="bg-muted/10 ring-border flex w-full max-w-[400px] items-center justify-between rounded-lg p-2 ring-1"
            >
              <div className="flex items-center gap-3">
                {(() => {
                  const nameToId = new Map<string, number>();
                  docClasses.forEach((c) => nameToId.set(c.name, c.id));
                  const id = nameToId.get(stat.class_name);
                  const fill = getColor(id, stat.class_name, index);
                  return (
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-md"
                      style={{ backgroundColor: fill }}
                    />
                  );
                })()}
                <div>
                  <div className="text-sm font-medium">{stat.class_name}</div>
                  <div className="text-muted-foreground">
                    {((stat.document_count / totalCount) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-medium">
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
