"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

export default function DashboardPage() {
  const [darkMode] = useState(false);
  const [isMobile] = useState(false);

  const labels = [
    "1 Jan",
    "2 Jan",
    "3 Jan",
    "4 Jan",
    "5 Jan",
    "6 Jan",
    "7 Jan",
    "8 Jan",
    "9 Jan",
    "10 Jan",
    "11 Jan",
    "12 Jan",
    "13 Jan",
    "14 Jan",
  ];

  const chartData = {
    labels,
    datasets: [
      {
        data: [
          60000, 58000, 55000, 48000, 52000, 60000, 65000, 62000, 58000, 65000,
          60000, 58000, 52000, 61490,
        ],
        borderColor: darkMode ? "#fff" : "#333",
        backgroundColor: "transparent",
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: darkMode ? "#fff" : "#333",
        pointHoverBackgroundColor: darkMode ? "#fff" : "#333",
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
          label: (context: any) => `$${context.raw.toLocaleString()}`,
        },
        backgroundColor: darkMode ? "#1f2937" : "#fff",
        titleColor: darkMode ? "#fff" : "#333",
        bodyColor: darkMode ? "#fff" : "#333",
        borderColor: darkMode ? "#374151" : "#e5e7eb",
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
          callback: function (value: any, index: number) {
            return index % (isMobile ? 3 : 1) === 0 ? value : "";
          },
          color: darkMode ? "#9ca3af" : "#333",
        },
      },
      y: {
        min: 0,
        max: 200000,
        ticks: {
          stepSize: 50000,
          callback: (value: any) => (value === 0 ? "0" : `${value / 1000}`),
          font: {
            size: 10,
          },
          color: darkMode ? "#9ca3af" : "#333",
        },
        grid: {
          color: darkMode ? "#374151" : "#e5e7eb",
        },
      },
    },
  };

  return (
    <main>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="flex items-center justify-between py-2 md:py-4">
          <h1 className="text-2xl font-medium md:text-4xl dark:text-white">
            Dashboard
          </h1>
        </div>
      </div>

      <div className="bg-muted/50 min-h-[calc(100vh-6rem)] flex-1 rounded-xl p-3 transition-colors duration-200 md:min-h-min md:p-8 dark:bg-gray-800">
        <header className="mb-6 md:mb-16">
          <h2 className="mb-3 text-base md:mb-4 md:text-lg dark:text-gray-200">
            Totale documenti condivisi
          </h2>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <h1 className="text-4xl font-semibold md:text-5xl lg:text-8xl dark:text-white">
              1516
            </h1>
            <Badge className="bg-secondary-foreground h-fit w-fit rounded-full dark:bg-gray-700 dark:text-white">
              <p className="text-xs md:text-sm">+10 rispetto a un mese fa</p>
            </Badge>
          </div>
        </header>

        <div
          id="page-content"
          className="flex w-full flex-col justify-between gap-6 md:gap-8"
        >
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-1 md:mb-8 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
            <Card className="flex h-full flex-col justify-between p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2">
                <h3 className="text-base font-medium text-gray-800 md:text-lg dark:text-white">
                  Documenti condivisi
                </h3>
              </div>
              <div className="mt-auto flex items-end justify-between">
                <h1 className="text-5xl font-semibold text-gray-900 md:text-6xl dark:text-white">
                  40
                </h1>
                <Badge className="ml-2 h-8 rounded-full border-0 bg-green-100 px-3 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  +12%
                </Badge>
              </div>
            </Card>

            <Card className="flex h-full flex-col justify-between p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2">
                <h3 className="text-base font-medium text-gray-800 md:text-lg dark:text-white">
                  Clienti attivi
                </h3>
              </div>
              <div className="mt-auto flex items-end justify-between">
                <h1 className="text-5xl font-semibold text-gray-900 md:text-6xl dark:text-white">
                  128
                </h1>
                <Badge className="ml-2 h-8 rounded-full border-0 bg-blue-100 px-3 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  +5%
                </Badge>
              </div>
            </Card>

            <Card className="flex h-full flex-col justify-between p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2">
                <h3 className="text-base font-medium text-gray-800 md:text-lg dark:text-white">
                  Richieste pendenti
                </h3>
              </div>
              <div className="mt-auto flex items-end justify-between">
                <h1 className="text-5xl font-semibold text-gray-900 md:text-6xl dark:text-white">
                  23
                </h1>
                <Badge className="ml-2 h-8 rounded-full border-0 bg-amber-100 px-3 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  +8%
                </Badge>
              </div>
            </Card>

            <Card className="flex h-full flex-col justify-between p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2">
                <h3 className="text-base font-medium text-gray-800 md:text-lg dark:text-white">
                  Documenti privati
                </h3>
              </div>
              <div className="mt-auto flex items-end justify-between">
                <h1 className="text-5xl font-semibold text-gray-900 md:text-6xl dark:text-white">
                  752
                </h1>
                <Badge className="ml-2 h-8 rounded-full border-0 bg-purple-100 px-3 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  +15%
                </Badge>
              </div>
            </Card>
          </div>

          <Tabs
            defaultValue="all"
            className="h-fit w-full max-w-full md:max-w-[210px]"
          >
            <TabsList className="w-full rounded-lg bg-[#eaeced] p-1 md:w-auto md:p-2 dark:bg-gray-700">
              <TabsTrigger
                value="all"
                className="h-8 flex-1 text-xs md:flex-none md:text-sm dark:text-white dark:data-[state=active]:bg-gray-900"
              >
                Tutti
              </TabsTrigger>
              <TabsTrigger
                value="shared"
                className="h-8 flex-1 text-xs md:flex-none md:text-sm dark:text-white dark:data-[state=active]:bg-gray-900"
              >
                Condivisi
              </TabsTrigger>
              <TabsTrigger
                value="private"
                className="dark.data-[state=active]:bg-gray-900 h-8 flex-1 text-xs md:flex-none md:text-sm dark:text-white"
              >
                Richieste
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative h-60 md:h-80">
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
              <div className="text-lg font-bold md:text-xl">1516 Documenti</div>
              <div className="text-xs text-gray-500 md:text-sm dark:text-gray-400">
                Oggi
              </div>
            </div>

            <div
              className={`absolute right-4 bottom-8 md:right-16 md:bottom-16 ${
                isMobile ? "hidden sm:block" : "block"
              } rounded-lg border border-gray-100 bg-white p-2 shadow-lg md:p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white`}
            >
              <div className="text-lg font-bold md:text-xl">1506 Documenti</div>
              <div className="text-xs text-gray-500 md:text-sm dark:text-gray-400">
                1 mese fa
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
