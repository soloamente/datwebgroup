"use client";

import { Line } from "react-chartjs-2";
import { useTheme } from "next-themes";
import { type DashboardData } from "../../app/dashboard/admin/types";

interface DashboardChartProps {
  data: DashboardData | null;
  isMobile: boolean;
  isLoading: boolean;
}

export default function DashboardChart({
  data,
  isMobile,
  isLoading,
}: DashboardChartProps) {
  const { theme } = useTheme();

  const chartData = {
    labels: data?.chartData.labels ?? [],
    datasets: [
      {
        data: data?.chartData.values ?? [],
        borderColor: theme === "dark" ? "#fff" : "#333",
        backgroundColor: "transparent",
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: theme === "dark" ? "#fff" : "#333",
        pointHoverBackgroundColor: theme === "dark" ? "#fff" : "#333",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line
          label: (context: any) => `$${context.raw.toLocaleString()}`,
        },
        backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
        titleColor: theme === "dark" ? "#fff" : "#333",
        bodyColor: theme === "dark" ? "#fff" : "#333",
        borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
          // eslint-disable-next-line
          callback: function (value: any, index: number) {
            // eslint-disable-next-line
            return index % (isMobile ? 3 : 1) === 0 ? value : "";
          },
          color: theme === "dark" ? "#9ca3af" : "#333",
        },
      },
      y: {
        min: 0,
        max: 200000,
        ticks: {
          stepSize: 50000,
          // eslint-disable-next-line
          callback: (value: any) => (value === 0 ? "0" : `${value / 1000}`),
          font: {
            size: 10,
          },
          color: theme === "dark" ? "#9ca3af" : "#333",
        },
        grid: {
          color: theme === "dark" ? "#374151" : "#e5e7eb",
        },
      },
    },
  };

  return (
    <div className="relative h-60 md:h-80">
      {isLoading ? (
        <div className="h-full w-full animate-pulse bg-gray-100 dark:bg-gray-800"></div>
      ) : (
        <>
          <Line
            data={chartData}
            options={options}
            className="text-gray-500 dark:text-gray-400"
          />

          <div
            className={`absolute top-1/3 right-4 md:right-16 ${
              isMobile ? "hidden sm:block" : "block"
            } rounded-lg border border-gray-100 bg-white p-2 shadow-lg md:p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white`}
          >
            <div className="text-lg font-bold md:text-xl">
              {data?.totalDocuments} Documenti
            </div>
            <div className="text-xs text-gray-500 md:text-sm dark:text-gray-400">
              Oggi
            </div>
          </div>

          <div
            className={`absolute right-4 bottom-8 md:right-16 md:bottom-16 ${
              isMobile ? "hidden sm:block" : "block"
            } rounded-lg border border-gray-100 bg-white p-2 shadow-lg md:p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white`}
          >
            <div className="text-lg font-bold md:text-xl">
              {data?.totalDocuments && data.totalDocuments - 10} Documenti
            </div>
            <div className="text-xs text-gray-500 md:text-sm dark:text-gray-400">
              1 mese fa
            </div>
          </div>
        </>
      )}
    </div>
  );
}
