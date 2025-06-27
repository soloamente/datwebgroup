"use client";

import { useState, useEffect } from "react";
import SharerTable from "@/components/dashboard/tables/admin/sharer-table";
import { userService, type Sharer } from "@/app/api/api";
import { toast } from "sonner";
import { StatsGrid } from "@/components/admin/stats-grid";
import {
  Users,
  UserCheck,
  UserX,
  FileSpreadsheet,
  UserPlus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateUserDialog } from "@/components/create-user-dialog";

export default function ListaSharerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [sharers, setSharers] = useState<Sharer[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [previousMonthData, setPreviousMonthData] = useState<{
    total: number;
    active: number;
    inactive: number;
    created: number;
  }>({
    total: 0,
    active: 0,
    inactive: 0,
    created: 0,
  });

  const fetchSharers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getSharers();
      setSharers(data);

      // Calculate previous month's data for comparison
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Get current month's users
      const currentMonthUsers = data.filter((sharer) => {
        const createdDate = new Date(sharer.created_at);
        return (
          createdDate.getMonth() === currentMonth &&
          createdDate.getFullYear() === currentYear
        );
      });

      // Get previous month's users
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const previousMonthUsers = data.filter((sharer) => {
        const createdDate = new Date(sharer.created_at);
        return (
          createdDate.getMonth() === previousMonth &&
          createdDate.getFullYear() === previousYear
        );
      });

      setPreviousMonthData({
        total: previousMonthUsers.length,
        active: previousMonthUsers.filter((s) => s.active).length,
        inactive: previousMonthUsers.filter((s) => !s.active).length,
        created: previousMonthUsers.length,
      });
    } catch (error) {
      console.error("Failed to fetch sharers:", error);
      toast.error("Impossibile caricare i dati degli sharer");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate percentage change
  const calculatePercentageChange = (current: number, previous: number) => {
    // If there are no members at all, return 0%
    if (current === 0) return "0%";

    // Calculate percentage of new members relative to total members
    const percentage = (previous / current) * 100;

    // Return the formatted percentage without any sign
    return `${Math.abs(percentage).toFixed(2)}%`;
  };

  // Calculate current stats
  const currentStats = {
    total: sharers.length,
    active: sharers.filter((s) => s.active).length,
    inactive: sharers.filter((s) => !s.active).length,
    created: sharers.filter((s) => {
      const createdDate = new Date(s.created_at);
      const today = new Date();
      return (
        createdDate.getMonth() === today.getMonth() &&
        createdDate.getFullYear() === today.getFullYear()
      );
    }).length,
  };

  useEffect(() => {
    void fetchSharers();
  }, []);

  const handleStatusChange = () => {
    void fetchSharers();
  };

  const handleOpenCreateDialog = () => setIsCreateDialogOpen(true);
  const handleCloseCreateDialog = () => setIsCreateDialogOpen(false);

  return (
    <main className="flex flex-col gap-4">
      <div className="flex w-full items-center justify-between py-2 md:py-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-medium md:text-4xl dark:text-white">
            Lista Sharer
          </h1>
          <p className="text-muted-foreground text-sm">
            Gestisci gli sharer registrati. Visualizza, modifica,
            attiva/disattiva o creane di nuovi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Actions dropdown for user management */}

          <Button
            className="bg-primary rounded-full text-white"
            onClick={handleOpenCreateDialog}
          >
            <Plus size={20} />
            Crea Sharer
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <StatsGrid
          stats={[
            {
              title: "Totale Sharers",
              value: currentStats.total.toString(),
              change: {
                value: calculatePercentageChange(
                  currentStats.total,
                  previousMonthData.total,
                ),
                trend:
                  currentStats.total >= previousMonthData.total ? "up" : "down",
              },
              icon: <Users size={20} />,
            },
            {
              title: "Attivi",
              value: currentStats.active.toString(),
              change: {
                value: calculatePercentageChange(
                  currentStats.active,
                  previousMonthData.active,
                ),
                trend:
                  currentStats.active >= previousMonthData.active
                    ? "up"
                    : "down",
              },
              icon: <UserCheck size={20} />,
            },
            {
              title: "Disattivati",
              value: currentStats.inactive.toString(),
              change: {
                value: calculatePercentageChange(
                  currentStats.inactive,
                  previousMonthData.inactive,
                ),
                trend:
                  currentStats.inactive >= previousMonthData.inactive
                    ? "up"
                    : "down",
              },
              icon: <UserX size={20} />,
            },
            {
              title: "Creati",
              value: currentStats.created.toString(),
              change: {
                value: calculatePercentageChange(
                  currentStats.created,
                  previousMonthData.created,
                ),
                trend:
                  currentStats.created >= previousMonthData.created
                    ? "up"
                    : "down",
              },
              icon: <UserPlus size={20} />,
            },
          ]}
        />
        <SharerTable
          data={sharers}
          isLoading={isLoading}
          onStatusChange={handleStatusChange}
        />
      </div>
      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onUserCreated={() => {
          handleCloseCreateDialog();
          void fetchSharers();
        }}
      />
    </main>
  );
}
