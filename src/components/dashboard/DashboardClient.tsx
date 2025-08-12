"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { userService } from "@/app/api/api";
import DashboardChart from "./DashboardChart";
import StatCard from "./StatCard";
import { Chart01 } from "../charts/chart-01";
import { Chart06 } from "../charts/chart-06";
import { Chart02 } from "../charts/chart-02";
import AdminMonthlyStatsChart from "./AdminMonthlyStatsChart";
import TopSharerStatsCard from "./TopSharerStatsCard";
import LoginStatsPieCard from "./LoginStatsPieCard";
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
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [totalBatches, setTotalBatches] = useState<number>(0);
  const [badgeFiles, setBadgeFiles] = useState<{
    text: string;
    className: string;
  }>({ text: "", className: "bg-muted text-muted-foreground" });
  const [badgeBatches, setBadgeBatches] = useState<{
    text: string;
    className: string;
  }>({ text: "", className: "bg-muted text-muted-foreground" });

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
        // Fetch historical totals and monthly stats in parallel
        const [totalsRes, monthlyRes] = await Promise.all([
          userService.getAdminTotalStats(),
          userService.getAdminMonthlyStats(),
        ]);

        if (!totalsRes?.success || !totalsRes.data) {
          setError("Impossibile recuperare i totali.");
          return;
        }

        const totalFiles = totalsRes.data.total_files ?? 0;
        const totalBatches = totalsRes.data.total_batches ?? 0;
        const placeholder: DashboardData = {
          totalDocuments: totalFiles,
          sharedDocuments: 0,
          activeClients: 0,
          pendingRequests: 0,
          privateDocuments: 0,
          chartData: { labels: [], values: [] },
        };
        setData(placeholder);
        setTotalFiles(totalFiles);
        setTotalBatches(totalBatches);

        // Prefer deltas from total-stats if present (last 30 days); fallback to monthly series
        const monthly = monthlyRes?.data?.monthly_stats ?? [];
        if (
          typeof totalsRes.data.files_last_30_days === "number" &&
          typeof totalsRes.data.batches_last_30_days === "number"
        ) {
          const deltaFiles = totalsRes.data.files_last_30_days - totalFiles;
          const deltaBatches =
            totalsRes.data.batches_last_30_days - totalBatches;
          const signFiles = deltaFiles > 0 ? "+" : "";
          const signBatches = deltaBatches > 0 ? "+" : "";
          setBadgeFiles({
            text: `${signFiles}${deltaFiles} negli ultimi 30 giorni`,
            className:
              deltaFiles > 0
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : deltaFiles < 0
                  ? "bg-red-500/15 text-red-700 dark:text-red-300"
                  : "bg-muted text-muted-foreground",
          });
          setBadgeBatches({
            text: `${signBatches}${deltaBatches} negli ultimi 30 giorni`,
            className:
              deltaBatches > 0
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : deltaBatches < 0
                  ? "bg-red-500/15 text-red-700 dark:text-red-300"
                  : "bg-muted text-muted-foreground",
          });
        } else if (Array.isArray(monthly) && monthly.length >= 2) {
          const lastTwo = monthly.slice(-2);
          const prevFiles = lastTwo[0]?.file_count ?? 0;
          const currFiles = lastTwo[1]?.file_count ?? 0;
          const deltaFiles = currFiles - prevFiles;
          const signFiles = deltaFiles > 0 ? "+" : "";
          setBadgeFiles({
            text: `${signFiles}${deltaFiles} rispetto a un mese fa`,
            className:
              deltaFiles > 0
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : deltaFiles < 0
                  ? "bg-red-500/15 text-red-700 dark:text-red-300"
                  : "bg-muted text-muted-foreground",
          });

          const prevBatches = lastTwo[0]?.batch_count ?? 0;
          const currBatches = lastTwo[1]?.batch_count ?? 0;
          const deltaBatches = currBatches - prevBatches;
          const signBatches = deltaBatches > 0 ? "+" : "";
          setBadgeBatches({
            text: `${signBatches}${deltaBatches} rispetto a un mese fa`,
            className:
              deltaBatches > 0
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : deltaBatches < 0
                  ? "bg-red-500/15 text-red-700 dark:text-red-300"
                  : "bg-muted text-muted-foreground",
          });
        } else {
          setBadgeFiles({
            text: "",
            className: "bg-muted text-muted-foreground",
          });
          setBadgeBatches({
            text: "",
            className: "bg-muted text-muted-foreground",
          });
        }
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
      <div className="mx-auto">
        <div className="mb-4 flex flex-col gap-2 py-2 md:py-4">
          <h1 className="text-2xl font-medium md:text-4xl">Dashboard</h1>
        </div>

        <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-8 rounded-xl transition-colors duration-200 md:min-h-min">
          <header className="mb-0">
            <div className="flex w-full gap-4">
              <Card className="bg-muted/20 ring-border h-fit flex-1 gap-0 border-none p-0 ring-1">
                <CardHeader className="items-center justify-center p-3 uppercase">
                  <CardTitle className="text-muted-foreground text-sm">
                    Totale File condivisi
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-card ring-border flex h-full flex-col items-center justify-center gap-4 rounded-2xl p-8 ring-1">
                  {isLoading ? (
                    <Skeleton className="h-12 w-40" />
                  ) : (
                    <h1 className="text-4xl font-semibold md:text-5xl lg:text-6xl dark:text-white">
                      {totalFiles.toLocaleString("it-IT")}
                    </h1>
                  )}
                  <Badge
                    className={`h-fit w-fit rounded-full ${badgeFiles.className}`}
                  >
                    <p className="text-xs md:text-sm">{badgeFiles.text}</p>
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 ring-border h-fit flex-1 gap-0 border-none p-0 ring-1">
                <CardHeader className="items-center justify-center p-3 uppercase">
                  <CardTitle className="text-muted-foreground text-sm">
                    Totale BATCH Inviati
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-card ring-border flex h-full flex-col items-center justify-center gap-4 rounded-2xl p-8 ring-1">
                  {isLoading ? (
                    <Skeleton className="h-12 w-40" />
                  ) : (
                    <h1 className="text-4xl font-semibold md:text-5xl lg:text-6xl dark:text-white">
                      {totalBatches.toLocaleString("it-IT")}
                    </h1>
                  )}
                  <Badge
                    className={`h-fit w-fit rounded-full ${badgeBatches.className}`}
                  >
                    <p className="text-xs md:text-sm">{badgeBatches.text}</p>
                  </Badge>
                </CardContent>
              </Card>
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

            <AdminMonthlyStatsChart />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TopSharerStatsCard />
              <LoginStatsPieCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
