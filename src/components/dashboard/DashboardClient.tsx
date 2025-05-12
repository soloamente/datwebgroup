"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
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
import { FileText, Users, Clock, Lock } from "lucide-react";
import { type DashboardData } from "../../app/dashboard/admin/types";
import { getMockDashboardData } from "../../app/dashboard/admin/utils/mockData";
import DashboardChart from "./DashboardChart";
import StatCard from "./StatCard";
import { Chart01 } from "../charts/chart-01";
import { Chart06 } from "../charts/chart-06";
import { Chart02 } from "../charts/chart-02";
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
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Using mock data from utility
        const mockData = getMockDashboardData();
        setData(mockData);
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
      <div className="mx-auto p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="flex items-center justify-between py-2 md:py-4">
            <h1 className="text-2xl font-medium md:text-4xl">Dashboard</h1>
          </div>
        </div>

        <div className="bg-card min-h-[calc(100vh-6rem)] flex-1 rounded-xl p-3 transition-colors duration-200 md:min-h-min md:p-8">
          <header className="mb-6 md:mb-16">
            <h2 className="mb-3 text-base md:mb-4 md:text-lg dark:text-gray-200">
              Totale documenti condivisi
            </h2>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
              {isLoading ? (
                <Skeleton className="h-20 w-40" />
              ) : (
                <h1 className="text-4xl font-semibold md:text-5xl lg:text-8xl dark:text-white">
                  {data?.totalDocuments.toLocaleString()}
                </h1>
              )}
              <Badge className="bg-secondary-foreground h-fit w-fit rounded-full dark:bg-gray-700 dark:text-white">
                <p className="text-xs md:text-sm">+10 rispetto a un mese fa</p>
              </Badge>
            </div>
          </header>

          <div className="flex w-full flex-col justify-between gap-6 md:gap-8">
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

            <Chart01 />
            <Chart02 />
            <Chart06 />
          </div>
        </div>
      </div>
    </div>
  );
}
