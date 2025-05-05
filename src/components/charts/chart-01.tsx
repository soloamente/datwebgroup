"use client";

import { useId, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { CustomTooltipContent } from "@/components/charts/charts-extra";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const mrrData = [
  { month: "Gen 2025", actual: 3000, projected: 1200 },
  { month: "Feb 2025", actual: 4200, projected: 1800 },
  { month: "Mar 2025", actual: 5000, projected: 900 },
  { month: "Apr 2025", actual: 6300, projected: 1100 },
  { month: "Mag 2025", actual: 7100, projected: 1200 },
  { month: "Giu 2025", actual: 8000, projected: 1000 },
  { month: "Lug 2025", actual: 9000, projected: 1400 },
  { month: "Ago 2025", actual: 10100, projected: 1200 },
  { month: "Set 2025", actual: 10900, projected: 1300 },
  { month: "Ott 2025", actual: 11800, projected: 1100 },
  { month: "Nov 2025", actual: 12800, projected: 1300 },
  { month: "Dic 2025", actual: 13800, projected: 1000 },
];

const arrData = [
  { month: "Gen 2025", actual: 36000, projected: 14400 },
  { month: "Feb 2025", actual: 42000, projected: 18000 },
  { month: "Mar 2025", actual: 50000, projected: 9000 },
  { month: "Apr 2025", actual: 63000, projected: 11000 },
  { month: "Mag 2025", actual: 71000, projected: 12000 },
  { month: "Giu 2025", actual: 80000, projected: 10000 },
  { month: "Lug 2025", actual: 90000, projected: 14000 },
  { month: "Ago 2025", actual: 101000, projected: 12000 },
  { month: "Set 2025", actual: 109000, projected: 13000 },
  { month: "Ott 2025", actual: 118000, projected: 11000 },
  { month: "Nov 2025", actual: 128000, projected: 13000 },
  { month: "Dic 2025", actual: 165600, projected: 12000 },
];

const chartConfig = {
  actual: {
    label: "Scansionati",
    color: "var(--chart-1)",
  },
  projected: {
    label: "Previsti",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function Chart01() {
  const id = useId();
  const [selectedValue, setSelectedValue] = useState("off");

  const chartData = selectedValue === "on" ? arrData : mrrData;

  const firstMonth = chartData[0]?.month ?? "";
  const lastMonth = chartData[chartData.length - 1]?.month ?? "";

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <CardTitle>Processo di Digitalizzazione</CardTitle>
            <div className="flex items-start gap-2">
              <div className="text-2xl font-semibold">
                {selectedValue === "off" ? "14.393 pagine" : "82.721 pagine"}
              </div>
              <Badge className="mt-1.5 border-none bg-emerald-500/24 text-emerald-500">
                {selectedValue === "off" ? "+48,1%" : "+52,7%"}
              </Badge>
            </div>
          </div>
          <div className="inline-flex h-7 shrink-0 rounded-lg bg-black/50 p-0.5">
            <RadioGroup
              value={selectedValue}
              onValueChange={setSelectedValue}
              className="group after:border-border after:bg-background has-focus-visible:after:border-ring has-focus-visible:after:ring-ring/50 relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-xs font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:border after:shadow-xs after:transition-[translate,box-shadow] after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-focus-visible:after:ring-[3px] data-[state=off]:after:translate-x-0 data-[state=on]:after:translate-x-full"
              data-state={selectedValue}
            >
              <label className="group-data-[state=on]:text-muted-foreground/50 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-2 whitespace-nowrap transition-colors select-none">
                Mese
                <RadioGroupItem
                  id={`${id}-1`}
                  value="off"
                  className="sr-only"
                />
              </label>
              <label className="group-data-[state=off]:text-muted-foreground/50 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-2 whitespace-nowrap transition-colors select-none">
                Anno
                <RadioGroupItem id={`${id}-2`} value="on" className="sr-only" />
              </label>
            </RadioGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-60 w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-[var(--chart-1)]/15"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            maxBarSize={20}
            margin={{ left: -12, right: 12, top: 12 }}
          >
            <defs>
              <linearGradient id={`${id}-gradient`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" />
                <stop offset="100%" stopColor="var(--chart-2)" />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="2 2"
              stroke="var(--border)"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={12}
              ticks={[firstMonth, lastMonth]}
              stroke="var(--border)"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                value === 0 ? "0" : `${(value / 1000).toFixed(1)}K`
              }
            />
            <ChartTooltip
              content={
                <CustomTooltipContent
                  colorMap={{
                    actual: "var(--chart-1)",
                    projected: "var(--chart-3)",
                  }}
                  labelMap={{
                    actual: "Scansionati",
                    projected: "Previsti",
                  }}
                  dataKeys={["actual", "projected"]}
                  valueFormatter={(value) => `${value.toLocaleString()} pagine`}
                />
              }
            />
            <Bar dataKey="actual" fill={`url(#${id}-gradient)`} stackId="a" />
            <Bar
              dataKey="projected"
              fill="var(--color-projected)"
              stackId="a"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
