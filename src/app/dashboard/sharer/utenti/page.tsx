"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ViewerTable from "@/components/dashboard/tables/sharer/viewer-table";
import { userService, type Viewer } from "@/app/api/api";
import { toast } from "sonner";
import { StatsGrid } from "@/components/admin/stats-grid";
import { Users, UserPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateViewerDialog } from "@/components/create-viewer-dialog";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";

export default function ListaViewerPage() {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { theme } = useTheme();

  // Helper functions per calcoli temporali
  const getWeekRange = (weeksAgo = 0) => {
    const now = new Date();
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Lunedì come inizio settimana

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + mondayOffset - weeksAgo * 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { start: startOfWeek, end: endOfWeek };
  };

  const getMonthRange = (monthsAgo = 0) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() - monthsAgo;

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return { start: startOfMonth, end: endOfMonth };
  };

  const calculateStats = () => {
    const total = viewers.length;

    // Calcolo totale mese scorso per confronto
    const lastMonthEnd = getMonthRange(1);
    const totalLastMonth = viewers.filter((viewer) => {
      const createdAt = new Date(viewer.created_at);
      return createdAt <= lastMonthEnd.end;
    }).length;

    // Calcoli settimanali
    const thisWeek = getWeekRange(0);
    const lastWeek = getWeekRange(1);

    const thisWeekCount = viewers.filter((viewer) => {
      const createdAt = new Date(viewer.created_at);
      return createdAt >= thisWeek.start && createdAt <= thisWeek.end;
    }).length;

    const lastWeekCount = viewers.filter((viewer) => {
      const createdAt = new Date(viewer.created_at);
      return createdAt >= lastWeek.start && createdAt <= lastWeek.end;
    }).length;

    // Calcoli mensili
    const thisMonth = getMonthRange(0);
    const lastMonth = getMonthRange(1);
    const twoMonthsAgo = getMonthRange(2);

    const thisMonthCount = viewers.filter((viewer) => {
      const createdAt = new Date(viewer.created_at);
      return createdAt >= thisMonth.start && createdAt <= thisMonth.end;
    }).length;

    const lastMonthCount = viewers.filter((viewer) => {
      const createdAt = new Date(viewer.created_at);
      return createdAt >= lastMonth.start && createdAt <= lastMonth.end;
    }).length;

    const twoMonthsAgoCount = viewers.filter((viewer) => {
      const createdAt = new Date(viewer.created_at);
      return createdAt >= twoMonthsAgo.start && createdAt <= twoMonthsAgo.end;
    }).length;

    // Calcolo percentuali
    const weeklyChange =
      lastWeekCount === 0
        ? thisWeekCount > 0
          ? 100
          : 0
        : Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100);

    const monthlyChange =
      lastMonthCount === 0
        ? thisMonthCount > 0
          ? 100
          : 0
        : Math.round(
            ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100,
          );

    const lastMonthChange =
      twoMonthsAgoCount === 0
        ? lastMonthCount > 0
          ? 100
          : 0
        : Math.round(
            ((lastMonthCount - twoMonthsAgoCount) / twoMonthsAgoCount) * 100,
          );

    const totalChange =
      totalLastMonth === 0
        ? total > 0
          ? 100
          : 0
        : Math.round(((total - totalLastMonth) / totalLastMonth) * 100);

    return {
      total,
      totalChange,
      thisWeekCount,
      weeklyChange,
      thisMonthCount,
      monthlyChange,
      lastMonthCount,
      lastMonthChange,
    };
  };

  const fetchViewers = async () => {
    setLoading(true);
    try {
      const fetchedViewers = await userService.getViewers();
      setViewers(fetchedViewers);
    } catch (err) {
      console.error("Failed to fetch viewers:", err);
      toast.error("Impossibile caricare i dati dei viewer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchViewers();
  }, []);

  const handleStatusChange = () => {
    void fetchViewers();
  };

  const handleOpenCreateDialog = () => setIsCreateDialogOpen(true);
  const handleCloseCreateDialog = () => setIsCreateDialogOpen(false);

  return (
    <>
      {!loading && viewers.length === 0 ? (
        <main className="flex flex-grow flex-col items-center justify-center gap-4 p-4 text-center">
          <Image
            src={theme === "dark" ? "/AddUser.png" : "/AddUser_LightMode.png"}
            alt="Nessun viewer"
            width={500}
            height={500}
            className="mx-auto h-72 w-auto [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent),linear-gradient(to_top,transparent,black_20%,black_80%,transparent)]"
          />
          <h3 className="mt-6 text-xl font-semibold">Nessun viewer trovato</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Crea il tuo primo viewer per iniziare.
          </p>
          <Button
            className="bg-primary text-white"
            onClick={handleOpenCreateDialog}
          >
            <Plus size={20} className="mr-2" />
            Crea utente
          </Button>
        </main>
      ) : (
        <main className="flex flex-col gap-4">
          <div className="flex w-full items-center justify-between py-2 md:py-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-medium md:text-4xl dark:text-white">
                Lista clienti
              </h1>
              <p className="text-muted-foreground text-sm">
                Gestisci i clienti registrati. Visualizza, modifica,
                attiva/disattiva o creane di nuovi.
              </p>
            </div>
            <Button
              className="bg-primary text-white"
              onClick={handleOpenCreateDialog}
            >
              <Plus size={20} />
              Crea cliente
            </Button>
          </div>
          <div className="flex flex-col gap-6">
            {(() => {
              const stats = calculateStats();
              return (
                <StatsGrid
                  stats={[
                    {
                      title: "Totale clienti",
                      value: stats.total.toString(),
                      change: {
                        value: `${Math.abs(stats.totalChange)}%`,
                        trend: stats.totalChange >= 0 ? "up" : "down",
                      },
                      icon: <Users size={20} />,
                    },
                    {
                      title: "Creati ultima settimana",
                      value: stats.thisWeekCount.toString(),
                      change: {
                        value: `${Math.abs(stats.weeklyChange)}%`,
                        trend: stats.weeklyChange >= 0 ? "up" : "down",
                      },
                      icon: <UserPlus size={20} />,
                    },
                    {
                      title: "Creati ultimo mese",
                      value: stats.thisMonthCount.toString(),
                      change: {
                        value: `${Math.abs(stats.monthlyChange)}%`,
                        trend: stats.monthlyChange >= 0 ? "up" : "down",
                      },
                      icon: <UserPlus size={20} />,
                    },
                  ]}
                />
              );
            })()}
            <ViewerTable
              data={viewers}
              isLoading={loading}
              onStatusChange={handleStatusChange}
            />
          </div>
        </main>
      )}
      <CreateViewerDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onViewerCreated={() => {
          handleCloseCreateDialog();
          void fetchViewers();
        }}
      />
    </>
  );
}
